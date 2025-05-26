import os
import redis.asyncio as redis  # ✅ 올바른 import

# ✅ 수정 (클래스 import 후 유틸리티 함수 생성)
from app.utils.cache import Cache
def get_cache_key(*args, prefix="spitkorean"):
    parts = [str(arg) for arg in args if arg is not None]
    return f"{prefix}:{':'.join(parts)}"


class Cache:
    """캐시 관리 유틸리티"""
    
    def __init__(self, redis_client=None):
        """
        Args:
            redis_client: Redis 클라이언트 (선택적)
        """
        self.redis = redis_client
    
    async def initialize(self):
        """Redis 클라이언트 초기화"""
        if not self.redis:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
            self.redis = redis.from_url(redis_url)
    
    async def close(self):
        """Redis 클라이언트 종료"""
        if self.redis:
            await self.redis.close()
    
    async def get(self, key, default=None):
        """캐시 데이터 조회
        
        Args:
            key: 캐시 키
            default: 기본값 (선택적)
            
        Returns:
            캐시 데이터 또는 기본값
        """
        if not self.redis:
            await self.initialize()
        
        data = await self.redis.get(key)
        
        if data is None:
            return default
        
        return data
    
    async def set(self, key, value, ttl=3600):
        """캐시 데이터 저장
        
        Args:
            key: 캐시 키
            value: 저장할 값
            ttl: 유효 시간 (초, 기본값: 1시간)
        """
        if not self.redis:
            await self.initialize()
        
        await self.redis.set(key, value, ex=ttl)
    
    async def delete(self, key):
        """캐시 데이터 삭제
        
        Args:
            key: 캐시 키
        """
        if not self.redis:
            await self.initialize()
        
        await self.redis.delete(key)
    
    async def get_json(self, key, default=None):
        """JSON 형식의 캐시 데이터 조회
        
        Args:
            key: 캐시 키
            default: 기본값 (선택적)
            
        Returns:
            dict: 파싱된 JSON 데이터 또는 기본값
        """
        import json
        data = await self.get(key)
        
        if data is None:
            return default
        
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return default
    
    async def set_json(self, key, value, ttl=3600):
        """JSON 형식으로 캐시 데이터 저장
        
        Args:
            key: 캐시 키
            value: 저장할 데이터 (dict)
            ttl: 유효 시간 (초, 기본값: 1시간)
        """
        import json
        json_data = json.dumps(value)
        await self.set(key, json_data, ttl)
    
    async def increment(self, key, amount=1):
        """캐시 값 증가
        
        Args:
            key: 캐시 키
            amount: 증가량 (기본값: 1)
            
        Returns:
            int: 증가 후 값
        """
        if not self.redis:
            await self.initialize()
        
        return await self.redis.incrby(key, amount)
    
    async def decrement(self, key, amount=1):
        """캐시 값 감소
        
        Args:
            key: 캐시 키
            amount: 감소량 (기본값: 1)
            
        Returns:
            int: 감소 후 값
        """
        if not self.redis:
            await self.initialize()
        
        return await self.redis.decrby(key, amount)
    
    async def exists(self, key):
        """캐시 키 존재 여부 확인
        
        Args:
            key: 캐시 키
            
        Returns:
            bool: 존재 여부
        """
        if not self.redis:
            await self.initialize()
        
        return await self.redis.exists(key) > 0
    
    async def ttl(self, key):
        """캐시 키 만료 시간 조회
        
        Args:
            key: 캐시 키
            
        Returns:
            int: 만료 시간 (초)
        """
        if not self.redis:
            await self.initialize()
        
        return await self.redis.ttl(key)
    
    async def update_ttl(self, key, ttl=3600):
        """캐시 키 만료 시간 업데이트
        
        Args:
            key: 캐시 키
            ttl: 새 유효 시간 (초, 기본값: 1시간)
        """
        if not self.redis:
            await self.initialize()
        
        await self.redis.expire(key, ttl)
