import re
import unicodedata
import os

# ✅ 수정 (클래스 import 후 편의 함수 생성)
from app.utils.validators import Validators
def validate_email(email):
    return Validators.validate_email(email)
def validate_password(password):
    return Validators.validate_password(password)


class Validators:
    """입력 검증 유틸리티"""
    
    @staticmethod
    def validate_email(email):
        """이메일 유효성 검증
        
        Args:
            email: 이메일 주소
            
        Returns:
            bool: 유효성 여부
        """
        # 이메일 형식 검증
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
    def validate_name(name):
        """이름 유효성 검증
        
        Args:
            name: 이름
            
        Returns:
            bool: 유효성 여부
        """
        # 2자 이상, 문자만 포함
        if len(name) < 2:
            return False
        
        # 문자만 포함 (유니코드 고려)
        for char in name:
            if not unicodedata.category(char).startswith('L') and char != ' ':
                return False
        
        return True
    
    @staticmethod
    def validate_language_code(language_code):
        """언어 코드 유효성 검증
        
        Args:
            language_code: 언어 코드
            
        Returns:
            bool: 유효성 여부
        """
        # 지원하는 언어 코드 목록
        supported_languages = [
            "ko", "en", "ja", "zh", "vi", "es", 
            "fr", "hi", "th", "de", "mn", "ar", 
            "pt", "tr"
        ]
        
        return language_code in supported_languages
    
    @staticmethod
    def validate_korean_level(level):
        """한국어 레벨 유효성 검증
        
        Args:
            level: 한국어 레벨
            
        Returns:
            bool: 유효성 여부
        """
        # 지원하는 레벨 목록
        supported_levels = ["beginner", "intermediate", "advanced"]
        
        return level in supported_levels
    
    @staticmethod
    def validate_topik_level(level):
        """TOPIK 레벨 유효성 검증
        
        Args:
            level: TOPIK 레벨
            
        Returns:
            bool: 유효성 여부
        """
        # 1부터 6까지의 정수
        try:
            level_int = int(level)
            return 1 <= level_int <= 6
        except ValueError:
            return False
    
    @staticmethod
    def validate_journey_level(level):
        """한글 여정 레벨 유효성 검증
        
        Args:
            level: 한글 여정 레벨
            
        Returns:
            bool: 유효성 여부
        """
        # 지원하는 레벨 목록
        supported_levels = ["level1", "level2", "level3", "level4"]
        
        return level in supported_levels
    
    @staticmethod
    def validate_product_code(product):
        """상품 코드 유효성 검증
        
        Args:
            product: 상품 코드
            
        Returns:
            bool: 유효성 여부
        """
        # 지원하는 상품 코드 목록
        supported_products = ["talk", "drama", "test", "journey"]
        
        return product in supported_products
    
    @staticmethod
    def validate_bundle_code(bundle):
        """번들 코드 유효성 검증
        
        Args:
            bundle: 번들 코드
            
        Returns:
            bool: 유효성 여부
        """
        # 지원하는 번들 코드 목록
        supported_bundles = ["bundle_2", "bundle_3", "bundle_all"]
        
        return bundle in supported_bundles
    
    @staticmethod
    def validate_audio_format(filename):
        """오디오 파일 형식 유효성 검증
        
        Args:
            filename: 파일 이름
            
        Returns:
            bool: 유효성 여부
        """
        # 지원하는 오디오 형식
        supported_formats = [".wav", ".mp3", ".m4a", ".ogg", ".webm"]
        
        # 파일 확장자 확인
        file_ext = os.path.splitext(filename)[1].lower()
        
        return file_ext in supported_formats
    
    @staticmethod
    def sanitize_text(text):
        """텍스트 샌드박싱
        
        Args:
            text: 입력 텍스트
            
        Returns:
            str: 샌드박싱된 텍스트
        """
        # HTML 태그 제거
        text = re.sub(r'<[^>]*>', '', text)
        
        # 위험할 수 있는 문자 제거
        text = text.replace('&', '&amp;')
        text = text.replace('<', '&lt;')
        text = text.replace('>', '&gt;')
        text = text.replace('"', '&quot;')
        text = text.replace("'", '&#x27;')
        
        return text
