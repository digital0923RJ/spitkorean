from datetime import datetime
from bson.objectid import ObjectId

class Drama:
    """드라마 콘텐츠 모델 - Drama Builder 서비스를 위한 모델"""
    
    collection_name = "drama_content"
    progress_collection = "drama_progress"
    
    def __init__(self, title, description, level, sentences=None, genre=None, source=None):
        """
        Args:
            title: 드라마 제목
            description: 드라마 설명
            level: 난이도 (beginner, intermediate, advanced)
            sentences: 문장 목록 (선택적)
            genre: 장르 (선택적)
            source: 출처 (선택적)
        """
        self.title = title
        self.description = description
        self.level = level
        self.sentences = sentences or []
        self.genre = genre
        self.source = source
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    @classmethod
    async def create(cls, db, drama_data):
        """새 드라마 콘텐츠 생성
        
        Args:
            db: 데이터베이스 연결
            drama_data: 드라마 데이터
            
        Returns:
            str: 생성된 드라마 ID
        """
        drama_data["created_at"] = datetime.utcnow()
        drama_data["updated_at"] = datetime.utcnow()
        result = await db[cls.collection_name].insert_one(drama_data)
        return str(result.inserted_id)
    
    @classmethod
    async def find_by_level(cls, db, level, limit=10, skip=0):
        """레벨별 드라마 조회
        
        Args:
            db: 데이터베이스 연결
            level: 난이도 (beginner, intermediate, advanced)
            limit: 조회 개수 (기본값: 10)
            skip: 건너뛸 개수 (기본값: 0)
            
        Returns:
            list: 드라마 목록
        """
        cursor = db[cls.collection_name].find(
            {"level": level}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        return await cursor.to_list(length=None)
    
    @classmethod
    async def find_by_id(cls, db, drama_id):
        """ID로 드라마 조회
        
        Args:
            db: 데이터베이스 연결
            drama_id: 드라마 ID
            
        Returns:
            dict: 드라마 정보 또는 None
        """
        if isinstance(drama_id, str):
            drama_id = ObjectId(drama_id)
        
        return await db[cls.collection_name].find_one({"_id": drama_id})
    
    @classmethod
    async def update_progress(cls, db, user_id, drama_id, sentence_id, is_correct, level):
        """진행 상황 업데이트
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            drama_id: 드라마 ID
            sentence_id: 문장 ID
            is_correct: 정답 여부
            level: 사용자 레벨
            
        Returns:
            bool: 업데이트 성공 여부
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        if isinstance(drama_id, str):
            drama_id = ObjectId(drama_id)
        
        # 기존 진행 상황 조회
        progress = await db[cls.progress_collection].find_one({
            "userId": user_id,
            "dramaId": drama_id
        })
        
        if progress:
            # 기존 진행 상황 업데이트
            if is_correct and sentence_id not in progress.get("completedSentences", []):
                result = await db[cls.progress_collection].update_one(
                    {"_id": progress["_id"]},
                    {
                        "$addToSet": {"completedSentences": sentence_id},
                        "$set": {
                            "updated_at": datetime.utcnow(),
                            "level": level
                        }
                    }
                )
            else:
                result = await db[cls.progress_collection].update_one(
                    {"_id": progress["_id"]},
                    {
                        "$set": {
                            "updated_at": datetime.utcnow(),
                            "level": level
                        }
                    }
                )
        else:
            # 새 진행 상황 생성
            completed_sentences = [sentence_id] if is_correct else []
            result = await db[cls.progress_collection].insert_one({
                "userId": user_id,
                "dramaId": drama_id,
                "completedSentences": completed_sentences,
                "level": level,
                "date": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
        
        return result.acknowledged
    
    @classmethod
    async def get_user_progress(cls, db, user_id, limit=10, skip=0):
        """사용자의 진행 상황 목록 조회
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            limit: 조회 개수 (기본값: 10)
            skip: 건너뛸 개수 (기본값: 0)
            
        Returns:
            list: 진행 상황 목록
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        cursor = db[cls.progress_collection].find(
            {"userId": user_id}
        ).sort("updated_at", -1).skip(skip).limit(limit)
        
        return await cursor.to_list(length=None)

# 기존 Drama 클래스 아래에 추가 (또는 Drama → DramaContent로 이름 변경)

class DramaContent:
    """드라마 콘텐츠 클래스 (Drama 클래스와 동일한 역할)"""
    
    def __init__(self, title, description, level, sentences=None, genre=None, source=None):
        self.title = title
        self.description = description
        self.level = level
        self.sentences = sentences or []
        self.genre = genre
        self.source = source
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    # Drama 클래스의 모든 메서드들을 동일하게 구현
    @classmethod
    async def create(cls, db, drama_data):
        """새 드라마 콘텐츠 생성"""
        return await Drama.create(db, drama_data)
    
    @classmethod
    async def find_by_level(cls, db, level, limit=10, skip=0):
        """레벨별 드라마 조회"""
        return await Drama.find_by_level(db, level, limit, skip)
    
    @classmethod
    async def find_by_id(cls, db, drama_id):
        """ID로 드라마 조회"""
        return await Drama.find_by_id(db, drama_id)

class DramaProgress:
    """드라마 학습 진행 상황 클래스"""
    
    def __init__(self, user_id, drama_id, completed_sentences=None, level="beginner", accuracy=0):
        self.user_id = user_id
        self.drama_id = drama_id
        self.completed_sentences = completed_sentences or []
        self.level = level
        self.accuracy = accuracy
        self.date = datetime.utcnow()
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            "userId": self.user_id,
            "dramaId": self.drama_id,
            "completedSentences": self.completed_sentences,
            "level": self.level,
            "accuracy": self.accuracy,
            "date": self.date.isoformat() if isinstance(self.date, datetime) else self.date
        }
    
    @classmethod
    def from_dict(cls, data):
        """딕셔너리에서 객체 생성"""
        return cls(
            user_id=data.get("userId"),
            drama_id=data.get("dramaId"),
            completed_sentences=data.get("completedSentences", []),
            level=data.get("level", "beginner"),
            accuracy=data.get("accuracy", 0)
        )
    
    def add_completed_sentence(self, sentence_id):
        """완료된 문장 추가"""
        if sentence_id not in self.completed_sentences:
            self.completed_sentences.append(sentence_id)
            self.updated_at = datetime.utcnow()
    
    def calculate_completion_rate(self, total_sentences):
        """완료율 계산"""
        if total_sentences == 0:
            return 0
        return (len(self.completed_sentences) / total_sentences) * 100