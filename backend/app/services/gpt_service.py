import os
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
import json
from tenacity import retry, stop_after_attempt, wait_random_exponential

class GPTService:
    """GPT-4 서비스 - 대화 및 콘텐츠 생성을 위한 서비스"""
    
    def __init__(self):
        """API 키 설정"""
        # CHANGE: New way to initialize client
        self.openai_client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # NEW: Claude client as backup
        self.claude_client = AsyncAnthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY")
        ) if os.getenv("ANTHROPIC_API_KEY") else None
    
    @retry(stop=stop_after_attempt(3), wait=wait_random_exponential(min=1, max=10))
    async def generate_response(self, chat_history, user_level, native_language, session_id=None):
        """대화 응답 생성
        
        Args:
            chat_history: 대화 히스토리
            user_level: 사용자 레벨 (beginner, intermediate, advanced)
            native_language: 사용자 모국어
            session_id: 세션 ID (선택적)
            
        Returns:
            str: 생성된 응답
        """
        # 레벨별 시스템 프롬프트 설정
        system_prompts = {
            "beginner": f"""당신은 한국어 학습자를 위한 친절한 AI 튜터입니다. 초급 학습자에게 맞춰 매우 간단한 한국어로 응답하고, 
                         영어를 30% 섞어 사용하세요. 천천히, 쉬운 단어로 설명해주세요. 모국어: {native_language}""",
            
            "intermediate": f"""당신은 한국어 학습자를 위한 AI 튜터입니다. 중급 학습자에게 맞춰 일상적인 한국어로 자연스럽게 대화하세요. 
                             필요할 때 영어를 30% 정도 섞어 사용해도 됩니다. 모국어: {native_language}""",
            
            "advanced": f"""당신은 한국어 학습자를 위한 전문적인 AI 튜터입니다. 고급 학습자에게 맞춰 자연스러운 한국어를 구사하세요. 
                         깊이 있는 주제로 대화하고, 영어는 5% 미만으로 최소한만 사용하세요. 모국어: {native_language}"""
        }
        
        # 레벨 선택, 기본값은 초급
        system_prompt = system_prompts.get(user_level, system_prompts["beginner"])
        
        # 대화 히스토리 포맷팅
        formatted_history = []
        for msg in chat_history:
            formatted_history.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # 시스템 메시지 추가
        messages = [
            {"role": "system", "content": system_prompt}
        ] + formatted_history
        
        # GPT 호출
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-1106-preview",  # 또는 gpt-4, gpt-3.5-turbo 등 사용 가능한 모델
            messages=messages,
            temperature=0.7,
            max_tokens=800,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        # 응답 텍스트 추출
        response_text = response.choices[0].message.content.strip()
        
        return response_text
    
    @retry(stop=stop_after_attempt(3), wait=wait_random_exponential(min=1, max=10))
    async def generate_drama_sentences(self, prompt, count=5):
        """드라마 문장 생성
        
        Args:
            prompt: 생성 프롬프트
            count: 생성할 문장 수 (기본값: 5)
            
        Returns:
            list: 생성된 문장 목록
        """
        messages = [
            {"role": "system", "content": "당신은 한국어 학습 콘텐츠 생성을 돕는 AI 어시스턴트입니다."},
            {"role": "user", "content": f"{prompt}\n각 문장은 대화체로, 실제 드라마에서 사용될 수 있는 자연스러운 문장이어야 합니다. {count}개의 문장을 생성해주세요."}
        ]
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=messages,
            temperature=0.8,
            max_tokens=1000,
            top_p=1.0,
            frequency_penalty=0.5,
            presence_penalty=0.0
        )
        
        content = response.choices[0].message.content.strip()
        
        # 문장 추출
        sentences = []
        for line in content.split('\n'):
            line = line.strip()
            if line and not line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.')):
                sentences.append(line)
            else:
                # 번호가 있는 경우 번호 제거
                parts = line.split('.', 1)
                if len(parts) > 1 and parts[0].isdigit():
                    sentences.append(parts[1].strip())
        
        # 중복 제거 및 개수 제한
        sentences = list(dict.fromkeys(sentences))[:count]
        
        return sentences
    
    @retry(stop=stop_after_attempt(3), wait=wait_random_exponential(min=1, max=10))
    async def generate_similar_sentences(self, original_sentence, level):
        """유사 문장 생성
        
        Args:
            original_sentence: 원본 문장
            level: 난이도 (beginner, intermediate, advanced)
            
        Returns:
            list: 유사 문장 목록
        """
        counts = {
            "beginner": 3,
            "intermediate": 5,
            "advanced": 7
        }
        
        count = counts.get(level, 3)
        
        messages = [
            {"role": "system", "content": "당신은 한국어 학습 콘텐츠 생성을 돕는 AI 어시스턴트입니다."},
            {"role": "user", "content": f"다음 한국어 문장과 유사한 구조를 가진 {count}개의 다른 문장을 생성해주세요. 문법과 어휘 수준은 {level} 레벨에 맞춰주세요.\n\n원본 문장: {original_sentence}"}
        ]
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
            top_p=1.0,
            frequency_penalty=0.8,
            presence_penalty=0.4
        )
        
        content = response.choices[0].message.content.strip()
        
        # 문장 추출
        sentences = []
        for line in content.split('\n'):
            line = line.strip()
            if line and not line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '-', '•')):
                sentences.append(line)
            else:
                # 번호 또는 기호가 있는 경우 제거
                parts = line.split('.', 1)
                if len(parts) > 1:
                    if parts[0].strip().isdigit():
                        sentences.append(parts[1].strip())
                else:
                    parts = line.split(' ', 1)
                    if len(parts) > 1 and (parts[0] == '-' or parts[0] == '•'):
                        sentences.append(parts[1].strip())
        
        # 중복 제거 및 개수 제한
        sentences = list(dict.fromkeys(sentences))[:count]
        
        return sentences
    
    @retry(stop=stop_after_attempt(3), wait=wait_random_exponential(min=1, max=10))
    async def extract_grammar_points(self, sentence, level):
        """문법 포인트 추출
        
        Args:
            sentence: 문장
            level: 난이도 (beginner, intermediate, advanced)
            
        Returns:
            list: 문법 포인트 목록
        """
        messages = [
            {"role": "system", "content": "당신은 한국어 문법 전문가입니다."},
            {"role": "user", "content": f"다음 한국어 문장에서 {level} 레벨에 중요한 문법 포인트를 3개 추출해주세요. 각 포인트는 '문법 요소', '설명', '예시'를 포함해야 합니다.\n\n문장: {sentence}"}
        ]
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=messages,
            temperature=0.3,
            max_tokens=1000,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        content = response.choices[0].message.content.strip()
        
        # 파싱 시도
        grammar_points = []
        try:
            # 구조화된 형태로 다시 요청
            messages.append({"role": "assistant", "content": content})
            messages.append({"role": "user", "content": "위 문법 포인트를 JSON 형식으로 변환해주세요. 각 포인트는 'element', 'explanation', 'example' 키를 가진 객체여야 합니다."})
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=messages,
                temperature=0.1,
                max_tokens=1000,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            json_content = response.choices[0].message.content.strip()
            # JSON 부분 추출
            import re
            json_match = re.search(r'\{[\s\S]*\}|\[[\s\S]*\]', json_content)
            if json_match:
                json_str = json_match.group(0)
                grammar_points = json.loads(json_str)
            else:
                # 일반 텍스트 파싱
                current_point = {}
                for line in content.split('\n'):
                    line = line.strip()
                    if line.startswith(('1.', '2.', '3.')):
                        if current_point and 'element' in current_point:
                            grammar_points.append(current_point)
                            current_point = {}
                        # 새 포인트 시작
                        parts = line.split('.', 1)
                        if len(parts) > 1:
                            current_point = {'element': parts[1].strip()}
                    elif ':' in line:
                        key, value = line.split(':', 1)
                        key = key.strip().lower()
                        value = value.strip()
                        if key in ('설명', 'explanation'):
                            current_point['explanation'] = value
                        elif key in ('예시', 'example'):
                            current_point['example'] = value
                
                # 마지막 포인트 추가
                if current_point and 'element' in current_point:
                    grammar_points.append(current_point)
        except:
            # 파싱 실패시 원본 텍스트 반환
            grammar_points = [{"element": "문법 분석", "explanation": content, "example": sentence}]
        
        return grammar_points
    
    @retry(stop=stop_after_attempt(3), wait=wait_random_exponential(min=1, max=10))
    async def generate_test_questions(self, prompt, count=10):
        """TOPIK 문제 생성
        
        Args:
            prompt: 생성 프롬프트
            count: 생성할 문제 수
            
        Returns:
            list: 생성된 문제 목록
        """
        messages = [
            {"role": "system", "content": "당신은 TOPIK 한국어 시험 문제를 생성하는 전문가입니다."},
            {"role": "user", "content": f"{prompt}\n\n각 문제는 'id', 'question', 'options', 'answer', 'explanation' 필드를 JSON 형식으로 가져야 합니다. options는 4개의 선택지를 포함해야 합니다."}
        ]
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=messages,
            temperature=0.7,
            max_tokens=2500,
            top_p=1.0,
            frequency_penalty=0.3,
            presence_penalty=0.0
        )
        
        content = response.choices[0].message.content.strip()
        
        # JSON 파싱 시도
        questions = []
        try:
            # JSON 부분 추출
            import re
            json_match = re.search(r'\[[\s\S]*\]', content)
            if json_match:
                json_str = json_match.group(0)
                questions = json.loads(json_str)
            else:
                # 일반 텍스트 파싱
                current_question = {}
                options = []
                
                for line in content.split('\n'):
                    line = line.strip()
                    
                    # 새 문제 시작
                    if line.startswith(('문제 ', '질문 ', 'Question ')):
                        if current_question and 'question' in current_question:
                            if options:
                                current_question['options'] = options
                                options = []
                            questions.append(current_question)
                            current_question = {}
                        
                        current_question = {'id': str(len(questions) + 1), 'question': line}
                    
                    # 선택지
                    elif re.match(r'^[①②③④⑤ABCDE][.)]\s', line):
                        option_text = re.sub(r'^[①②③④⑤ABCDE][.)]\s', '', line)
                        options.append(option_text)
                    
                    # 정답
                    elif line.startswith(('정답:', '답:', 'Answer:')):
                        answer_text = line.split(':', 1)[1].strip()
                        # 정답을 선택지 인덱스로 변환
                        if answer_text in ['①', 'A', '1', 'a']:
                            current_question['answer'] = 0
                        elif answer_text in ['②', 'B', '2', 'b']:
                            current_question['answer'] = 1
                        elif answer_text in ['③', 'C', '3', 'c']:
                            current_question['answer'] = 2
                        elif answer_text in ['④', 'D', '4', 'd']:
                            current_question['answer'] = 3
                        else:
                            current_question['answer'] = 0
                    
                    # 해설
                    elif line.startswith(('해설:', '설명:', 'Explanation:')):
                        explanation_text = line.split(':', 1)[1].strip()
                        current_question['explanation'] = explanation_text
                
                # 마지막 문제 추가
                if current_question and 'question' in current_question:
                    if options:
                        current_question['options'] = options
                    questions.append(current_question)
        except:
            # 파싱 실패 시 기본 문제 제공
            questions = [
                {
                    "id": "1",
                    "question": "문제 생성에 실패했습니다.",
                    "options": ["다시 시도해주세요.", "다른 레벨을 선택해주세요.", "나중에 다시 시도해주세요.", "관리자에게 문의해주세요."],
                    "answer": 0,
                    "explanation": "생성된 문제 형식이 올바르지 않습니다."
                }
            ]
        
        # 필요한 필드 확인 및 보완
        for i, q in enumerate(questions):
            if 'id' not in q:
                q['id'] = str(i + 1)
            if 'options' not in q or not q['options'] or len(q['options']) < 4:
                q['options'] = ["선택지 1", "선택지 2", "선택지 3", "선택지 4"]
            if 'answer' not in q:
                q['answer'] = 0
            if 'explanation' not in q:
                q['explanation'] = "해설이 제공되지 않았습니다."
        
        # 개수 제한
        return questions[:count]
    
    @retry(stop=stop_after_attempt(3), wait=wait_random_exponential(min=1, max=10))
    async def analyze_test_weaknesses(self, wrong_answers):
        """TOPIK 시험 취약점 분석
        
        Args:
            wrong_answers: 틀린 답변 목록
            
        Returns:
            list: 취약점 목록
        """
        messages = [
            {"role": "system", "content": "당신은 한국어 교육 전문가로, 학습자의 취약점을 분석합니다."},
            {"role": "user", "content": f"다음은 한국어 시험에서 틀린 문제들입니다. 이를 바탕으로 학습자의 주요 취약점을 5가지 이내로 분석해주세요.\n\n{wrong_answers}"}
        ]
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=messages,
            temperature=0.3,
            max_tokens=1000,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        content = response.choices[0].message.content.strip()
        
        # 취약점 추출
        weaknesses = []
        for line in content.split('\n'):
            line = line.strip()
            if line.startswith(('1.', '2.', '3.', '4.', '5.', '-', '•')):
                # 번호 또는 기호 제거
                parts = line.split('.', 1)
                if len(parts) > 1 and parts[0].strip().isdigit():
                    weaknesses.append(parts[1].strip())
                else:
                    parts = line.split(' ', 1)
                    if len(parts) > 1 and (parts[0] == '-' or parts[0] == '•'):
                        weaknesses.append(parts[1].strip())
            elif line and not line.startswith(('취약점', '분석', '학습자', '결과')):
                weaknesses.append(line)
        
        # 중복 제거 및 개수 제한
        weaknesses = list(dict.fromkeys(weaknesses))[:5]
        
        return weaknesses
    
    @retry(stop=stop_after_attempt(3), wait=wait_random_exponential(min=1, max=10))
    async def generate_reading_content(self, prompt, level):
        """리딩 콘텐츠 생성
        
        Args:
            prompt: 생성 프롬프트
            level: 난이도 레벨
            
        Returns:
            str: 생성된 콘텐츠
        """
        # 레벨별 콘텐츠 길이 조정
        max_tokens = {
            "level1": 300,   # 한글 마스터 (짧은 텍스트)
            "level2": 500,   # 기초 리더 (기본 텍스트)
            "level3": 800,   # 중급 리더 (중간 길이)
            "level4": 1200   # 고급 리더 (긴 텍스트)
        }
        
        tokens = max_tokens.get(level, 500)
        
        messages = [
            {"role": "system", "content": "당신은 한국어 읽기 교육 콘텐츠를 생성하는 전문가입니다."},
            {"role": "user", "content": f"{prompt}\n\n이 텍스트는 한국어 학습자의 {level} 레벨에 맞게 생성되어야 합니다."}
        ]
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=messages,
            temperature=0.7,
            max_tokens=tokens,
            top_p=1.0,
            frequency_penalty=0.3,
            presence_penalty=0.2
        )
        
        return response.choices[0].message.content.strip()
    
    @retry(stop=stop_after_attempt(3), wait=wait_random_exponential(min=1, max=10))
    async def generate_reading_guide(self, content, level):
        """리딩 가이드 생성
        
        Args:
            content: 리딩 콘텐츠
            level: 난이도 레벨
            
        Returns:
            dict: 생성된 가이드
        """
        messages = [
            {"role": "system", "content": "당신은 한국어 읽기 교육 전문가입니다."},
            {"role": "user", "content": f"다음 한국어 텍스트에 대한 읽기 가이드를 생성해주세요. 주요 어휘, 문법 포인트, 발음 팁을 포함해야 합니다. 가이드는 {level} 레벨 학습자에게 적합해야 합니다.\n\n{content}"}
        ]
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=messages,
            temperature=0.5,
            max_tokens=1500,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        guide_text = response.choices[0].message.content.strip()
        
        # 구조화된 가이드 요청
        messages.append({"role": "assistant", "content": guide_text})
        messages.append({"role": "user", "content": "위 가이드를 'vocabulary', 'grammar', 'pronunciation', 'cultural_notes' 필드를 가진 JSON 형식으로 변환해주세요. 각 필드는 리스트 형태여야 합니다."})
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=messages,
            temperature=0.1,
            max_tokens=1500,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        
        json_content = response.choices[0].message.content.strip()
        
        # JSON 파싱 시도
        guide = {}
        try:
            # JSON 부분 추출
            import re
            json_match = re.search(r'\{[\s\S]*\}', json_content)
            if json_match:
                json_str = json_match.group(0)
                guide = json.loads(json_str)
        except:
            # 파싱 실패 시 수동 파싱
            guide = {
                "vocabulary": [],
                "grammar": [],
                "pronunciation": [],
                "cultural_notes": []
            }
            
            current_section = None
            for line in guide_text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                
                # 섹션 제목 확인
                lower_line = line.lower()
                if '어휘' in lower_line or 'vocabulary' in lower_line:
                    current_section = "vocabulary"
                    continue
                elif '문법' in lower_line or 'grammar' in lower_line:
                    current_section = "grammar"
                    continue
                elif '발음' in lower_line or 'pronunciation' in lower_line:
                    current_section = "pronunciation"
                    continue
                elif '문화' in lower_line or 'cultural' in lower_line or 'note' in lower_line:
                    current_section = "cultural_notes"
                    continue
                
                # 항목 추가
                if current_section and line.startswith(('-', '•', '1.', '2.', '3.', '4.', '5.')):
                    # 번호 또는 기호 제거
                    item = re.sub(r'^[-•\d.]\s*', '', line)
                    if item:
                        guide[current_section].append(item)
                elif current_section and line:
                    guide[current_section].append(line)
        
        # 필요한 필드 확인
        for key in ["vocabulary", "grammar", "pronunciation", "cultural_notes"]:
            if key not in guide:
                guide[key] = []
        
        return guide
