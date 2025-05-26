"""
SpitKorean 캐시 관리자
Redis 기반 캐시 시스템
"""
import json
import logging
from typing import Any, Optional, Dict
from redis.asyncio import Redis

logger = logging.getLogger(__name__)

class CacheManager:
    """Redis 기반 캐시 관리자"""
    
    def __init__(self, redis_client: Optional[Redis] = None):
        """
        Args:
            redis_client: Redis 클라이언트 인스턴스
        """
        self.redis = redis_client
        self.fallback_cache: Dict[str, Any] = {}  # Redis 없을 때 메모리 캐시
        
    async def get(self, key: str) -> Optional[Any]:
        """캐시에서 값 조회
        
        Args:
            key: 캐시 키
            
        Returns:
            Any: 캐시된 값, 없으면 None
        """
        try:
            if self.redis:
                # Redis 사용
                value = await self.redis.get(key)
                if value:
                    try:
                        # JSON 파싱 시도
                        return json.loads(value)
                    except json.JSONDecodeError:
                        # JSON이 아니면 문자열로 반환
                        return value.decode('utf-8') if isinstance(value, bytes) else value
            else:
                # 메모리 캐시 사용 (개발용)
                value = self.fallback_cache.get(key)
                logger.warning(f"Using fallback memory cache for get: {key}")
                return value
                
            return None
            
        except Exception as e:
            logger.error(f"Cache get error for key '{key}': {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 3600):
        """캐시에 값 저장
        
        Args:
            key: 캐시 키
            value: 저장할 값
            ttl: 만료 시간(초), 기본값 1시간
        """
        try:
            # 값을 직렬화
            if isinstance(value, (dict, list)):
                serialized_value = json.dumps(value, ensure_ascii=False)
            elif isinstance(value, (str, int, float, bool)):
                serialized_value = json.dumps(value, ensure_ascii=False)
            else:
                serialized_value = str(value)
            
            if self.redis:
                # Redis 사용
                await self.redis.set(key, serialized_value, ex=ttl)
            else:
                # 메모리 캐시 사용 (개발용)
                self.fallback_cache[key] = value
                logger.warning(f"Using fallback memory cache for set: {key}")
            
            logger.debug(f"Cache set: {key} (TTL: {ttl}s)")
            
        except Exception as e:
            logger.error(f"Cache set error for key '{key}': {e}")
    
    async def delete(self, key: str):
        """캐시에서 값 삭제
        
        Args:
            key: 삭제할 캐시 키
        """
        try:
            if self.redis:
                # Redis 사용
                await self.redis.delete(key)
            else:
                # 메모리 캐시 사용 (개발용)
                self.fallback_cache.pop(key, None)
                logger.warning(f"Using fallback memory cache for delete: {key}")
            
            logger.debug(f"Cache deleted: {key}")
            
        except Exception as e:
            logger.error(f"Cache delete error for key '{key}': {e}")
    
    async def exists(self, key: str) -> bool:
        """캐시 키 존재 여부 확인
        
        Args:
            key: 확인할 캐시 키
            
        Returns:
            bool: 존재 여부
        """
        try:
            if self.redis:
                # Redis 사용
                return bool(await self.redis.exists(key))
            else:
                # 메모리 캐시 사용 (개발용)
                exists = key in self.fallback_cache
                logger.warning(f"Using fallback memory cache for exists: {key}")
                return exists
                
        except Exception as e:
            logger.error(f"Cache exists error for key '{key}': {e}")
            return False
    
    async def expire(self, key: str, ttl: int):
        """캐시 키에 만료 시간 설정
        
        Args:
            key: 캐시 키
            ttl: 만료 시간(초)
        """
        try:
            if self.redis:
                # Redis 사용
                await self.redis.expire(key, ttl)
            else:
                # 메모리 캐시는 expire 지원 안함
                logger.warning(f"Memory cache doesn't support expire for: {key}")
            
            logger.debug(f"Cache expire set: {key} (TTL: {ttl}s)")
            
        except Exception as e:
            logger.error(f"Cache expire error for key '{key}': {e}")
    
    async def clear_pattern(self, pattern: str):
        """패턴에 맞는 모든 캐시 키 삭제
        
        Args:
            pattern: 삭제할 키 패턴 (예: "user:*", "session:123:*")
        """
        try:
            if self.redis:
                # Redis 사용
                keys = await self.redis.keys(pattern)
                if keys:
                    await self.redis.delete(*keys)
                    logger.info(f"Cleared {len(keys)} cache keys matching pattern: {pattern}")
            else:
                # 메모리 캐시 사용 (개발용)
                import fnmatch
                keys_to_delete = []
                for key in self.fallback_cache.keys():
                    if fnmatch.fnmatch(key, pattern):
                        keys_to_delete.append(key)
                
                for key in keys_to_delete:
                    del self.fallback_cache[key]
                
                logger.warning(f"Using fallback memory cache for clear_pattern: {pattern}")
                logger.info(f"Cleared {len(keys_to_delete)} cache keys matching pattern: {pattern}")
                
        except Exception as e:
            logger.error(f"Cache clear pattern error for pattern '{pattern}': {e}")
    
    async def get_many(self, keys: list) -> Dict[str, Any]:
        """여러 캐시 키의 값을 한 번에 조회
        
        Args:
            keys: 조회할 캐시 키 목록
            
        Returns:
            dict: {키: 값} 형태의 딕셔너리
        """
        result = {}
        
        try:
            if self.redis:
                # Redis 사용
                values = await self.redis.mget(keys)
                for i, value in enumerate(values):
                    if value:
                        try:
                            result[keys[i]] = json.loads(value)
                        except json.JSONDecodeError:
                            result[keys[i]] = value.decode('utf-8') if isinstance(value, bytes) else value
            else:
                # 메모리 캐시 사용 (개발용)
                for key in keys:
                    if key in self.fallback_cache:
                        result[key] = self.fallback_cache[key]
                logger.warning(f"Using fallback memory cache for get_many")
                
        except Exception as e:
            logger.error(f"Cache get_many error: {e}")
            
        return result
    
    async def set_many(self, mapping: Dict[str, Any], ttl: int = 3600):
        """여러 캐시 키/값을 한 번에 저장
        
        Args:
            mapping: {키: 값} 형태의 딕셔너리
            ttl: 만료 시간(초)
        """
        try:
            if self.redis:
                # Redis 사용
                pipe = self.redis.pipeline()
                for key, value in mapping.items():
                    if isinstance(value, (dict, list)):
                        serialized_value = json.dumps(value, ensure_ascii=False)
                    else:
                        serialized_value = str(value)
                    pipe.set(key, serialized_value, ex=ttl)
                await pipe.execute()
            else:
                # 메모리 캐시 사용 (개발용)
                self.fallback_cache.update(mapping)
                logger.warning(f"Using fallback memory cache for set_many")
            
            logger.debug(f"Cache set_many: {len(mapping)} keys (TTL: {ttl}s)")
            
        except Exception as e:
            logger.error(f"Cache set_many error: {e}")
    
    async def flush_all(self):
        """모든 캐시 삭제 (주의: 개발/테스트용)"""
        try:
            if self.redis:
                # Redis 전체 플러시 (위험!)
                logger.warning("Flushing all Redis cache - this affects all data!")
                # await self.redis.flushdb()  # 현재 DB만 플러시
            else:
                # 메모리 캐시 전체 삭제
                self.fallback_cache.clear()
                logger.warning("Flushed all memory cache")
                
        except Exception as e:
            logger.error(f"Cache flush error: {e}")