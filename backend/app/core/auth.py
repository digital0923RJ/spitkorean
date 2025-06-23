"""
SpitKorean 인증 관리자
JWT 토큰 생성, 검증 및 인증 데코레이터 제공
"""

import jwt
import logging
from datetime import datetime, timedelta
from functools import wraps
from quart import request, current_app
from app.utils.response import error_response
from app.config import settings

logger = logging.getLogger(__name__)

# =======================
# 🔐 AuthManager Class
# =======================

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
        """JWT 토큰 생성"""
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
        """JWT 토큰 검증"""
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
        """인증 데코레이터 (클래스 내부 버전)"""
        @wraps(f)
        async def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return error_response("인증 토큰이 필요합니다", 401)

            token = auth_header
            if token.lower().startswith('bearer '):
                token = token[7:]

            user_id = self.verify_token(token)
            if not user_id:
                return error_response("유효하지 않은 토큰입니다", 401)

            request.user_id = user_id
            return await f(*args, **kwargs)

        return decorated_function

    def get_current_user_id(self):
        """현재 요청의 사용자 ID 반환"""
        return getattr(request, 'user_id', None)

    def refresh_token(self, token):
        """토큰 갱신"""
        user_id = self.verify_token(token)
        if user_id:
            return self.generate_token(user_id)
        return None


# =====================================
# 🔥 Decorator outside Global Class
# =====================================

def require_auth(f):
    """글로벌 인증 데코레이터"""

    @wraps(f)
    async def decorated_function(*args, **kwargs):
        auth = current_app.auth_manager
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return error_response("인증 토큰이 필요합니다", 401)

        token = auth_header
        if token.lower().startswith('bearer '):
            token = token[7:]

        user_id = auth.verify_token(token)
        if not user_id:
            return error_response("유효하지 않은 토큰입니다", 401)

        request.user_id = user_id
        return await f(*args, **kwargs)

    return decorated_function
