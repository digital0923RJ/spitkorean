import os
from datetime import datetime, timedelta
import json
from bson.objectid import ObjectId

class AnalyticsService:
    """분석 서비스 - 사용자 활동 및 학습 분석"""
    
    def __init__(self, db_client):
        """
        Args:
            db_client: 데이터베이스 클라이언트
        """
        self.db = db_client
    
    async def log_activity(self, user_id, activity_type, product=None, metadata=None):
        """사용자 활동 로깅
        
        Args:
            user_id: 사용자 ID
            activity_type: 활동 유형 (login, talk_chat, drama_complete, test_complete, journey_complete, subscribe, cancel)
            product: 관련 상품 (선택적)
            metadata: 추가 메타데이터 (선택적)
            
        Returns:
            str: 로그 ID
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        activity_log = {
            "userId": user_id,
            "activity": activity_type,
            "timestamp": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        
        if product:
            activity_log["product"] = product
            
        if metadata:
            activity_log["metadata"] = metadata
        
        result = await self.db["activity_logs"].insert_one(activity_log)
        return str(result.inserted_id)
    
    async def get_user_activities(self, user_id, limit=50, skip=0):
        """사용자 활동 기록 조회
        
        Args:
            user_id: 사용자 ID
            limit: 조회 개수 (기본값: 50)
            skip: 건너뛸 개수 (기본값: 0)
            
        Returns:
            list: 활동 기록 목록
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        cursor = self.db["activity_logs"].find(
            {"userId": user_id}
        ).sort("timestamp", -1).skip(skip).limit(limit)
        
        activities = await cursor.to_list(length=None)
        
        # 응답 데이터 가공
        formatted_activities = []
        for activity in activities:
            formatted_activities.append({
                "activity_id": str(activity.get("_id")),
                "activity_type": activity.get("activity"),
                "product": activity.get("product"),
                "timestamp": activity.get("timestamp").isoformat() if "timestamp" in activity else None,
                "metadata": activity.get("metadata")
            })
        
        return formatted_activities
    
    async def get_user_stats(self, user_id):
        """사용자 통계 정보 조회
        
        Args:
            user_id: 사용자 ID
            
        Returns:
            dict: 통계 정보
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        # 활동 유형별 통계
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": "$activity",
                "count": {"$sum": 1},
                "last_activity": {"$max": "$timestamp"}
            }},
            {"$sort": {"count": -1}}
        ]
        
        activity_stats = await self.db["activity_logs"].aggregate(pipeline).to_list(length=None)
        
        # 상품별 통계
        pipeline = [
            {"$match": {"userId": user_id, "product": {"$ne": None}}},
            {"$group": {
                "_id": "$product",
                "count": {"$sum": 1},
                "last_activity": {"$max": "$timestamp"}
            }},
            {"$sort": {"count": -1}}
        ]
        
        product_stats = await self.db["activity_logs"].aggregate(pipeline).to_list(length=None)
        
        # 일별 활동 통계 (최근 30일)
        pipeline = [
            {"$match": {"userId": user_id, "timestamp": {"$gte": datetime.utcnow() - timedelta(days=30)}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        daily_stats = await self.db["activity_logs"].aggregate(pipeline).to_list(length=None)
        
        # 도메인별 통계 정보 조회
        talk_stats = await self._get_talk_stats(user_id)
        drama_stats = await self._get_drama_stats(user_id)
        test_stats = await self._get_test_stats(user_id)
        journey_stats = await self._get_journey_stats(user_id)
        
        return {
            "activity_stats": activity_stats,
            "product_stats": product_stats,
            "daily_stats": daily_stats,
            "talk": talk_stats,
            "drama": drama_stats,
            "test": test_stats,
            "journey": journey_stats,
            "total_activities": sum(stat.get("count", 0) for stat in activity_stats)
        }
    
    async def _get_talk_stats(self, user_id):
        """Talk Like You Mean It 통계 정보 조회
        
        Args:
            user_id: 사용자 ID
            
        Returns:
            dict: 통계 정보
        """
        # 대화 세션 수
        session_count = await self.db["chat_logs"].count_documents({"userId": user_id})
        
        # 대화 메시지 수
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$project": {
                "message_count": {"$size": {"$ifNull": ["$messages", []]}}
            }},
            {"$group": {
                "_id": None,
                "total_messages": {"$sum": "$message_count"}
            }}
        ]
        
        message_result = await self.db["chat_logs"].aggregate(pipeline).to_list(length=None)
        message_count = message_result[0].get("total_messages", 0) if message_result else 0
        
        # 레벨별 대화 수
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": "$level",
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        level_stats = await self.db["chat_logs"].aggregate(pipeline).to_list(length=None)
        
        return {
            "session_count": session_count,
            "message_count": message_count,
            "level_stats": level_stats
        }
    
    async def _get_drama_stats(self, user_id):
        """Drama Builder 통계 정보 조회
        
        Args:
            user_id: 사용자 ID
            
        Returns:
            dict: 통계 정보
        """
        # 드라마 진행 수
        progress_count = await self.db["drama_progress"].count_documents({"userId": user_id})
        
        # 완료한 문장 수
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$project": {
                "completed_count": {"$size": {"$ifNull": ["$completedSentences", []]}}
            }},
            {"$group": {
                "_id": None,
                "total_completed": {"$sum": "$completed_count"}
            }}
        ]
        
        completed_result = await self.db["drama_progress"].aggregate(pipeline).to_list(length=None)
        completed_count = completed_result[0].get("total_completed", 0) if completed_result else 0
        
        # 레벨별 진행 수
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": "$level",
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        level_stats = await self.db["drama_progress"].aggregate(pipeline).to_list(length=None)
        
        return {
            "progress_count": progress_count,
            "completed_count": completed_count,
            "level_stats": level_stats
        }
    
    async def _get_test_stats(self, user_id):
        """Test & Study 통계 정보 조회
        
        Args:
            user_id: 사용자 ID
            
        Returns:
            dict: 통계 정보
        """
        # 테스트 결과 수
        result_count = await self.db["test_results"].count_documents({"userId": user_id})
        
        # 평균 점수
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": None,
                "avg_score": {"$avg": "$score"}
            }}
        ]
        
        score_result = await self.db["test_results"].aggregate(pipeline).to_list(length=None)
        avg_score = score_result[0].get("avg_score", 0) if score_result else 0
        
        # 레벨별 테스트 수
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": "$level",
                "count": {"$sum": 1},
                "avg_score": {"$avg": "$score"}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        level_stats = await self.db["test_results"].aggregate(pipeline).to_list(length=None)
        
        # 유형별 테스트 수
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": "$testType",
                "count": {"$sum": 1},
                "avg_score": {"$avg": "$score"}
            }},
            {"$sort": {"count": -1}}
        ]
        
        type_stats = await self.db["test_results"].aggregate(pipeline).to_list(length=None)
        
        return {
            "result_count": result_count,
            "avg_score": avg_score,
            "level_stats": level_stats,
            "type_stats": type_stats
        }
    
    async def _get_journey_stats(self, user_id):
        """Korean Journey 통계 정보 조회
        
        Args:
            user_id: 사용자 ID
            
        Returns:
            dict: 통계 정보
        """
        # 리딩 기록 수
        history_count = await self.db["reading_history"].count_documents({"userId": user_id})
        
        # 평균 발음 점수
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": None,
                "avg_pronunciation": {"$avg": "$pronunciationScore"}
            }}
        ]
        
        pronunciation_result = await self.db["reading_history"].aggregate(pipeline).to_list(length=None)
        avg_pronunciation = pronunciation_result[0].get("avg_pronunciation", 0) if pronunciation_result else 0
        
        # 레벨별 리딩 수
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": "$level",
                "count": {"$sum": 1},
                "avg_pronunciation": {"$avg": "$pronunciationScore"},
                "avg_reading_speed": {"$avg": "$readingSpeed"}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        level_stats = await self.db["reading_history"].aggregate(pipeline).to_list(length=None)
        
        # 총 문장 수
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": None,
                "total_sentences": {"$sum": "$completedSentences"}
            }}
        ]
        
        sentences_result = await self.db["reading_history"].aggregate(pipeline).to_list(length=None)
        total_sentences = sentences_result[0].get("total_sentences", 0) if sentences_result else 0
        
        return {
            "history_count": history_count,
            "avg_pronunciation": avg_pronunciation,
            "total_sentences": total_sentences,
            "level_stats": level_stats
        }
    
    async def get_learning_report(self, user_id, period="week"):
        """학습 리포트 생성
        
        Args:
            user_id: 사용자 ID
            period: 기간 (day, week, month, year)
            
        Returns:
            dict: 학습 리포트
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        # 기간 설정
        if period == "day":
            start_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=datetime.utcnow().weekday())
        elif period == "month":
            start_date = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == "year":
            start_date = datetime.utcnow().replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=7)
        
        # 활동 통계
        pipeline = [
            {"$match": {"userId": user_id, "timestamp": {"$gte": start_date}}},
            {"$group": {
                "_id": "$activity",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}}
        ]
        
        activity_stats = await self.db["activity_logs"].aggregate(pipeline).to_list(length=None)
        
        # 상품별 사용 시간 (예시)
        product_usage = [
            {"product": "talk", "minutes": 45},
            {"product": "drama", "minutes": 30},
            {"product": "test", "minutes": 60},
            {"product": "journey", "minutes": 40}
        ]
        
        # 일별 활동 추이
        pipeline = [
            {"$match": {"userId": user_id, "timestamp": {"$gte": start_date}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        daily_activity = await self.db["activity_logs"].aggregate(pipeline).to_list(length=None)
        
        # 약점 분석 (Test & Study 데이터 기반)
        pipeline = [
            {"$match": {"userId": user_id, "timestamp": {"$gte": start_date}}},
            {"$unwind": "$weaknesses"},
            {"$group": {
                "_id": "$weaknesses",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        
        weaknesses = await self.db["test_results"].aggregate(pipeline).to_list(length=None)
        
        # 게임화 정보
        from app.models.common import Common
        gamification = await Common.get_user_gamification(self.db, user_id)
        
        streak_days = gamification.get("streakDays", 0) if gamification else 0
        total_xp = gamification.get("totalXP", 0) if gamification else 0
        weekly_xp = gamification.get("weeklyProgress", {}).get("xp", 0) if gamification else 0
        current_league = gamification.get("currentLeague", "bronze") if gamification else "bronze"
        
        return {
            "period": period,
            "start_date": start_date.isoformat(),
            "end_date": datetime.utcnow().isoformat(),
            "activity_stats": activity_stats,
            "product_usage": product_usage,
            "daily_activity": daily_activity,
            "weaknesses": weaknesses,
            "streak_days": streak_days,
            "total_xp": total_xp,
            "weekly_xp": weekly_xp,
            "current_league": current_league,
            "recommendation": await self._generate_recommendation(user_id)
        }
    
    async def _generate_recommendation(self, user_id):
        """학습 추천 생성
        
        Args:
            user_id: 사용자 ID
            
        Returns:
            dict: 학습 추천
        """
        # 사용자 정보 조회
        user_info = await self.db["users"].find_one({"_id": user_id})
        
        if not user_info:
            return {
                "focus_area": "기초 대화",
                "recommended_products": ["talk"],
                "next_level": "초급에서 시작하세요"
            }
        
        # 사용자 레벨
        user_level = user_info.get("profile", {}).get("koreanLevel", "beginner")
        
        # 최근 활동 분석
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$sort": {"timestamp": -1}},
            {"$limit": 50},
            {"$group": {
                "_id": "$product",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}}
        ]
        
        recent_products = await self.db["activity_logs"].aggregate(pipeline).to_list(length=None)
        
        # 약점 분석
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$unwind": {"path": "$weaknesses", "preserveNullAndEmptyArrays": True}},
            {"$group": {
                "_id": "$weaknesses",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 3}
        ]
        
        weaknesses = await self.db["test_results"].aggregate(pipeline).to_list(length=None)
        
        # 추천 생성
        focus_area = ""
        recommended_products = []
        next_level = ""
        
        if not recent_products:
            # 첫 사용자
            focus_area = "기초 대화"
            recommended_products = ["talk", "journey"]
            next_level = "초급에서 시작하세요"
        else:
            # 가장 적게 사용한 제품 추천
            all_products = ["talk", "drama", "test", "journey"]
            used_products = [p.get("_id") for p in recent_products if p.get("_id")]
            
            # 사용하지 않은 제품 확인
            unused_products = [p for p in all_products if p not in used_products]
            
            if unused_products:
                # 사용하지 않은 제품 추천
                recommended_products = unused_products[:2]
                focus_area = "새로운 학습 방법"
                next_level = f"현재 {user_level} 레벨을 유지하세요"
            else:
                # 약점 기반 추천
                if weaknesses:
                    weakness = weaknesses[0].get("_id")
                    if "문법" in weakness or "구조" in weakness:
                        focus_area = "문법 및 문장 구조"
                        recommended_products = ["drama", "test"]
                    elif "어휘" in weakness or "단어" in weakness:
                        focus_area = "어휘 확장"
                        recommended_products = ["talk", "journey"]
                    elif "발음" in weakness or "말하기" in weakness:
                        focus_area = "발음 및 말하기"
                        recommended_products = ["talk", "journey"]
                    elif "이해" in weakness or "읽기" in weakness:
                        focus_area = "읽기 및 이해력"
                        recommended_products = ["journey", "test"]
                    else:
                        focus_area = "종합 학습"
                        recommended_products = ["talk", "test"]
                else:
                    # 균형 있는 학습 추천
                    focus_area = "균형 있는 학습"
                    recommended_products = ["talk", "drama", "test", "journey"]
                
                # 레벨 추천
                if user_level == "beginner":
                    next_level = "중급으로 도전해보세요"
                elif user_level == "intermediate":
                    next_level = "고급으로 도전해보세요"
                else:
                    next_level = "현재 고급 레벨을 유지하세요"
        
        return {
            "focus_area": focus_area,
            "recommended_products": recommended_products[:2],  # 최대 2개 추천
            "next_level": next_level
        }
