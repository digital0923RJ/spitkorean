"""
SpitKorean - 콘텐츠 생성 태스크
강의 콘텐츠, 학습 자료 등을 자동 생성하기 위한 Celery 태스크들을 정의합니다.
"""
from celery import shared_task
import json
import os
from datetime import datetime
from app.services.gpt_service import GPTService
from app.utils.logger import LogManager
from app.models.drama import DramaModel
from app.models.test import TestModel
from app.models.journey import JourneyModel

logger = LogManager().logger
gpt_service = GPTService()
drama_model = DramaModel()
test_model = TestModel()
journey_model = JourneyModel()

@shared_task
async def generate_drama_content(level, theme=None, count=5):
    """
    Drama Builder를 위한 새로운 드라마 콘텐츠 생성
    
    Args:
        level (str): 콘텐츠 레벨 ('beginner', 'intermediate', 'advanced')
        theme (str, optional): 테마 또는 주제
        count (int, optional): 생성할 아이템 개수
        
    Returns:
        dict: 생성된 콘텐츠 데이터
    """
    try:
        # 레벨별 문장 복잡도 설정
        complexity_map = {
            "beginner": "3-5단어 단문으로 구성된 매우 간단한 한국어 문장",
            "intermediate": "7-10단어 복문으로 구성된 중간 난이도의 한국어 문장",
            "advanced": "12단어 이상의 복잡한 복문으로 구성된 고급 한국어 문장"
        }
        
        complexity = complexity_map.get(level, complexity_map["intermediate"])
        
        # 테마 설정
        theme_prompt = f", 주제: {theme}" if theme else ""
        
        # GPT를 이용한 콘텐츠 생성
        prompt = f"""
        한국어 학습용 드라마 문장을 생성해주세요. 다음 조건을 만족해야 합니다:
        - 난이도: {level} ({complexity})
        - 수량: {count}개 문장{theme_prompt}
        - 각 문장은 실생활에서 자주 사용되는 표현이어야 함
        - 각 문장에 대해 영어 번역과 핵심 문법 요소 설명 추가
        - 유사한 패턴의 예문 3개 추가
        
        JSON 형식으로 반환해주세요:
        {{
            "sentences": [
                {{
                    "korean": "한국어 문장",
                    "english": "영어 번역",
                    "grammar_points": ["핵심 문법 1", "핵심 문법 2"],
                    "similar_examples": [
                        {{"korean": "유사 예문 1", "english": "영어 번역 1"}},
                        {{"korean": "유사 예문 2", "english": "영어 번역 2"}},
                        {{"korean": "유사 예문 3", "english": "영어 번역 3"}}
                    ]
                }}
            ]
        }}
        """
        
        response = await gpt_service.generate_content(prompt)
        content = json.loads(response)
        
        # 생성된 콘텐츠에 메타데이터 추가
        content_with_meta = {
            "level": level,
            "theme": theme,
            "generated_at": datetime.now().isoformat(),
            "sentences": content["sentences"]
        }
        
        # 데이터베이스에 저장
        drama_id = await drama_model.create_content(content_with_meta)
        
        return {
            "status": "success",
            "drama_id": drama_id,
            "content": content_with_meta
        }
    except Exception as e:
        logger.error(f"Drama content generation failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "level": level,
            "theme": theme
        }

@shared_task
async def generate_test_questions(level, category, count=10):
    """
    Test & Study를 위한 새로운 시험 문제 생성
    
    Args:
        level (str): TOPIK 레벨 (1-6)
        category (str): 문제 카테고리 ('vocabulary', 'grammar', 'reading', 'writing', 'listening')
        count (int, optional): 생성할 문제 개수
        
    Returns:
        dict: 생성된 문제 데이터
    """
    try:
        # 카테고리별 프롬프트 맞춤 설정
        category_prompts = {
            "vocabulary": "어휘력을 테스트하는 객관식 문제",
            "grammar": "문법 활용을 테스트하는 빈칸 채우기 문제",
            "reading": "독해력을 테스트하는 지문과 질문",
            "writing": "작문 능력을 테스트하는 주제와 조건",
            "listening": "청취력을 테스트하는 대화문과 질문"
        }
        
        category_desc = category_prompts.get(category, category_prompts["vocabulary"])
        
        # GPT를 이용한 문제 생성
        prompt = f"""
        한국어 TOPIK {level}급 {category} 시험 문제를 생성해주세요. 다음 조건을 만족해야 합니다:
        - {level}급 수준에 맞는 {category_desc}
        - 총 {count}개 문제
        - 각 문제는 4개의 객관식 답변과 정답을 포함
        - 각 문제에 대한 상세한 해설 포함
        - 공식 TOPIK 시험 형식 준수
        
        JSON 형식으로 반환해주세요:
        {{
            "questions": [
                {{
                    "question_text": "문제 내용",
                    "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
                    "correct_answer": 0,  // 0-indexed 정답 인덱스
                    "explanation": "문제 해설",
                    "difficulty": "상/중/하",  // 난이도 표시
                    "related_grammar": ["관련 문법1", "관련 문법2"]  // 관련 문법 요소
                }}
            ]
        }}
        """
        
        response = await gpt_service.generate_content(prompt)
        content = json.loads(response)
        
        # 생성된 콘텐츠에 메타데이터 추가
        content_with_meta = {
            "topik_level": level,
            "category": category,
            "generated_at": datetime.now().isoformat(),
            "questions": content["questions"]
        }
        
        # 데이터베이스에 저장
        test_id = await test_model.create_test(content_with_meta)
        
        return {
            "status": "success",
            "test_id": test_id,
            "content": content_with_meta
        }
    except Exception as e:
        logger.error(f"Test questions generation failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "level": level,
            "category": category
        }

@shared_task
async def generate_journey_content(level, theme=None, count=5):
    """
    Korean Journey를 위한 새로운 읽기 콘텐츠 생성
    
    Args:
        level (str): 콘텐츠 레벨 ('level1', 'level2', 'level3', 'level4')
        theme (str, optional): 테마 또는 주제
        count (int, optional): 생성할 세그먼트 개수
        
    Returns:
        dict: 생성된 콘텐츠 데이터
    """
    try:
        # 레벨별 콘텐츠 복잡도 설정
        level_map = {
            "level1": "한글 초보자를 위한 매우 간단한 1-2음절 단어와 기초 문장",
            "level2": "기초 한국어 학습자를 위한 간단한 일상 대화와 문장",
            "level3": "중급 한국어 학습자를 위한 뉴스, 기사, 에세이 텍스트",
            "level4": "고급 한국어 학습자를 위한 전문적인 주제의 복잡한 텍스트"
        }
        
        level_desc = level_map.get(level, level_map["level2"])
        
        # 테마 설정
        theme_prompt = f", 주제: {theme}" if theme else ""
        
        # GPT를 이용한 콘텐츠 생성
        prompt = f"""
        한국어 읽기 학습용 콘텐츠를 생성해주세요. 다음 조건을 만족해야 합니다:
        - 난이도: {level} ({level_desc})
        - 세그먼트 수: {count}개{theme_prompt}
        - 각 세그먼트는 논리적으로 연결되어 하나의 이야기를 형성해야 함
        - 각 세그먼트에 강조할 발음 패턴 및 발음 팁 포함
        - 어휘 설명 및 문화적 참고사항 포함
        
        JSON 형식으로 반환해주세요:
        {{
            "title": "콘텐츠 제목",
            "segments": [
                {{
                    "korean_text": "한국어 텍스트",
                    "english_translation": "영어 번역",
                    "pronunciation_focus": ["발음 포인트1", "발음 포인트2"],
                    "pronunciation_tips": "발음 팁",
                    "vocabulary": [
                        {{"word": "단어1", "meaning": "의미1", "example": "예문1"}},
                        {{"word": "단어2", "meaning": "의미2", "example": "예문2"}}
                    ],
                    "cultural_notes": "문화적 참고사항"
                }}
            ]
        }}
        """
        
        response = await gpt_service.generate_content(prompt)
        content = json.loads(response)
        
        # 생성된 콘텐츠에 메타데이터 추가
        content_with_meta = {
            "level": level,
            "theme": theme,
            "generated_at": datetime.now().isoformat(),
            "title": content["title"],
            "segments": content["segments"]
        }
        
        # 데이터베이스에 저장
        journey_id = await journey_model.create_content(content_with_meta)
        
        # TTS 오디오 생성 태스크 등록
        await generate_journey_audio(journey_id)
        
        return {
            "status": "success",
            "journey_id": journey_id,
            "content": content_with_meta
        }
    except Exception as e:
        logger.error(f"Journey content generation failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "level": level,
            "theme": theme
        }

@shared_task
async def generate_journey_audio(journey_id):
    """
    Korean Journey 콘텐츠에 대한 오디오 파일 생성
    
    Args:
        journey_id (str): 오디오를 생성할 콘텐츠 ID
        
    Returns:
        dict: 생성 결과 데이터
    """
    try:
        # 콘텐츠 조회
        content = await journey_model.find_by_id(journey_id)
        if not content:
            return {
                "status": "error",
                "error": "Content not found",
                "journey_id": journey_id
            }
        
        # TTS 서비스 가져오기
        from app.services.tts_service import TTSService
        tts_service = TTSService()
        
        audio_files = []
        segments = content.get("segments", [])
        
        # 각 세그먼트에 대한 오디오 생성
        for i, segment in enumerate(segments):
            korean_text = segment.get("korean_text", "")
            
            # 속도 조절 (레벨에 따라)
            speed_rate = {
                "level1": 0.7,  # 느림
                "level2": 0.8,
                "level3": 0.9,
                "level4": 1.0   # 보통 속도
            }.get(content.get("level", "level2"), 0.8)
            
            # TTS 오디오 생성
            audio_path = await tts_service.synthesize(
                korean_text, 
                "ko-KR-Wavenet-A", 
                speed_rate=speed_rate
            )
            
            audio_files.append({
                "segment_index": i,
                "path": audio_path,
                "duration": await tts_service.get_audio_duration(audio_path)
            })
        
        # 오디오 파일 정보 업데이트
        await journey_model.update_audio_files(journey_id, audio_files)
        
        return {
            "status": "success",
            "journey_id": journey_id,
            "audio_files": audio_files
        }
    except Exception as e:
        logger.error(f"Journey audio generation failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "journey_id": journey_id
        }
