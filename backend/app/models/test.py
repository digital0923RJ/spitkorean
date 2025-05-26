from datetime import datetime
from bson.objectid import ObjectId

class Test:
    """TOPIK 테스트 모델 - Test & Study 서비스를 위한 모델"""
    
    collection_name = "test_content"
    results_collection = "test_results"
    
    # TOPIK 레벨 정의
    LEVELS = {
        1: "TOPIK I - 1급",
        2: "TOPIK I - 2급",
        3: "TOPIK II - 3급",
        4: "TOPIK II - 4급",
        5: "TOPIK II - 5급",
        6: "TOPIK II - 6급"
    }
    
    # 테스트 유형 정의
    TEST_TYPES = ["vocabulary", "grammar", "reading", "listening", "writing"]
    
    def __init__(self, title, description, level, test_type, questions=None):
        """
        Args:
            title: 테스트 제목
            description: 테스트 설명
            level: TOPIK 레벨 (1-6)
            test_type: 테스트 유형 (vocabulary, grammar, reading, listening, writing)
            questions: 문제 목록 (선택적)
        """
        self.title = title
        self.description = description
        self.level = level
        self.test_type = test_type
        self.questions = questions or []
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    @classmethod
    async def create(cls, db, test_data):
        """새 테스트 콘텐츠 생성
        
        Args:
            db: 데이터베이스 연결
            test_data: 테스트 데이터
            
        Returns:
            str: 생성된 테스트 ID
        """
        test_data["created_at"] = datetime.utcnow()
        test_data["updated_at"] = datetime.utcnow()
        result = await db[cls.collection_name].insert_one(test_data)
        return str(result.inserted_id)
    
    @classmethod
    async def find_by_level_and_type(cls, db, level, test_type=None, limit=10, skip=0):
        """레벨 및 유형별 테스트 조회
        
        Args:
            db: 데이터베이스 연결
            level: TOPIK 레벨 (1-6)
            test_type: 테스트 유형 (선택적)
            limit: 조회 개수 (기본값: 10)
            skip: 건너뛸 개수 (기본값: 0)
            
        Returns:
            list: 테스트 목록
        """
        query = {"level": level}
        if test_type:
            query["test_type"] = test_type
        
        cursor = db[cls.collection_name].find(query).sort(
            "created_at", -1
        ).skip(skip).limit(limit)
        
        return await cursor.to_list(length=None)
    
    @classmethod
    async def find_by_id(cls, db, test_id):
        """ID로 테스트 조회
        
        Args:
            db: 데이터베이스 연결
            test_id: 테스트 ID
            
        Returns:
            dict: 테스트 정보 또는 None
        """
        if isinstance(test_id, str):
            test_id = ObjectId(test_id)
        
        return await db[cls.collection_name].find_one({"_id": test_id})
    
    @classmethod
    async def save_results(cls, db, user_id, test_id, score, questions, weaknesses=None):
        """테스트 결과 저장
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            test_id: 테스트 ID
            score: 점수
            questions: 문제 및 답변 목록
            weaknesses: 취약점 목록 (선택적)
            
        Returns:
            str: 생성된 결과 ID
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        if isinstance(test_id, str):
            test_id = ObjectId(test_id)
        
        # 테스트 정보 조회
        test = await cls.find_by_id(db, test_id)
        if not test:
            return None
        
        result_data = {
            "userId": user_id,
            "testId": test_id,
            "testType": test.get("test_type"),
            "level": test.get("level"),
            "score": score,
            "questions": questions,
            "weaknesses": weaknesses or [],
            "date": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db[cls.results_collection].insert_one(result_data)
        return str(result.inserted_id)
    
    @classmethod
    async def get_user_results(cls, db, user_id, limit=10, skip=0):
        """사용자의 테스트 결과 목록 조회
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            limit: 조회 개수 (기본값: 10)
            skip: 건너뛸 개수 (기본값: 0)
            
        Returns:
            list: 테스트 결과 목록
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        cursor = db[cls.results_collection].find(
            {"userId": user_id}
        ).sort("date", -1).skip(skip).limit(limit)
        
        return await cursor.to_list(length=None)
    
    @classmethod
    async def get_user_stats(cls, db, user_id):
        """사용자 테스트 통계 조회
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            
        Returns:
            dict: 테스트 통계 정보
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # 레벨별 평균 점수
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": "$level",
                "average_score": {"$avg": "$score"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        level_stats = await db[cls.results_collection].aggregate(pipeline).to_list(length=None)
        
        # 유형별 평균 점수
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": "$testType",
                "average_score": {"$avg": "$score"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        type_stats = await db[cls.results_collection].aggregate(pipeline).to_list(length=None)
        
        # 가장 많이 틀린 문제 유형
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$unwind": "$weaknesses"},
            {"$group": {
                "_id": "$weaknesses",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        
        weaknesses = await db[cls.results_collection].aggregate(pipeline).to_list(length=None)
        
        return {
            "level_stats": level_stats,
            "type_stats": type_stats,
            "weaknesses": weaknesses
        }


# 기존 Test 클래스 아래에 추가 (또는 Test → TestQuestion으로 이름 변경)

class TestQuestion:
    """TOPIK 테스트 문제 클래스 (Test 클래스와 동일한 역할)"""
    
    def __init__(self, title, description, level, test_type, questions=None):
        self.title = title
        self.description = description
        self.level = level
        self.test_type = test_type
        self.questions = questions or []
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    # Test 클래스의 모든 메서드들을 동일하게 구현
    @classmethod
    async def create(cls, db, test_data):
        """새 테스트 콘텐츠 생성"""
        return await Test.create(db, test_data)
    
    @classmethod
    async def find_by_level_and_type(cls, db, level, test_type=None, limit=10, skip=0):
        """레벨 및 유형별 테스트 조회"""
        return await Test.find_by_level_and_type(db, level, test_type, limit, skip)
    
    @classmethod
    async def find_by_id(cls, db, test_id):
        """ID로 테스트 조회"""
        return await Test.find_by_id(db, test_id)

class TestResult:
    """테스트 결과 클래스"""
    
    def __init__(self, user_id, test_id, score, questions=None, weaknesses=None, test_type=None, level=None):
        self.user_id = user_id
        self.test_id = test_id
        self.score = score
        self.questions = questions or []  # 문제별 상세 결과
        self.weaknesses = weaknesses or []
        self.test_type = test_type
        self.level = level
        self.date = datetime.utcnow()
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            "userId": self.user_id,
            "testId": self.test_id,
            "score": self.score,
            "questions": self.questions,
            "weaknesses": self.weaknesses,
            "testType": self.test_type,
            "level": self.level,
            "date": self.date.isoformat() if isinstance(self.date, datetime) else self.date
        }
    
    @classmethod
    def from_dict(cls, data):
        """딕셔너리에서 객체 생성"""
        return cls(
            user_id=data.get("userId"),
            test_id=data.get("testId"),
            score=data.get("score"),
            questions=data.get("questions", []),
            weaknesses=data.get("weaknesses", []),
            test_type=data.get("testType"),
            level=data.get("level")
        )
    
    def calculate_grade(self):
        """점수를 기반으로 등급 계산"""
        if self.score >= 90:
            return "A+"
        elif self.score >= 80:
            return "A"
        elif self.score >= 70:
            return "B"
        elif self.score >= 60:
            return "C"
        else:
            return "F"
    
    def get_correct_count(self):
        """정답 개수 계산"""
        return sum(1 for q in self.questions if q.get("is_correct", False))
    
    def get_total_questions(self):
        """전체 문제 수"""
        return len(self.questions)