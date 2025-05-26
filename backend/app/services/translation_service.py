# backend/app/services/translation_service.py
import os
import json
import aiohttp
from redis.asyncio import Redis  # 최신 Redis 라이브러리 사용
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import openai  # ChatGPT를 사용하기 위한 openai 라이브러리

class TranslationService:
    """번역 서비스 클래스"""
    
    def __init__(self):
        self.api_key = os.environ.get('GOOGLE_TRANSLATE_API_KEY')
        self.project_id = os.environ.get('GOOGLE_PROJECT_ID')
        self.base_url = "https://translation.googleapis.com/language/translate/v2"
        self.languages_url = f"{self.base_url}/languages"
        self.redis = None
        self.cache_expiration = 7 * 24 * 60 * 60  # 7일 캐시
        
        # OpenAI API 키 설정
        self.openai_api_key = os.environ.get('OPENAI_API_KEY')
        openai.api_key = self.openai_api_key
        
        # 영어 기본 번역 (클라이언트에서 제공)
        self.base_en_translations = self._load_base_translations()
    
    async def get_redis(self):
        """Redis 연결 가져오기"""
        if self.redis is None:
            redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
            self.redis = Redis.from_url(redis_url)
        return self.redis
    
    def _load_base_translations(self) -> Dict[str, Any]:
        """기본 영어 번역 로드"""
        try:
            base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            translations_path = os.path.join(base_path, 'static/translations/en.json')
            
            with open(translations_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            # 파일이 없으면 빈 딕셔너리 반환
            return {}
    
    async def translate_text(self, text: str, target_language: str, source_language: str = 'en') -> str:
        """
        텍스트 번역 (Google Translate API 사용)
        
        Args:
            text: 번역할 텍스트
            target_language: 대상 언어 코드
            source_language: 소스 언어 코드 (기본값: 'en')
            
        Returns:
            번역된 텍스트
        """
        # 캐시 키 생성
        redis = await self.get_redis()
        cache_key = f"translation:{source_language}:{target_language}:{hash(text)}"
        
        # 캐시 확인
        cached = await redis.get(cache_key)
        if cached:
            return cached.decode('utf-8')
        
        # Google Translate API 호출
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}?key={self.api_key}",
                json={
                    "q": text,
                    "source": source_language,
                    "target": target_language,
                    "format": "text"
                }
            ) as response:
                result = await response.json()
                
        if "data" in result and "translations" in result["data"]:
            translated_text = result["data"]["translations"][0]["translatedText"]
            
            # 캐시에 저장
            await redis.set(cache_key, translated_text, ex=self.cache_expiration)
            
            return translated_text
        else:
            raise Exception(f"Translation failed: {result}")
    
    async def translate_learning_feedback(self, 
                                         feedback: str, 
                                         target_language: str, 
                                         source_language: str = 'en',
                                         context: Optional[str] = None) -> str:
        """
        학습 피드백 번역 (ChatGPT 사용)
        
        Args:
            feedback: 번역할 피드백 텍스트
            target_language: 대상 언어 코드
            source_language: 소스 언어 코드 (기본값: 'en')
            context: 번역 컨텍스트 (선택사항)
            
        Returns:
            번역된 피드백 텍스트
        """
        # 캐시 키 생성
        redis = await self.get_redis()
        cache_key = f"feedback_translation:{source_language}:{target_language}:{hash(feedback)}"
        
        # 캐시 확인
        cached = await redis.get(cache_key)
        if cached:
            return cached.decode('utf-8')
        
        # 언어 코드를 언어 이름으로 변환 (GPT가 더 이해하기 쉽게)
        language_names = {
            'en': 'English',
            'ko': 'Korean',
            'ja': 'Japanese',
            'zh': 'Chinese',
            'vi': 'Vietnamese',
            'es': 'Spanish',
            'fr': 'French',
            'hi': 'Hindi',
            'th': 'Thai',
            'de': 'German',
            'mn': 'Mongolian',
            'ar': 'Arabic',
            'pt': 'Portuguese',
            'tr': 'Turkish'
        }
        
        target_lang_name = language_names.get(target_language, target_language)
        source_lang_name = language_names.get(source_language, source_language)
        
        # ChatGPT 프롬프트 구성
        prompt = f"""Translate the following language learning feedback from {source_lang_name} to {target_lang_name}.
        Keep the tone educational, supportive, and clear. Preserve formatting and any special terms.
        
        """
        
        if context:
            prompt += f"""Context: {context}
            
            """
            
        prompt += f"""Feedback to translate:
        {feedback}
        
        Translated feedback:"""
        
        try:
            # openai.ChatCompletion을 사용한 비동기 호출
            completion = await openai.ChatCompletion.acreate(
                model="gpt-4",  # 또는 사용 가능한 모델
                messages=[
                    {"role": "system", "content": "You are a helpful language learning assistant that provides accurate and natural translations."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1024,
                temperature=0.3  # 정확한 번역을 위해 낮은 온도 설정
            )
            
            translated_feedback = completion.choices[0].message.content.strip()
            
            # 캐시에 저장
            await redis.set(cache_key, translated_feedback, ex=self.cache_expiration)
            
            return translated_feedback
            
        except Exception as e:
            # OpenAI API 오류 시 Google Translate로 폴백
            return await self.translate_text(feedback, target_language, source_language)
    
    async def get_language_translations(self, language: str, namespace: str = 'translation') -> Dict[str, Any]:
        """
        특정 언어의 번역 리소스 가져오기
        
        Args:
            language: 언어 코드
            namespace: 네임스페이스
            
        Returns:
            번역 리소스
        """
        # 캐시 키 생성
        redis = await self.get_redis()
        cache_key = f"translations:{language}:{namespace}"
        
        # 캐시 확인
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached.decode('utf-8'))
        
        # 영어 기본 번역을 기반으로 다른 언어 번역 생성
        translations = {}
        
        # 중첩 딕셔너리를 평면화
        flat_keys = self._flatten_dict(self.base_en_translations.get('translation', {}))
        
        # 각 키를 번역
        for key, value in flat_keys.items():
            translated_value = await self.translate_text(value, language)
            self._set_nested_dict(translations, key.split('.'), translated_value)
        
        # 번역 결과를 캐시에 저장
        await redis.set(cache_key, json.dumps(translations), ex=self.cache_expiration)
        
        return {namespace: translations}
    
    async def get_supported_languages(self) -> List[Dict[str, str]]:
        """
        지원되는 언어 목록 가져오기
        
        Returns:
            지원 언어 목록
        """
        # 캐시 키 생성
        redis = await self.get_redis()
        cache_key = "supported_languages"
        
        # 캐시 확인
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached.decode('utf-8'))
        
        # Google Translate API 호출
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.languages_url}?key={self.api_key}&target=en"
            ) as response:
                result = await response.json()
                
        if "data" in result and "languages" in result["data"]:
            languages = []
            
            for lang in result["data"]["languages"]:
                if lang.get("language") in ["en", "ko", "ja", "zh", "vi", "es", "fr", "hi", "th", "de", "mn", "ar", "pt", "tr"]:
                    languages.append({
                        "code": lang.get("language"),
                        "name": lang.get("name")
                    })
            
            # 캐시에 저장
            await redis.set(cache_key, json.dumps(languages), ex=self.cache_expiration)
            
            return languages
        else:
            raise Exception(f"Failed to fetch supported languages: {result}")
    
    async def clear_cache(self) -> None:
        """캐시 지우기"""
        redis = await self.get_redis()
        
        # 번역 관련 캐시 키 패턴
        translation_keys = await redis.keys("translation:*")
        feedback_keys = await redis.keys("feedback_translation:*")
        translations_keys = await redis.keys("translations:*")
        
        all_keys = translation_keys + feedback_keys + translations_keys
        all_keys.append("supported_languages")
        
        if all_keys:
            await redis.delete(*all_keys)
    
    def _flatten_dict(self, d: Dict[str, Any], parent_key: str = '') -> Dict[str, str]:
        """중첩 딕셔너리를 평면화"""
        items = {}
        for k, v in d.items():
            new_key = f"{parent_key}.{k}" if parent_key else k
            
            if isinstance(v, dict):
                items.update(self._flatten_dict(v, new_key))
            else:
                items[new_key] = str(v)
                
        return items
    
    def _set_nested_dict(self, d: Dict[str, Any], keys: List[str], value: Any) -> None:
        """중첩 딕셔너리에 값 설정"""
        if len(keys) == 1:
            d[keys[0]] = value
        else:
            if keys[0] not in d:
                d[keys[0]] = {}
            self._set_nested_dict(d[keys[0]], keys[1:], value)