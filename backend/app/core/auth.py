"""
SpitKorean 인증 관리자
JWT 토큰 생성, 검증 및 인증 데코레이터 제공
"""
import jwt
import logging
from datetime import datetime, timedelta
from functools import wraps
from quart import request
from bson.objectid import ObjectId
from app.utils.response import error_response
from app.config import settings

logger = logging.getLogger(__name__)

class AuthManager:
    """JWT 기반 인증 관리자"""
    
    def __init__(self, secret_key=None):
        """
        Args:
            secret_key: JWT 서명에 사용할 비밀키
        """
        self.secret_key = secret_key or settings.JWT_SECRET_KEY
        self.algorithm = settings.JWT_ALGORITHM
        self.expire_hours = settings.JWT_ACCESS_TOKEN_EXPIRE_HOURS
    
    def generate_token(self, user_id):
        """JWT 토큰 생성
        
        Args:
            user_id: 사용자 ID (ObjectId 또는 문자열)
            
        Returns:
            str: JWT 토큰
        """
        try:
            payload = {
                'user_id': str(user_id),
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(hours=self.expire_hours)
            }
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            logger.info(f"Token generated for user: {user_id}")
            return token
        except Exception as e:
            logger.error(f"Token generation error: {e}")
            raise
    
    def verify_token(self, token):
        """JWT 토큰 검증
        
        Args:
            token: JWT 토큰 문자열
            
        Returns:
            str: 사용자 ID, 실패 시 None
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload['user_id']
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}")
            return None
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return None
    
    def require_auth(self, f):
        """인증 데코레이터
        
        사용법:
            @current_app.auth_manager.require_auth
            async def protected_route():
                user_id = request.user_id
                # 인증된 사용자 로직
        """
        @wraps(f)
        async def decorated_function(*args, **kwargs):
            # Authorization 헤더에서 토큰 추출
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return error_response("인증 토큰이 필요합니다", 401)
            
            # Bearer 접두사 제거
            token = auth_header
            if token.startswith('Bearer '):
                token = token[7:]
            elif token.startswith('bearer '):
                token = token[7:]
            
            # 토큰 검증
            user_id = self.verify_token(token)
            if not user_id:
                return error_response("유효하지 않은 토큰입니다", 401)
            
            # request 객체에 사용자 ID 저장
            request.user_id = user_id
            
            # 원본 함수 실행
            return await f(*args, **kwargs)
        
        return decorated_function
    
    def get_current_user_id(self):
        """현재 요청의 사용자 ID 반환
        
        Returns:
            str: 현재 인증된 사용자 ID, 없으면 None
        """
        return getattr(request, 'user_id', None)
    
    def refresh_token(self, token):
        """토큰 갱신
        
        Args:
            token: 기존 JWT 토큰
            
        Returns:
            str: 새로운 JWT 토큰, 실패 시 None
        """
        user_id = self.verify_token(token)
        if user_id:
            return self.generate_token(user_id)
        return None