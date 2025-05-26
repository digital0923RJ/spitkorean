import logging
import json
from datetime import datetime

class LogManager:
    """중앙 로깅 시스템"""
    
    def __init__(self, app_name="spitkorean", log_level=logging.INFO):
        """
        Args:
            app_name: 애플리케이션 이름
            log_level: 로깅 레벨
        """
        self.logger = logging.getLogger(app_name)
        self.logger.setLevel(log_level)
        
        # 콘솔 핸들러
        console = logging.StreamHandler()
        console.setLevel(log_level)
        
        # JSON 포맷
        formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "service": "%(name)s", "message": %(message)s}'
        )
        console.setFormatter(formatter)
        self.logger.addHandler(console)
        
    def log(self, level, message, extra=None):
        """구조화된 로그 기록
        
        Args:
            level: 로깅 레벨
            message: 로그 메시지
            extra: 추가 정보 (선택적)
        """
        log_data = {"message": message}
        if extra:
            log_data.update(extra)
            
        self.logger.log(level, json.dumps(log_data))
        
    def info(self, message, extra=None):
        """INFO 레벨 로그 기록
        
        Args:
            message: 로그 메시지
            extra: 추가 정보 (선택적)
        """
        self.log(logging.INFO, message, extra)
        
    def error(self, message, extra=None):
        """ERROR 레벨 로그 기록
        
        Args:
            message: 로그 메시지
            extra: 추가 정보 (선택적)
        """
        self.log(logging.ERROR, message, extra)
        
    def warning(self, message, extra=None):
        """WARNING 레벨 로그 기록
        
        Args:
            message: 로그 메시지
            extra: 추가 정보 (선택적)
        """
        self.log(logging.WARNING, message, extra)
        
    def debug(self, message, extra=None):
        """DEBUG 레벨 로그 기록
        
        Args:
            message: 로그 메시지
            extra: 추가 정보 (선택적)
        """
        self.log(logging.DEBUG, message, extra)
        
    def critical(self, message, extra=None):
        """CRITICAL 레벨 로그 기록
        
        Args:
            message: 로그 메시지
            extra: 추가 정보 (선택적)
        """
        self.log(logging.CRITICAL, message, extra)
        
    def exception(self, message, extra=None):
        """예외 로깅
        
        Args:
            message: 로그 메시지
            extra: 추가 정보 (선택적)
        """
        log_data = {"message": message}
        if extra:
            log_data.update(extra)
            
        self.logger.exception(json.dumps(log_data))
        
    def log_request(self, request, user_id=None):
        """요청 로깅
        
        Args:
            request: 요청 객체
            user_id: 사용자 ID (선택적)
        """
        extra = {
            "method": request.method,
            "path": request.path,
            "remote_addr": request.remote_addr,
            "user_agent": request.headers.get("User-Agent", ""),
            "user_id": user_id
        }
        
        self.info(f"Request: {request.method} {request.path}", extra)
        
    def log_response(self, response, duration_ms=None, user_id=None):
        """응답 로깅
        
        Args:
            response: 응답 객체
            duration_ms: 처리 시간 (밀리초) (선택적)
            user_id: 사용자 ID (선택적)
        """
        extra = {
            "status_code": response[1] if isinstance(response, tuple) else 200,
            "duration_ms": duration_ms,
            "user_id": user_id
        }
        
        self.info(f"Response: {extra['status_code']}", extra)
        
    def log_error(self, error, user_id=None, request=None):
        """오류 로깅
        
        Args:
            error: 예외 객체
            user_id: 사용자 ID (선택적)
            request: 요청 객체 (선택적)
        """
        extra = {
            "error_type": type(error).__name__,
            "error_message": str(error),
            "user_id": user_id
        }
        
        if request:
            extra.update({
                "method": request.method,
                "path": request.path,
                "remote_addr": request.remote_addr
            })
            
        self.error(f"Error: {type(error).__name__}", extra)
