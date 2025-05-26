"""
게임화 서비스 - SpitKorean의 게임화 요소를 관리하는 서비스
XP 관리, 스트릭 추적, 리그 진행, 배지 시스템 등을 담당
"""

import logging
from datetime import datetime 
from typing import Dict

from app.core.event_bus import EventBus
from app.core.cache_manager import CacheManager
from app.models.common import XPAction
from app.utils.logger import LogManager

logger = LogManager().logger

class GamificationService:
    """게임화 서비스: 사용자 동기부여 시스템 관리"""

    def __init__(self, db, cache_manager: CacheManager, event_bus: EventBus):
        """
        게임화 서비스 초기화
        
        Args:
            db: MongoDB 데이터베이스 클라이언트
            cache_manager: 캐시 관리자
            event_bus: 이벤트 버스
        """
        self.db = db
        self.cache = cache_manager
        self.event_bus = event_bus
        self.xp_collection = db.gamification
        
        # XP 액션 점수 설정
        self.xp_actions = {
            XPAction.DAILY_LOGIN: 5,            # 일일 로그인
            XPAction.COMPLETE_LESSON: 10,       # 단일 레슨 완료
            XPAction.PERFECT_SCORE: 20,         # 만점 획득
            XPAction.STREAK_MILESTONE: 50,      # 연속 학습 마일스톤 (7일, 30일, 100일)
            XPAction.LEVEL_UP: 100,             # 레벨 업
            XPAction.CHALLENGE_COMPLETE: 30,    # 챌린지 완료
            XPAction.GRAMMAR_MASTERY: 15,       # 문법 마스터
            XPAction.PRONUNCIATION_PERFECT: 25, # 발음 완벽
            XPAction.SHARE_PROGRESS: 5,         # 진행 상황 공유
            XPAction.INVITE_FRIEND: 10          # 친구 초대
        }
        
        # 리그 등급 및 승급 요구사항
        self.leagues = {
            "bronze": {"min_xp": 0, "promotion_xp": 500},
            "silver": {"min_xp": 500, "promotion_xp": 1500},
            "gold": {"min_xp": 1500, "promotion_xp": 3000},
            "diamond": {"min_xp": 3000, "promotion_xp": None}
        }
        
        # 배지 정의
        self.achievements = {
            "7_day_streak": {"name": "7일 연속 학습", "description": "7일 연속으로 학습했어요!", "icon": "fire_7"},
            "30_day_streak": {"name": "30일 연속 학습", "description": "대단해요! 30일 연속 학습!", "icon": "fire_30"},
            "100_day_streak": {"name": "100일 연속 학습", "description": "놀라워요! 100일 연속 학습 달성!", "icon": "fire_100"},
            "grammar_expert": {"name": "문법 전문가", "description": "50개 이상의 문법 포인트 마스터", "icon": "grammar"},
            "pronunciation_master": {"name": "발음 마스터", "description": "95% 이상의 발음 정확도 달성", "icon": "mic"},
            "vocabulary_hero": {"name": "어휘 영웅", "description": "500개 이상의 단어 마스터", "icon": "book"},
            "social_butterfly": {"name": "소셜 버터플라이", "description": "5명 이상의 친구 초대", "icon": "butterfly"},
            "test_ace": {"name": "시험 에이스", "description": "TOPIK 모의고사 만점 달성", "icon": "crown"},
            "consistent_learner": {"name": "꾸준한 학습자", "description": "12주 연속 주간 목표 달성", "icon": "calendar"}
        }
    
    async def award_xp(self, user_id: str, action: XPAction, multiplier: float = 1.0) -> Dict:
        """
        사용자에게 XP 포인트 부여
        
        Args:
            user_id: 사용자 ID
            action: 수행한 액션 유형
            multiplier: XP 배수 (프리미엄 사용자 혜택 등)
            
        Returns:
            업데이트된 XP 및 레벨 정보
        """
        if action not in self.xp_actions:
            logger.warning(f"Unknown XP action attempted: {action}")
            return
            
        xp_value = int(self.xp_actions[action] * multiplier)
        
        # XP 업데이트
        result = await self.xp_collection.update_one(
            {"userId": user_id},
            {"$inc": {"totalXP": xp_value, "weeklyXP": xp_value}},
            upsert=True
        )
        
        # 사용자 XP 정보 조회
        user_gamification = await self.xp_collection.find_one({"userId": user_id})
        
        # 이벤트 발행 (XP 획득 이벤트)
        await self.event_bus.publish("xp_awarded", {
            "user_id": user_id,
            "action": action,
            "xp_awarded": xp_value,
            "total_xp": user_gamification["totalXP"]
        })
        
        # 리그 체크 및 업데이트
        current_league, is_promoted = await self._check_league_promotion(user_id, user_gamification["totalXP"])
        
        if is_promoted:
            await self.event_bus.publish("league_promotion", {
                "user_id": user_id,
                "new_league": current_league
            })
        
        return {
            "awarded_xp": xp_value,
            "total_xp": user_gamification["totalXP"],
            "weekly_xp": user_gamification["weeklyXP"],
            "current_league": current_league,
            "was_promoted": is_promoted
        }
    
    async def update_streak(self, user_id: str) -> Dict:
        """
        사용자의 연속 학습일 업데이트
        
        Args:
            user_id: 사용자 ID
            
        Returns:
            업데이트된 스트릭 정보
        """
        # 현재 날짜
        today = datetime.utcnow().date()
        
        # 사용자 스트릭 정보 조회
        user_gamification = await self.xp_collection.find_one({"userId": user_id})
        
        if not user_gamification:
            # 신규 사용자인 경우 초기화
            streak_data = {
                "streakDays": 1,
                "lastActivityDate": today.isoformat(),
                "longestStreak": 1
            }
            await self.xp_collection.update_one(
                {"userId": user_id},
                {"$set": streak_data},
                upsert=True
            )
            return streak_data
        
        # 마지막 활동 날짜
        last_activity = datetime.fromisoformat(user_gamification.get("lastActivityDate", today.isoformat())).date()
        
        # 날짜 차이 계산
        date_diff = (today - last_activity).days
        
        current_streak = user_gamification.get("streakDays", 0)
        longest_streak = user_gamification.get("longestStreak", 0)
        
        if date_diff == 0:
            # 오늘 이미 학습한 경우
            return {
                "streakDays": current_streak,
                "lastActivityDate": today.isoformat(),
                "longestStreak": longest_streak
            }
            
        elif date_diff == 1:
            # 연속 학습 유지
            new_streak = current_streak + 1
            
            # 스트릭 마일스톤 확인
            if new_streak in [7, 30, 100]:
                # 마일스톤 달성 시 XP 보너스
                await self.award_xp(user_id, XPAction.STREAK_MILESTONE)
                
                # 마일스톤별 배지 부여
                if new_streak == 7:
                    await self.award_achievement(user_id, "7_day_streak")
                elif new_streak == 30:
                    await self.award_achievement(user_id, "30_day_streak")
                elif new_streak == 100:
                    await self.award_achievement(user_id, "100_day_streak")
            
            # 최장 스트릭 업데이트
            new_longest = max(longest_streak, new_streak)
            
            # DB 업데이트
            await self.xp_collection.update_one(
                {"userId": user_id},
                {"$set": {
                    "streakDays": new_streak,
                    "lastActivityDate": today.isoformat(),
                    "longestStreak": new_longest
                }}
            )
            
            return {
                "streakDays": new_streak,
                "lastActivityDate": today.isoformat(),
                "longestStreak": new_longest
            }
            
        else:
            # 스트릭 중단, 새로 시작
            await self.xp_collection.update_one(
                {"userId": user_id},
                {"$set": {
                    "streakDays": 1,
                    "lastActivityDate": today.isoformat()
                }}
            )
            
            return {
                "streakDays": 1,
                "lastActivityDate": today.isoformat(),
                "longestStreak": longest_streak
            }
    
    async def _check_league_promotion(self, user_id: str, total_xp: int) -> tuple:
        """
        사용자의 리그 승급 여부 확인
        
        Args:
            user_id: 사용자 ID
            total_xp: 사용자 총 XP
            
        Returns:
            (현재 리그, 승급 여부)
        """
        # 현재 리그 조회
        user_gamification = await self.xp_collection.find_one({"userId": user_id})
        current_league = user_gamification.get("currentLeague", "bronze")
        
        # 리그 승급 확인
        for league, requirements in sorted(self.leagues.items(), key=lambda x: x[1]["min_xp"]):
            if requirements["min_xp"] <= total_xp and (
                requirements["promotion_xp"] is None or total_xp < requirements["promotion_xp"]):
                # 리그 변경됨
                if league != current_league:
                    await self.xp_collection.update_one(
                        {"userId": user_id},
                        {"$set": {"currentLeague": league}}
                    )
                    return league, True
                return league, False
                
        # 기본은 브론즈
        return "bronze", False
    
    async def get_user_ranking(self, user_id: str) -> Dict:
        """
        사용자의 리그 내 순위 조회
        
        Args:
            user_id: 사용자 ID
            
        Returns:
            순위 정보
        """
        user_gamification = await self.xp_collection.find_one({"userId": user_id})
        
        if not user_gamification:
            return {"rank": 0, "total_users": 0, "percentile": 0}
            
        current_league = user_gamification.get("currentLeague", "bronze")
        weekly_xp = user_gamification.get("weeklyXP", 0)
        
        # 캐시 키
        cache_key = f"league_rankings:{current_league}"
        
        # 캐시된 리그 랭킹 확인
        cached_ranking = await self.cache.get(cache_key)
        
        if not cached_ranking:
            # 동일 리그 사용자들의 주간 XP 내림차순 정렬
            users_in_league = await self.xp_collection.find(
                {"currentLeague": current_league}
            ).sort("weeklyXP", -1).to_list(length=None)
            
            # 랭킹 생성
            ranking = [{"userId": user["userId"], "weeklyXP": user.get("weeklyXP", 0)} 
                      for user in users_in_league]
            
            # 캐시에 저장 (1시간)
            await self.cache.set(cache_key, ranking, ttl=3600)
        else:
            ranking = cached_ranking
        
        # 사용자 순위 계산
        total_users = len(ranking)
        user_rank = next((idx + 1 for idx, r in enumerate(ranking) 
                          if r["userId"] == user_id), total_users)
        
        # 백분위 계산
        percentile = round(((total_users - user_rank) / total_users) * 100) if total_users > 0 else 0
        
        return {
            "rank": user_rank,
            "total_users": total_users,
            "percentile": percentile,
            "weekly_xp": weekly_xp,
            "league": current_league
        }
    
    async def award_achievement(self, user_id: str, achievement_id: str) -> Dict:
        """
        사용자에게 특정 배지 부여
        
        Args:
            user_id: 사용자 ID
            achievement_id: 배지 ID
            
        Returns:
            배지 정보
        """
        if achievement_id not in self.achievements:
            logger.warning(f"Unknown achievement ID: {achievement_id}")
            return None
            
        achievement = self.achievements[achievement_id]
        
        # 이미 취득한 배지인지 확인
        user_gamification = await self.xp_collection.find_one({"userId": user_id})
        user_achievements = user_gamification.get("achievements", [])
        
        if achievement_id in user_achievements:
            return {"already_awarded": True, "achievement": achievement}
            
        # 배지 추가
        await self.xp_collection.update_one(
            {"userId": user_id},
            {"$push": {"achievements": achievement_id},
             "$currentDate": {"achievementsUpdated": True}}
        )
        
        # 배지 획득 이벤트 발행
        await self.event_bus.publish("achievement_awarded", {
            "user_id": user_id,
            "achievement_id": achievement_id,
            "achievement_name": achievement["name"]
        })
        
        return {
            "already_awarded": False,
            "achievement": achievement
        }
    
    async def reset_weekly_rankings(self) -> None:
        """
        주간 랭킹 초기화 (일요일 자정에 실행)
        """
        # 모든 사용자의 주간 XP 초기화
        await self.xp_collection.update_many(
            {},
            {"$set": {"weeklyXP": 0, "weeklyRankingReset": datetime.utcnow().isoformat()}}
        )
        
        # 리그별 랭킹 캐시 삭제
        for league in self.leagues.keys():
            await self.cache.delete(f"league_rankings:{league}")
            
        logger.info("Weekly rankings have been reset")
        
        # 이벤트 발행
        await self.event_bus.publish("weekly_rankings_reset", {
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def get_user_stats(self, user_id: str) -> Dict:
        """
        사용자의 게임화 통계 종합 조회
        
        Args:
            user_id: 사용자 ID
            
        Returns:
            종합 통계 정보
        """
        user_gamification = await self.xp_collection.find_one({"userId": user_id})
        
        if not user_gamification:
            # 신규 사용자 기본값
            return {
                "totalXP": 0,
                "weeklyXP": 0,
                "streakDays": 0,
                "longestStreak": 0,
                "currentLeague": "bronze",
                "achievements": [],
                "ranking": {"rank": 0, "total_users": 0, "percentile": 0}
            }
            
        # 랭킹 정보 조회
        ranking = await self.get_user_ranking(user_id)
        
        # 배지 상세 정보
        achievement_ids = user_gamification.get("achievements", [])
        achievements = [
            {**self.achievements[ach_id], "id": ach_id}
            for ach_id in achievement_ids
            if ach_id in self.achievements
        ]
        
        return {
            "totalXP": user_gamification.get("totalXP", 0),
            "weeklyXP": user_gamification.get("weeklyXP", 0),
            "streakDays": user_gamification.get("streakDays", 0),
            "longestStreak": user_gamification.get("longestStreak", 0),
            "currentLeague": user_gamification.get("currentLeague", "bronze"),
            "achievements": achievements,
            "ranking": ranking
        }
