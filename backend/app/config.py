import os
from dotenv import load_dotenv
from pydantic import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    # 앱 설정
    APP_NAME: str = "SpitKorean"
    DEBUG: bool = os.getenv("FLASK_ENV") == "development"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    
    # 데이터베이스 설정
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_USERS: str = os.getenv("MONGO_DB_USERS", "spitkorean_users")
    MONGO_DB_TALK: str = os.getenv("MONGO_DB_TALK", "spitkorean_talk")
    MONGO_DB_DRAMA: str = os.getenv("MONGO_DB_DRAMA", "spitkorean_drama")
    MONGO_DB_TEST: str = os.getenv("MONGO_DB_TEST", "spitkorean_test")
    MONGO_DB_JOURNEY: str = os.getenv("MONGO_DB_JOURNEY", "spitkorean_journey")
    MONGO_DB_GAMIFICATION: str = os.getenv("MONGO_DB_GAMIFICATION", "spitkorean_gamification")
    
    # Redis 설정
    REDIS_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    
    # OpenAI 설정
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Google Cloud 설정
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "./credentials.json")
    
    # 상품별 사용 제한
    TALK_DAILY_LIMIT: int = 60  # Talk Like You Mean It
    DRAMA_DAILY_LIMIT: int = 20  # Drama Builder
    TEST_DAILY_LIMIT: int = 20   # Test & Study
    JOURNEY_DAILY_LIMIT: int = 20  # Korean Journey
    
    # 구독 상품 가격 ID
    STRIPE_PRICE_TALK: str = os.getenv("STRIPE_PRICE_TALK", "")
    STRIPE_PRICE_DRAMA: str = os.getenv("STRIPE_PRICE_PHRASE", "")
    STRIPE_PRICE_TEST: str = os.getenv("STRIPE_PRICE_TEST", "")
    STRIPE_PRICE_JOURNEY: str = os.getenv("STRIPE_PRICE_JOURNEY", "")
    
    # JWT 설정
    JWT_SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()