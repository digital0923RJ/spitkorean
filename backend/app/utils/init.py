"""
SpitKorean 유틸리티 패키지
이 패키지는 공통 헬퍼 함수와 유틸리티를 제공합니다.
"""

# auth.py에서 AuthHelper 클래스와 메서드들 import
from app.utils.auth import (
    AuthHelper,
    # 개별 메서드들도 편의를 위해 직접 import
)

# response.py에서 응답 함수들 import (✅ 이미 맞음)
from app.utils.response import api_response, error_response

# validators.py에서 Validators 클래스와 메서드들 import
from app.utils.validators import Validators

# cache.py에서 Cache 클래스 import
from app.utils.cache import Cache

# logger.py에서 LogManager 클래스 import (✅ 이미 맞음)
from app.utils.logger import LogManager

# 편의 함수들 (실제 클래스 메서드를 함수처럼 사용)
def generate_password_hash(password):
    """비밀번호 해시 생성 편의 함수"""
    return AuthHelper.hash_password(password)

def check_password_hash(password, hashed_password):
    """비밀번호 검증 편의 함수"""
    return AuthHelper.verify_password(password, hashed_password)

def validate_email(email):
    """이메일 검증 편의 함수"""
    return Validators.validate_email(email)

def validate_password(password):
    """비밀번호 검증 편의 함수"""
    return Validators.validate_password(password)

def get_cache_key(*args, prefix="spitkorean"):
    """캐시 키 생성 편의 함수"""
    parts = [str(arg) for arg in args if arg is not None]
    return f"{prefix}:{':'.join(parts)}"

# 모든 export 정의
__all__ = [
    # 클래스들
    'AuthHelper',
    'Validators', 
    'Cache',
    'LogManager',
    
    # 응답 함수들
    'api_response', 
    'error_response',
    
    # 편의 함수들
    'generate_password_hash', 
    'check_password_hash',
    'validate_email', 
    'validate_password',
    'get_cache_key',
    
    # AuthHelper의 추가 메서드들
    'validate_subscription',
    'get_active_subscriptions',
    'generate_reset_token',
    'is_valid_token',
    
    # Validators의 추가 메서드들
    'validate_name',
    'validate_language_code',
    'validate_korean_level',
    'validate_topik_level',
    'validate_journey_level',
    'validate_product_code',
    'validate_bundle_code',
    'validate_audio_format',
    'sanitize_text'
]