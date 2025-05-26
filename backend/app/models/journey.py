from datetime import datetime
from bson.objectid import ObjectId

class Journey:
    """리딩 여정 모델 - Korean Journey 서비스를 위한 모델"""
    
    collection_name = "journey_content"
    history_collection = "reading_history"
    
    # 한국어 레벨 정의
    LEVELS = {
        "level1": "한글 마스터",
        "level2": "기초 리더",
        "level3": "중급 리더",
        "level4": "고급 리더"
    }
    
    # 콘텐츠 유형 정의
    CONTENT_TYPES = ["hangul", "reading", "pronunciation", "dialogue"]
    
    def __init__(self, title, description, level, content_type, content=None, guide=None):
        """
        Args:
            title: 콘텐츠 제목
            description: 콘텐츠 설명
            level: 한국어 레벨 (level1, level2, level3, level4)
            content_type: 콘텐츠 유형 (hangul, reading, pronunciation, dialogue)
            content: 콘텐츠 내용 (선택적)
            guide: 학습 가이드 (선택적)
        """
        self.title = title
        self.description = description
        self.level = level
        self.content_type = content_type
        self.content = content or {}
        self.guide = guide or {}
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    @classmethod
    async def create(cls, db, journey_data):
        """새 리딩 콘텐츠 생성
        
        Args:
            db: 데이터베이스 연결
            journey_data: 리딩 콘텐츠 데이터
            
        Returns:
            str: 생성된 콘텐츠 ID
        """
        journey_data["created_at"] = datetime.utcnow()
        journey_data["updated_at"] = datetime.utcnow()
        result = await db[cls.collection_name].insert_one(journey_data)
        return str(result.inserted_id)
    
    @classmethod
    async def find_by_level(cls, db, level, content_type=None, limit=10, skip=0):
        """레벨별 리딩 콘텐츠 조회
        
        Args:
            db: 데이터베이스 연결
            level: 한국어 레벨 (level1, level2, level3, level4)
            content_type: 콘텐츠 유형 (선택적)
            limit: 조회 개수 (기본값: 10)
            skip: 건너뛸 개수 (기본값: 0)
            
        Returns:
            list: 리딩 콘텐츠 목록
        """
        query = {"level": level}
        if content_type:
            query["content_type"] = content_type
        
        cursor = db[cls.collection_name].find(query).sort(
            "created_at", -1
        ).skip(skip).limit(limit)
        
        return await cursor.to_list(length=None)
    
    @classmethod
    async def find_by_id(cls, db, content_id):
        """ID로 리딩 콘텐츠 조회
        
        Args:
            db: 데이터베이스 연결
            content_id: 콘텐츠 ID
            
        Returns:
            dict: 리딩 콘텐츠 정보 또는 None
        """
        if isinstance(content_id, str):
            content_id = ObjectId(content_id)
        
        return await db[cls.collection_name].find_one({"_id": content_id})
    
    @classmethod
    async def record_reading(cls, db, user_id, content_id, reading_speed, pronunciation_score, completed_sentences):
        """리딩 기록 저장
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            content_id: 콘텐츠 ID
            reading_speed: 읽기 속도
            pronunciation_score: 발음 점수
            completed_sentences: 완료한 문장 수
            
        Returns:
            str: 생성된 기록 ID
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        if isinstance(content_id, str):
            content_id = ObjectId(content_id)
        
        # 콘텐츠 정보 조회
        content = await cls.find_by_id(db, content_id)
        if not content:
            return None
        
        history_data = {
            "userId": user_id,
            "contentId": content_id,
            "level": content.get("level"),
            "readingSpeed": reading_speed,
            "pronunciationScore": pronunciation_score,
            "completedSentences": completed_sentences,
            "date": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db[cls.history_collection].insert_one(history_data)
        return str(result.inserted_id)
    
    @classmethod
    async def get_user_history(cls, db, user_id, limit=10, skip=0):
        """사용자의 리딩 기록 목록 조회
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            limit: 조회 개수 (기본값: 10)
            skip: 건너뛸 개수 (기본값: 0)
            
        Returns:
            list: 리딩 기록 목록
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        cursor = db[cls.history_collection].find(
            {"userId": user_id}
        ).sort("date", -1).skip(skip).limit(limit)
        
        return await cursor.to_list(length=None)
    
    @classmethod
    async def get_user_stats(cls, db, user_id):
        """사용자 리딩 통계 조회
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            
        Returns:
            dict: 리딩 통계 정보
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # 레벨별 평균 발음 점수
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": "$level",
                "average_pronunciation": {"$avg": "$pronunciationScore"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        level_stats = await db[cls.history_collection].aggregate(pipeline).to_list(length=None)
        
        # 평균 읽기 속도
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": "$level",
                "average_speed": {"$avg": "$readingSpeed"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        speed_stats = await db[cls.history_collection].aggregate(pipeline).to_list(length=None)
        
        # 일일 학습 현황
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}},
                "total_sentences": {"$sum": "$completedSentences"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": -1}},
            {"$limit": 7}
        ]
        
        daily_stats = await db[cls.history_collection].aggregate(pipeline).to_list(length=None)
        
        return {
            "level_stats": level_stats,
            "speed_stats": speed_stats,
            "daily_stats": daily_stats
        }


# 기존 Journey 클래스 아래에 추가 (또는 Journey → ReadingContent로 이름 변경)

class ReadingContent:
    """리딩 콘텐츠 클래스 (Journey 클래스와 동일한 역할)"""
    
    def __init__(self, title, description, level, content_type, content=None, guide=None):
        self.title = title
        self.description = description
        self.level = level
        self.content_type = content_type
        self.content = content or {}
        self.guide = guide or {}
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    # Journey 클래스의 모든 메서드들을 동일하게 구현
    @classmethod
    async def create(cls, db, journey_data):
        """새 리딩 콘텐츠 생성"""
        return await Journey.create(db, journey_data)
    
    @classmethod
    async def find_by_level(cls, db, level, content_type=None, limit=10, skip=0):
        """레벨별 리딩 콘텐츠 조회"""
        return await Journey.find_by_level(db, level, content_type, limit, skip)
    
    @classmethod
    async def find_by_id(cls, db, content_id):
        """ID로 리딩 콘텐츠 조회"""
        return await Journey.find_by_id(db, content_id)

class ReadingHistory:
    """리딩 학습 기록 클래스"""
    
    def __init__(self, user_id, content_id, reading_speed, pronunciation_score, completed_sentences=0, level="level1"):
        self.user_id = user_id
        self.content_id = content_id
        self.reading_speed = reading_speed
        self.pronunciation_score = pronunciation_score
        self.completed_sentences = completed_sentences
        self.level = level
        self.date = datetime.utcnow()
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            "userId": self.user_id,
            "contentId": self.content_id,
            "readingSpeed": self.reading_speed,
            "pronunciationScore": self.pronunciation_score,
            "completedSentences": self.completed_sentences,
            "level": self.level,
            "date": self.date.isoformat() if isinstance(self.date, datetime) else self.date
        }
    
    @classmethod
    def from_dict(cls, data):
        """딕셔너리에서 객체 생성"""
        return cls(
            user_id=data.get("userId"),
            content_id=data.get("contentId"),
            reading_speed=data.get("readingSpeed"),
            pronunciation_score=data.get("pronunciationScore"),
            completed_sentences=data.get("completedSentences", 0),
            level=data.get("level", "level1")
        )
    
    def calculate_improvement(self, previous_history):
        """이전 기록 대비 향상도 계산"""
        if not previous_history:
            return {"speed_improvement": 0, "pronunciation_improvement": 0}
        
        speed_improvement = self.reading_speed - previous_history.reading_speed
        pronunciation_improvement = self.pronunciation_score - previous_history.pronunciation_score
        
        return {
            "speed_improvement": speed_improvement,
            "pronunciation_improvement": pronunciation_improvement
        }
    
    def get_performance_level(self):
        """성능 레벨 평가"""
        avg_score = (self.pronunciation_score + (self.reading_speed * 10)) / 2
        
        if avg_score >= 90:
            return "excellent"
        elif avg_score >= 75:
            return "good"
        elif avg_score >= 60:
            return "average"
        else:
            return "needs_improvement"