from datetime import datetime
from bson.objectid import ObjectId

class User:
    """사용자 모델"""
    
    collection_name = "users"
    
    def __init__(self, email, password=None, profile=None, subscriptions=None, preferences=None):
        """
        Args:
            email: 이메일 주소
            password: 해시된 비밀번호 (선택적)
            profile: 사용자 프로필 정보 (선택적)
            subscriptions: 구독 정보 목록 (선택적)
            preferences: 사용자 환경설정 (선택적)
        """
        self.email = email
        self.password = password
        self.profile = profile or {
            "name": "",
            "nativeLanguage": "en",
            "koreanLevel": "beginner",
            "interests": []
        }
        self.subscriptions = subscriptions or []
        self.preferences = preferences or {
            "studyGoals": [],
            "dailyStudyTime": 15  # 기본값: 15분
        }
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    @classmethod
    async def find_by_email(cls, db, email):
        """이메일로 사용자 찾기
        
        Args:
            db: 데이터베이스 연결
            email: 이메일 주소
            
        Returns:
            dict: 사용자 정보 또는 None
        """
        return await db[cls.collection_name].find_one({"email": email})
    
    @classmethod
    async def find_by_id(cls, db, user_id):
        """ID로 사용자 찾기
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            
        Returns:
            dict: 사용자 정보 또는 None
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return await db[cls.collection_name].find_one({"_id": user_id})
    
    @classmethod
    async def create(cls, db, user_data):
        """새 사용자 생성
        
        Args:
            db: 데이터베이스 연결
            user_data: 사용자 데이터
            
        Returns:
            str: 생성된 사용자 ID
        """
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()
        result = await db[cls.collection_name].insert_one(user_data)
        return str(result.inserted_id)
    
    @classmethod
    async def update(cls, db, user_id, update_data):
        """사용자 정보 업데이트
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            update_data: 업데이트할 데이터
            
        Returns:
            bool: 업데이트 성공 여부
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        update_data["updated_at"] = datetime.utcnow()
        result = await db[cls.collection_name].update_one(
            {"_id": user_id},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    @classmethod
    async def add_subscription(cls, db, user_id, product, end_date=None):
        """구독 추가
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            product: 상품 이름 (talk, drama, test, journey)
            end_date: 종료 날짜 (선택적)
            
        Returns:
            bool: 추가 성공 여부
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        subscription = {
            "product": product,
            "status": "active",
            "startDate": datetime.utcnow(),
            "endDate": end_date
        }
        
        result = await db[cls.collection_name].update_one(
            {"_id": user_id},
            {
                "$push": {"subscriptions": subscription},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        return result.modified_count > 0
    
    @classmethod
    async def has_active_subscription(cls, db, user_id, product):
        """활성 구독 여부 확인
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            product: 상품 이름 (talk, drama, test, journey)
            
        Returns:
            bool: 활성 구독 여부
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        user = await db[cls.collection_name].find_one(
            {
                "_id": user_id,
                "subscriptions": {
                    "$elemMatch": {
                        "product": product,
                        "status": "active"
                    }
                }
            }
        )
        return user is not None
    
class UserProfile:
    """사용자 프로필 정보 클래스"""
    
    def __init__(self, name="", native_language="en", korean_level="beginner", interests=None):
        self.name = name
        self.native_language = native_language
        self.korean_level = korean_level
        self.interests = interests or []
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            "name": self.name,
            "nativeLanguage": self.native_language,
            "koreanLevel": self.korean_level,
            "interests": self.interests
        }
    
    @classmethod
    def from_dict(cls, data):
        """딕셔너리에서 객체 생성"""
        return cls(
            name=data.get("name", ""),
            native_language=data.get("nativeLanguage", "en"),
            korean_level=data.get("koreanLevel", "beginner"),
            interests=data.get("interests", [])
        )

class UserPreferences:
    """사용자 학습 설정 클래스"""
    
    def __init__(self, study_goals=None, daily_study_time=15):
        self.study_goals = study_goals or []
        self.daily_study_time = daily_study_time
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            "studyGoals": self.study_goals,
            "dailyStudyTime": self.daily_study_time
        }
    
    @classmethod
    def from_dict(cls, data):
        """딕셔너리에서 객체 생성"""
        return cls(
            study_goals=data.get("studyGoals", []),
            daily_study_time=data.get("dailyStudyTime", 15)
        )