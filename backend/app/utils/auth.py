import os
import re
import bcrypt
from datetime import datetime, timedelta
from app.utils.auth import AuthHelper
def generate_password_hash(password):
    return AuthHelper.hash_password(password)
def check_password_hash(password, hashed_password):
    return AuthHelper.verify_password(password, hashed_password)


class AuthHelper:
    """인증 관련 헬퍼 함수"""
    
    @staticmethod
    def validate_email(email):
        """이메일 유효성 검증
        
        Args:
            email: 이메일 주소
            
        Returns:
            bool: 유효성 여부
        """
        # 간단한 이메일 형식 검증
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_pattern, email))
    
    @staticmethod
    def validate_password(password):
        """비밀번호 유효성 검증
        
        Args:
            password: 비밀번호
            
        Returns:
            bool: 유효성 여부
        """
        # 8자 이상, 영문자, 숫자, 특수문자 포함
        if len(password) < 8:
            return False
        
        has_letter = bool(re.search(r'[a-zA-Z]', password))
        has_digit = bool(re.search(r'\d', password))
        has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
        
        return has_letter and has_digit and has_special
    
    @staticmethod
    def hash_password(password):
        """비밀번호 해싱
        
        Args:
            password: 원본 비밀번호
            
        Returns:
            str: 해시된 비밀번호
        """
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password, hashed_password):
        """비밀번호 검증
        
        Args:
            password: 원본 비밀번호
            hashed_password: 해시된 비밀번호
            
        Returns:
            bool: 일치 여부
        """
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    @staticmethod
    def generate_reset_token():
        """비밀번호 재설정 토큰 생성
        
        Returns:
            str: 재설정 토큰
        """
        import secrets
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def is_valid_token(token_created_at, expiry_hours=24):
        """토큰 유효성 검증
        
        Args:
            token_created_at: 토큰 생성 시간
            expiry_hours: 만료 시간 (시간 단위)
            
        Returns:
            bool: 유효성 여부
        """
        expiry_time = token_created_at + timedelta(hours=expiry_hours)
        return datetime.utcnow() < expiry_time
    
    @staticmethod
    def validate_subscription(user, product):
        """구독 유효성 검증
        
        Args:
            user: 사용자 정보
            product: 상품 코드
            
        Returns:
            bool: 구독 여부
        """
        if not user or "subscriptions" not in user:
            return False
        
        for sub in user["subscriptions"]:
            if sub.get("product") == product and sub.get("status") == "active":
                # 만료 날짜 확인
                if "endDate" in sub and sub["endDate"] < datetime.utcnow():
                    continue
                
                return True
        
        return False
    
    @staticmethod
    def get_active_subscriptions(user):
        """활성 구독 목록 조회
        
        Args:
            user: 사용자 정보
            
        Returns:
            list: 활성 구독 목록
        """
        if not user or "subscriptions" not in user:
            return []
        
        active_subs = []
        for sub in user["subscriptions"]:
            if sub.get("status") == "active":
                # 만료 날짜 확인
                if "endDate" in sub and sub["endDate"] < datetime.utcnow():
                    continue
                
                active_subs.append(sub.get("product"))
        
        return active_subs
