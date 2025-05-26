"""
SpitKorean 사용량 제한 관리자
Redis 기반 일일 사용량 제한 및 추적
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional
from redis.asyncio import Redis

logger = logging.getLogger(__name__)

class UsageLimiter:
    """Redis 기반 사용량 제한 관리자"""
    
    def __init__(self, redis_client: Optional[Redis] = None):
        """
        Args:
            redis_client: Redis 클라이언트 인스턴스
        """
        self.redis = redis_client
        self.fallback_cache: Dict[str, Dict] = {}  # Redis 없을 때 메모리 캐시
        
    async def check_limit(self, user_id: str, product: str, daily_limit: int) -> bool:
        """사용량 제한 확인
        
        Args:
            user_id: 사용자 ID
            product: 상품명 (talk, drama, test, journey)
            daily_limit: 일일 사용 제한
            
        Returns:
            bool: 사용 가능 여부
        """
        try:
            today = datetime.utcnow().date().isoformat()
            key = f"usage:{user_id}:{product}:{today}"
            
            if self.redis:
                # Redis 사용
                current_usage = await self.redis.get(key)
                current_usage = int(current_usage) if current_usage else 0
            else:
                # 메모리 캐시 사용 (개발용)
                current_usage = self.fallback_cache.get(key, 0)
                logger.warning("Using fallback memory cache for usage limiter")
            
            can_use = current_usage < daily_limit
            logger.info(f"Usage check - User: {user_id}, Product: {product}, "
                       f"Current: {current_usage}/{daily_limit}, Can use: {can_use}")
            
            return can_use
            
        except Exception as e:
            logger.error(f"Usage limit check error: {e}")
            # 에러 시 기본적으로 허용
            return True
    
    async def increment_usage(self, user_id: str, product: str):
        """사용량 증가
        
        Args:
            user_id: 사용자 ID
            product: 상품명
        """
        try:
            today = datetime.utcnow().date().isoformat()
            key = f"usage:{user_id}:{product}:{today}"
            
            if self.redis:
                # Redis 사용
                await self.redis.incr(key)
                await self.redis.expire(key, 86400)  # 24시간 후 만료
            else:
                # 메모리 캐시 사용 (개발용)
                self.fallback_cache[key] = self.fallback_cache.get(key, 0) + 1
                logger.warning("Using fallback memory cache for usage increment")
            
            logger.info(f"Usage incremented - User: {user_id}, Product: {product}")
            
        except Exception as e:
            logger.error(f"Usage increment error: {e}")
    
    async def get_remaining(self, user_id: str, product: str, daily_limit: int) -> int:
        """남은 사용량 조회
        
        Args:
            user_id: 사용자 ID
            product: 상품명
            daily_limit: 일일 사용 제한
            
        Returns:
            int: 남은 사용량
        """
        try:
            today = datetime.utcnow().date().isoformat()
            key = f"usage:{user_id}:{product}:{today}"
            
            if self.redis:
                # Redis 사용
                current_usage = await self.redis.get(key)
                current_usage = int(current_usage) if current_usage else 0
            else:
                # 메모리 캐시 사용 (개발용)
                current_usage = self.fallback_cache.get(key, 0)
                logger.warning("Using fallback memory cache for usage remaining")
            
            remaining = max(0, daily_limit - current_usage)
            logger.info(f"Remaining usage - User: {user_id}, Product: {product}, "
                       f"Remaining: {remaining}")
            
            return remaining
            
        except Exception as e:
            logger.error(f"Get remaining usage error: {e}")
            # 에러 시 전체 한도 반환
            return daily_limit
    
    async def reset_daily_usage(self, user_id: str, product: str):
        """특정 사용자의 일일 사용량 초기화
        
        Args:
            user_id: 사용자 ID
            product: 상품명
        """
        try:
            today = datetime.utcnow().date().isoformat()
            key = f"usage:{user_id}:{product}:{today}"
            
            if self.redis:
                await self.redis.delete(key)
            else:
                self.fallback_cache.pop(key, None)
            
            logger.info(f"Daily usage reset - User: {user_id}, Product: {product}")
            
        except Exception as e:
            logger.error(f"Reset daily usage error: {e}")
    
    async def get_usage_stats(self, user_id: str, product: str) -> Dict:
        """사용량 통계 조회
        
        Args:
            user_id: 사용자 ID
            product: 상품명
            
        Returns:
            dict: 사용량 통계 정보
        """
        try:
            today = datetime.utcnow().date()
            stats = {}
            
            # 최근 7일간 사용량 조회
            for i in range(7):
                date = (today - timedelta(days=i)).isoformat()
                key = f"usage:{user_id}:{product}:{date}"
                
                if self.redis:
                    usage = await self.redis.get(key)
                    usage = int(usage) if usage else 0
                else:
                    usage = self.fallback_cache.get(key, 0)
                
                stats[date] = usage
            
            return stats
            
        except Exception as e:
            logger.error(f"Get usage stats error: {e}")
            return {}
    
    async def cleanup_expired_cache(self):
        """만료된 캐시 정리 (메모리 캐시용)"""
        if not self.redis:
            try:
                today = datetime.utcnow().date().isoformat()
                expired_keys = []
                
                for key in self.fallback_cache.keys():
                    if key.startswith("usage:") and today not in key:
                        expired_keys.append(key)
                
                for key in expired_keys:
                    del self.fallback_cache[key]
                
                if expired_keys:
                    logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")
                    
            except Exception as e:
                logger.error(f"Cache cleanup error: {e}")