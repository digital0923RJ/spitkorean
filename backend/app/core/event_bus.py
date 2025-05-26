"""
SpitKorean 이벤트 버스
Redis Pub/Sub 기반 이벤트 발행/구독 시스템
"""
import asyncio
import json
import logging
from typing import Dict, List, Callable, Optional
from datetime import datetime
from redis.asyncio import Redis

logger = logging.getLogger(__name__)

class EventBus:
    """Redis Pub/Sub 기반 이벤트 버스"""
    
    def __init__(self, redis_client: Optional[Redis] = None):
        """
        Args:
            redis_client: Redis 클라이언트 인스턴스
        """
        self.redis = redis_client
        self.subscribers: Dict[str, List[Callable]] = {}
        self.is_listening = False
        self.pubsub = None
        
    async def publish(self, event_name: str, data: dict):
        """이벤트 발행
        
        Args:
            event_name: 이벤트 이름
            data: 이벤트 데이터
        """
        try:
            event_data = {
                "event": event_name,
                "data": data,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            if self.redis:
                # Redis Pub/Sub 사용
                await self.redis.publish(
                    f"spitkorean:events:{event_name}", 
                    json.dumps(event_data, ensure_ascii=False)
                )
            else:
                # 로컬 이벤트 처리 (개발용)
                logger.warning(f"Publishing local event: {event_name}")
                await self._handle_local_event(event_name, event_data)
            
            logger.info(f"Event published: {event_name}")
            
        except Exception as e:
            logger.error(f"Event publish error: {e}")
    
    async def subscribe(self, event_name: str, callback: Callable):
        """이벤트 구독
        
        Args:
            event_name: 구독할 이벤트 이름
            callback: 이벤트 처리 콜백 함수
        """
        if event_name not in self.subscribers:
            self.subscribers[event_name] = []
        
        self.subscribers[event_name].append(callback)
        logger.info(f"Subscribed to event: {event_name}")
    
    async def unsubscribe(self, event_name: str, callback: Callable):
        """이벤트 구독 해제
        
        Args:
            event_name: 구독 해제할 이벤트 이름
            callback: 제거할 콜백 함수
        """
        if event_name in self.subscribers:
            try:
                self.subscribers[event_name].remove(callback)
                if not self.subscribers[event_name]:
                    del self.subscribers[event_name]
                logger.info(f"Unsubscribed from event: {event_name}")
            except ValueError:
                logger.warning(f"Callback not found for event: {event_name}")
    
    async def emit_user_activity(self, user_id: str, activity: str, product: str, metadata: dict = None):
        """사용자 활동 이벤트 발행
        
        Args:
            user_id: 사용자 ID
            activity: 활동 유형
            product: 상품명
            metadata: 추가 메타데이터
        """
        await self.publish("user_activity", {
            "user_id": user_id,
            "activity": activity,
            "product": product,
            "metadata": metadata or {},
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def emit_streak_update(self, user_id: str, streak_days: int):
        """연속 학습일 업데이트 이벤트 발행
        
        Args:
            user_id: 사용자 ID
            streak_days: 연속 학습일
        """
        await self.publish("streak_update", {
            "user_id": user_id,
            "streak_days": streak_days,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def emit_level_up(self, user_id: str, product: str, old_level: str, new_level: str):
        """레벨업 이벤트 발행
        
        Args:
            user_id: 사용자 ID
            product: 상품명
            old_level: 이전 레벨
            new_level: 새 레벨
        """
        await self.publish("level_up", {
            "user_id": user_id,
            "product": product,
            "old_level": old_level,
            "new_level": new_level,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def emit_achievement_unlocked(self, user_id: str, achievement_id: str):
        """업적 해제 이벤트 발행
        
        Args:
            user_id: 사용자 ID
            achievement_id: 업적 ID
        """
        await self.publish("achievement_unlocked", {
            "user_id": user_id,
            "achievement_id": achievement_id,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def start_listener(self):
        """이벤트 리스너 시작 (백그라운드 태스크)"""
        if not self.redis:
            logger.warning("Redis not available, event listener not started")
            return
            
        if self.is_listening:
            logger.warning("Event listener already running")
            return
        
        try:
            self.is_listening = True
            self.pubsub = self.redis.pubsub()
            await self.pubsub.subscribe("spitkorean:events:*")
            
            logger.info("Event listener started")
            
            async for message in self.pubsub.listen():
                if message['type'] == 'message':
                    try:
                        # 채널에서 이벤트 이름 추출
                        channel = message['channel'].decode('utf-8')
                        event_name = channel.split(':')[-1]  # spitkorean:events:event_name
                        
                        # 이벤트 데이터 파싱
                        event_data = json.loads(message['data'])
                        
                        # 이벤트 처리
                        await self._handle_event(event_name, event_data)
                        
                    except Exception as e:
                        logger.error(f"Event processing error: {e}")
                        
        except Exception as e:
            logger.error(f"Event listener error: {e}")
        finally:
            self.is_listening = False
            if self.pubsub:
                await self.pubsub.close()
                self.pubsub = None
            logger.info("Event listener stopped")
    
    async def stop_listener(self):
        """이벤트 리스너 중지"""
        self.is_listening = False
        if self.pubsub:
            await self.pubsub.close()
            self.pubsub = None
        logger.info("Event listener stop requested")
    
    async def _handle_event(self, event_name: str, event_data: dict):
        """이벤트 처리 (내부 메서드)
        
        Args:
            event_name: 이벤트 이름
            event_data: 이벤트 데이터
        """
        try:
            # 구독자들에게 이벤트 전달
            if event_name in self.subscribers:
                tasks = []
                for callback in self.subscribers[event_name]:
                    tasks.append(callback(event_data))
                
                if tasks:
                    await asyncio.gather(*tasks, return_exceptions=True)
            
            # 기본 이벤트 로깅
            logger.info(f"Event processed: {event_name}")
            
            # 특정 이벤트별 추가 처리
            await self._handle_specific_events(event_name, event_data)
            
        except Exception as e:
            logger.error(f"Event handling error for {event_name}: {e}")
    
    async def _handle_local_event(self, event_name: str, event_data: dict):
        """로컬 이벤트 처리 (Redis 없을 때)
        
        Args:
            event_name: 이벤트 이름
            event_data: 이벤트 데이터
        """
        await self._handle_event(event_name, event_data)
    
    async def _handle_specific_events(self, event_name: str, event_data: dict):
        """특정 이벤트별 추가 처리
        
        Args:
            event_name: 이벤트 이름
            event_data: 이벤트 데이터
        """
        try:
            if event_name == "user_activity":
                # 사용자 활동 통계 업데이트
                await self._update_activity_stats(event_data)
                
            elif event_name == "streak_update":
                # 연속 학습일 업데이트 처리
                await self._handle_streak_update(event_data)
                
            elif event_name == "level_up":
                # 레벨업 보상 처리
                await self._handle_level_up(event_data)
                
            elif event_name == "achievement_unlocked":
                # 업적 해제 알림 처리
                await self._handle_achievement(event_data)
                
        except Exception as e:
            logger.error(f"Specific event handling error for {event_name}: {e}")
    
    async def _update_activity_stats(self, event_data: dict):
        """사용자 활동 통계 업데이트"""
        # 실제 구현에서는 데이터베이스에 활동 로그 저장
        logger.debug(f"Activity stats updated: {event_data.get('data', {}).get('activity')}")
    
    async def _handle_streak_update(self, event_data: dict):
        """연속 학습일 업데이트 처리"""
        streak_days = event_data.get('data', {}).get('streak_days', 0)
        if streak_days in [7, 30, 100]:  # 마일스톤
            user_id = event_data.get('data', {}).get('user_id')
            await self.emit_achievement_unlocked(user_id, f"streak_{streak_days}_days")
    
    async def _handle_level_up(self, event_data: dict):
        """레벨업 보상 처리"""
        # 실제 구현에서는 레벨업 보상 지급
        logger.info(f"Level up processed: {event_data.get('data', {}).get('new_level')}")
    
    async def _handle_achievement(self, event_data: dict):
        """업적 해제 알림 처리"""
        # 실제 구현에서는 푸시 알림 또는 이메일 발송
        logger.info(f"Achievement unlocked: {event_data.get('data', {}).get('achievement_id')}")
    
    async def get_event_stats(self) -> dict:
        """이벤트 통계 조회
        
        Returns:
            dict: 이벤트 통계 정보
        """
        return {
            "is_listening": self.is_listening,
            "subscribers_count": len(self.subscribers),
            "subscribed_events": list(self.subscribers.keys()),
            "redis_connected": self.redis is not None
        }