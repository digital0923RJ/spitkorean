import os
import tempfile
import json
from tenacity import retry, stop_after_attempt, wait_random_exponential
import openai

class WhisperService:
    """Whisper 서비스 - 음성 인식 및 발음 평가를 위한 서비스"""
    
    def __init__(self):
        """API 키 설정"""
        openai.api_key = os.getenv("OPENAI_API_KEY")
    
    @retry(stop=stop_after_attempt(3), wait=wait_random_exponential(min=1, max=10))
    async def transcribe_audio(self, audio_data):
        """음성 인식
        
        Args:
            audio_data: 오디오 바이너리 데이터
            
        Returns:
            dict: 인식 결과
        """
        # 임시 파일 생성
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name
        
        try:
            # Whisper API 호출
            with open(temp_file_path, "rb") as audio_file:
                response = await openai.Audio.atranscribe("whisper-1", audio_file, language="ko")
            
            return {
                "text": response["text"],
                "language": response.get("language", "ko")
            }
        finally:
            # 임시 파일 삭제
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
    
    @retry(stop=stop_after_attempt(3), wait=wait_random_exponential(min=1, max=10))
    async def evaluate_pronunciation(self, transcribed_text, original_text):
        """발음 평가
        
        Args:
            transcribed_text: 인식된 텍스트
            original_text: 원본 텍스트
            
        Returns:
            float: 발음 점수 (0-100)
        """
        if not transcribed_text or not original_text:
            return 0
        
        # GPT-4를 사용하여 발음 평가
        messages = [
            {"role": "system", "content": "당신은 한국어 발음 평가 전문가입니다. 두 텍스트의 유사도를 분석하여 발음 정확도 점수를 100점 만점으로 제공해야 합니다."},
            {"role": "user", "content": f"원본 텍스트와 음성 인식 결과를 비교하여 발음 정확도를 평가해주세요. 100점 만점으로 점수를 매겨주세요.\n\n원본 텍스트:\n{original_text}\n\n인식된 텍스트:\n{transcribed_text}"}
        ]
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4-1106-preview",
            messages=messages,
            temperature=0.1,
            max_tokens=300,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        content = response.choices[0].message.content.strip()
        
        # 점수 추출
        import re
        score_match = re.search(r'(\d+)[\s/]*100', content)
        if score_match:
            score = int(score_match.group(1))
            # 범위 제한
            score = max(0, min(100, score))
            return score
        
        # 백업 방법: 간단한 유사도 계산
        return self._calculate_similarity(transcribed_text, original_text)
    
    def _calculate_similarity(self, text1, text2):
        """텍스트 유사도 계산 (간단한 방법)
        
        Args:
            text1: 첫 번째 텍스트
            text2: 두 번째 텍스트
            
        Returns:
            float: 유사도 점수 (0-100)
        """
        # 공백과 구두점 제거
        import re
        text1 = re.sub(r'[^\w\s]', '', text1.lower())
        text2 = re.sub(r'[^\w\s]', '', text2.lower())
        
        # 단어 목록 생성
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        # 자카드 유사도 계산
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        if union == 0:
            return 0
        
        jaccard = intersection / union
        return round(jaccard * 100)
    
    @retry(stop=stop_after_attempt(3), wait=wait_random_exponential(min=1, max=10))
    async def analyze_pronunciation_details(self, audio_data, original_text):
        """상세 발음 분석
        
        Args:
            audio_data: 오디오 바이너리 데이터
            original_text: 원본 텍스트
            
        Returns:
            dict: 발음 분석 결과
        """
        # 음성 인식
        recognition_result = await self.transcribe_audio(audio_data)
        transcribed_text = recognition_result.get("text", "")
        
        # 발음 점수
        pronunciation_score = await self.evaluate_pronunciation(transcribed_text, original_text)
        
        # GPT-4를 사용하여 상세 분석
        messages = [
            {"role": "system", "content": "당신은 한국어 발음 평가 전문가입니다. 발음의 강점과 약점을 분석하고 개선 방법을 제시해야 합니다."},
            {"role": "user", "content": f"다음 음성 인식 결과와 원본 텍스트를 비교하여 발음의 강점, 약점, 개선점을 분석해주세요.\n\n원본 텍스트:\n{original_text}\n\n인식된 텍스트:\n{transcribed_text}"}
        ]
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4-1106-preview",
            messages=messages,
            temperature=0.3,
            max_tokens=800,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        analysis_text = response.choices[0].message.content.strip()
        
        # 구조화된 분석 결과 요청
        messages.append({"role": "assistant", "content": analysis_text})
        messages.append({"role": "user", "content": "위 분석을 'strengths', 'weaknesses', 'improvements' 필드를 가진 JSON 형식으로 변환해주세요. 각 필드는 문자열 목록이어야 합니다."})
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4-1106-preview",
            messages=messages,
            temperature=0.1,
            max_tokens=800,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        json_content = response.choices[0].message.content.strip()
        
        # JSON 파싱 시도
        analysis = {}
        try:
            # JSON 부분 추출
            import re
            json_match = re.search(r'\{[\s\S]*\}', json_content)
            if json_match:
                json_str = json_match.group(0)
                analysis = json.loads(json_str)
        except:
            # 파싱 실패 시 기본 분석 결과 제공
            analysis = {
                "strengths": ["분석을 위한 충분한 정보가 없습니다."],
                "weaknesses": ["분석을 위한 충분한 정보가 없습니다."],
                "improvements": ["더 많은 연습이 필요합니다."]
            }
        
        # 필요한 필드 확인
        for key in ["strengths", "weaknesses", "improvements"]:
            if key not in analysis:
                analysis[key] = []
        
        return {
            "score": pronunciation_score,
            "transcribed_text": transcribed_text,
            "original_text": original_text,
            "analysis": analysis
        }
