from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    async def connect(cls):
        """데이터베이스 연결 설정"""
        cls.client = AsyncIOMotorClient(settings.MONGO_URI)
        
    @classmethod
    async def close(cls):
        """데이터베이스 연결 종료"""
        if cls.client:
            cls.client.close()
            
    @classmethod
    def get_db(cls, db_name):
        """특정 데이터베이스 가져오기"""
        if not cls.client:
            raise Exception("Database connection not established")
        return cls.client[db_name]
    
    @classmethod
    def get_users_db(cls):
        """사용자 데이터베이스 가져오기"""
        return cls.get_db(settings.MONGO_DB_USERS)
    
    @classmethod
    def get_talk_db(cls):
        """Talk Like You Mean It 데이터베이스 가져오기"""
        return cls.get_db(settings.MONGO_DB_TALK)
    
    @classmethod
    def get_drama_db(cls):
        """Drama Builder 데이터베이스 가져오기"""
        return cls.get_db(settings.MONGO_DB_DRAMA)
    
    @classmethod
    def get_test_db(cls):
        """Test & Study 데이터베이스 가져오기"""
        return cls.get_db(settings.MONGO_DB_TEST)
    
    @classmethod
    def get_journey_db(cls):
        """Korean Journey 데이터베이스 가져오기"""
        return cls.get_db(settings.MONGO_DB_JOURNEY)
    
    @classmethod
    def get_gamification_db(cls):
        """게임화 데이터베이스 가져오기"""
        return cls.get_db(settings.MONGO_DB_GAMIFICATION)