from datetime import datetime
from bson.objectid import ObjectId

class Chat:
    """대화 모델 - Talk Like You Mean It 서비스를 위한 모델"""
    
    collection_name = "chat_logs"
    
    def __init__(self, user_id, session_id=None, messages=None, level="beginner"):
        """
        Args:
            user_id: 사용자 ID
            session_id: 세션 ID (선택적)
            messages: 메시지 목록 (선택적)
            level: 한국어 레벨 (beginner, intermediate, advanced)
        """
        import uuid
        
        self.user_id = user_id
        self.session_id = session_id or str(uuid.uuid4())
        self.messages = messages or []
        self.level = level
        self.date = datetime.utcnow()
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    @classmethod
    async def create_session(cls, db, user_id, level="beginner"):
        """새 대화 세션 생성
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            level: 한국어 레벨
            
        Returns:
            str: 생성된 세션 ID
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        chat = cls(user_id, level=level)
        chat_data = {
            "userId": user_id,
            "sessionId": chat.session_id,
            "messages": [],
            "level": level,
            "date": chat.date,
            "created_at": chat.created_at,
            "updated_at": chat.updated_at
        }
        
        result = await db[cls.collection_name].insert_one(chat_data)
        return chat.session_id
    
    @classmethod
    async def add_message(cls, db, session_id, user_id, role, content, emotion=None):
        """메시지 추가
        
        Args:
            db: 데이터베이스 연결
            session_id: 세션 ID
            user_id: 사용자 ID
            role: 역할 (user, assistant)
            content: 메시지 내용
            emotion: 감정 데이터 (선택적)
            
        Returns:
            bool: 추가 성공 여부
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow(),
            "emotion": emotion
        }
        
        result = await db[cls.collection_name].update_one(
            {"sessionId": session_id, "userId": user_id},
            {
                "$push": {"messages": message},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        return result.modified_count > 0
    
    @classmethod
    async def get_session(cls, db, session_id, user_id):
        """세션 정보 조회
        
        Args:
            db: 데이터베이스 연결
            session_id: 세션 ID
            user_id: 사용자 ID
            
        Returns:
            dict: 세션 정보 또는 None
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        return await db[cls.collection_name].find_one(
            {"sessionId": session_id, "userId": user_id}
        )
    
    @classmethod
    async def get_user_sessions(cls, db, user_id, limit=10, skip=0):
        """사용자의 세션 목록 조회
        
        Args:
            db: 데이터베이스 연결
            user_id: 사용자 ID
            limit: 조회 개수 (기본값: 10)
            skip: 건너뛸 개수 (기본값: 0)
            
        Returns:
            list: 세션 목록
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        cursor = db[cls.collection_name].find(
            {"userId": user_id}
        ).sort("updated_at", -1).skip(skip).limit(limit)
        
        return await cursor.to_list(length=None)
    
    @classmethod
    async def delete_session(cls, db, session_id, user_id):
        """세션 삭제
        
        Args:
            db: 데이터베이스 연결
            session_id: 세션 ID
            user_id: 사용자 ID
            
        Returns:
            bool: 삭제 성공 여부
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        result = await db[cls.collection_name].delete_one(
            {"sessionId": session_id, "userId": user_id}
        )
        return result.deleted_count > 0

# 기존 Chat 클래스 아래에 추가 (또는 Chat → ChatSession으로 이름 변경)

class ChatSession:
    """채팅 세션 클래스 (Chat 클래스와 동일한 역할)"""
    
    def __init__(self, user_id, session_id=None, messages=None, level="beginner"):
        import uuid
        
        self.user_id = user_id
        self.session_id = session_id or str(uuid.uuid4())
        self.messages = messages or []
        self.level = level
        self.date = datetime.utcnow()
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    # Chat 클래스의 모든 메서드들을 동일하게 구현
    @classmethod
    async def create_session(cls, db, user_id, level="beginner"):
        """새 대화 세션 생성"""
        return await Chat.create_session(db, user_id, level)
    
    @classmethod
    async def add_message(cls, db, session_id, user_id, role, content, emotion=None):
        """메시지 추가"""
        return await Chat.add_message(db, session_id, user_id, role, content, emotion)
    
    @classmethod
    async def get_session(cls, db, session_id, user_id):
        """세션 정보 조회"""
        return await Chat.get_session(db, session_id, user_id)
    
    @classmethod
    async def get_user_sessions(cls, db, user_id, limit=10, skip=0):
        """사용자의 세션 목록 조회"""
        return await Chat.get_user_sessions(db, user_id, limit, skip)
    
    @classmethod
    async def delete_session(cls, db, session_id, user_id):
        """세션 삭제"""
        return await Chat.delete_session(db, session_id, user_id)

class ChatMessage:
    """개별 채팅 메시지 클래스"""
    
    def __init__(self, role, content, timestamp=None, emotion=None):
        self.role = role  # 'user' 또는 'assistant'
        self.content = content
        self.timestamp = timestamp or datetime.utcnow()
        self.emotion = emotion
    
    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat() if isinstance(self.timestamp, datetime) else self.timestamp,
            "emotion": self.emotion
        }
    
    @classmethod
    def from_dict(cls, data):
        """딕셔너리에서 객체 생성"""
        timestamp = data.get("timestamp")
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        
        return cls(
            role=data.get("role"),
            content=data.get("content"),
            timestamp=timestamp,
            emotion=data.get("emotion")
        )
    
    def validate(self):
        """메시지 유효성 검사"""
        if self.role not in ['user', 'assistant']:
            raise ValueError("role은 'user' 또는 'assistant'여야 합니다")
        
        if not self.content or not isinstance(self.content, str):
            raise ValueError("content는 비어있지 않은 문자열이어야 합니다")
        
        return True