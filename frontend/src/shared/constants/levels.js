// 한국어 학습 레벨 정의

// Talk Like You Mean It & Drama Builder 레벨
export const CONVERSATION_LEVELS = {
  BEGINNER: {
    id: 'beginner',
    name: '초급',
    nameEn: 'Beginner',
    description: '기본적인 한국어 표현과 간단한 대화를 학습합니다.',
    color: 'success',
    order: 1,
    characteristics: [
      '3-5단어의 간단한 문장',
      '기본 조사 사용 (은/는, 이/가, 을/를)',
      '일상 인사와 기초 표현',
      '영어 혼용 가능 (30%)'
    ],
    topics: [
      '자기소개', '가족', '음식', '날씨', 
      '쇼핑', '인사', '숫자', '시간'
    ],
    grammar: [
      '기본 조사', '평서문', '의문문', 
      '현재시제', '이다/아니다'
    ],
    // Talk Like You Mean It 전용 설정
    talk: {
      speed: '매우 천천히 (0.7x 속도)',
      languageRatio: '한국어 30% + 모국어 70%',
      conversationStyle: '자주 확인, 모국어 재설명',
      goals: '기본 인사와 일상 표현 익히기, 간단한 문장 구성',
      features: ['자주 확인', '모국어 재설명', '기초 어휘 500개']
    }
  },
  
  INTERMEDIATE: {
    id: 'intermediate', 
    name: '중급',
    nameEn: 'Intermediate',
    description: '일상 대화와 복문을 사용한 자연스러운 표현을 학습합니다.',
    color: 'warning',
    order: 2,
    characteristics: [
      '7-10단어의 복문 구성',
      '연결어미 사용 (-고, -어서, -지만)',
      '다양한 시제 표현',  
      '상황별 적절한 표현'
    ],
    topics: [
      '취미', '여행', '직장', '학교',
      '건강', '문화', '계획', '경험'
    ],
    grammar: [
      '연결어미', '시제', '존댓말',
      '능력/가능 표현', '의도 표현'
    ],
    // Talk Like You Mean It 전용 설정
    talk: {
      speed: '보통 속도 (1.0x)',
      languageRatio: '한국어 70% + 모국어 30%',
      conversationStyle: '문맥 이해, 자연스러운 대화',
      goals: '연결된 대화 구성, 자신의 경험과 의견 표현',
      features: ['문맥 이해', '자연스러운 대화', '일상 어휘 2000개']
    }
  },
  
  ADVANCED: {
    id: 'advanced',
    name: '고급', 
    nameEn: 'Advanced',
    description: '복잡한 주제와 전문적인 표현을 자유롭게 구사합니다.',
    color: 'error',
    order: 3,
    characteristics: [
      '12단어 이상의 복잡한 문장',
      '관형절, 부사절 자유 사용',
      '뉘앙스와 은유 표현',
      '거의 한국어만 사용 (95%)'
    ],
    topics: [
      '시사', '정치', '경제', '철학',
      '예술', '과학', '역사', '문학'
    ],
    grammar: [
      '고급 어미', '관형절', '피동/사동',
      '추측/추정 표현', '고급 존댓말'
    ],
    // Talk Like You Mean It 전용 설정
    talk: {
      speed: '자연스러운 속도 (1.2x)',
      languageRatio: '한국어 95% + 모국어 5%',
      conversationStyle: '뉘앙스 이해, 깊이 있는 토론',
      goals: '추상적 개념 토론, 한국인 수준의 자연스러운 대화',
      features: ['뉘앙스 이해', '깊이 있는 토론', '전문 어휘 5000개+']
    }
  }
}

// TOPIK 레벨 (Test & Study)
export const TOPIK_LEVELS = {
  1: {
    id: 1,
    name: 'TOPIK I - 1급',
    nameEn: 'TOPIK I - Level 1', 
    description: '기초적인 한국어 이해 및 표현 능력',
    color: 'success',
    category: 'TOPIK I',
    vocabulary: 800,
    characteristics: [
      '기본 인사와 소개',
      '간단한 정보 교환',
      '일상생활 기초 표현',
      '그림과 표지판 이해'
    ],
    skills: {
      listening: '짧은 대화, 그림 보고 답하기',
      reading: '간판/표지판, 단문 이해', 
      vocabulary: '생활 필수 어휘 800개',
      grammar: '기본 조사, 평서문/의문문'
    }
  },
  
  2: {
    id: 2,
    name: 'TOPIK I - 2급',
    nameEn: 'TOPIK I - Level 2',
    description: '일상생활에 필요한 기초적인 의사소통 능력',
    color: 'success', 
    category: 'TOPIK I',
    vocabulary: 1500,
    characteristics: [
      '일상 대화 참여',
      '간단한 업무 처리',
      '기본적인 설명문 이해',
      '연결된 문장 구성'
    ],
    skills: {
      listening: '일상 대화, 안내 방송',
      reading: '실용문, 간단한 설명문',
      vocabulary: '일상 활동 어휘 1500개', 
      grammar: '시제, 연결어미, 존댓말'
    }
  },
  
  3: {
    id: 3,
    name: 'TOPIK II - 3급',
    nameEn: 'TOPIK II - Level 3',
    description: '일반적인 사회생활에 필요한 한국어 능력',
    color: 'warning',
    category: 'TOPIK II',
    vocabulary: 3000,
    characteristics: [
      '친숙한 사회적 소재 이해',
      '구체적 정보 전달',
      '경험과 계획 설명',
      '짧은 글 작성'
    ],
    skills: {
      listening: '뉴스, 강의, 토론 (기초)',
      reading: '설명문, 논설문, 도표',
      writing: '200-300자 작문',
      vocabulary: '중급 단어 3000개'
    }
  },
  
  4: {
    id: 4,
    name: 'TOPIK II - 4급', 
    nameEn: 'TOPIK II - Level 4',
    description: '폭넓은 주제의 글을 이해하고 업무 처리 능력',
    color: 'warning',
    category: 'TOPIK II', 
    vocabulary: 4000,
    characteristics: [
      '다양한 주제 글 이해',
      '업무 관련 의사소통',
      '추상적 개념 표현',
      '논리적 글 작성'
    ],
    skills: {
      listening: '뉴스, 강의, 토론 (중급)',
      reading: '논설문, 보고서, 문학',
      writing: '400-600자 논술',
      vocabulary: '업무용 어휘 포함 4000개'
    }
  },
  
  5: {
    id: 5,
    name: 'TOPIK II - 5급',
    nameEn: 'TOPIK II - Level 5', 
    description: '전문 분야에서의 연구나 업무 수행 능력',
    color: 'error',
    category: 'TOPIK II',
    vocabulary: 5000,
    characteristics: [
      '전문적 내용 이해',
      '학술적 글 작성',
      '복잡한 담화 참여',
      '추상적 주제 토론'
    ],
    skills: {
      listening: '학술 강연, 전문 토론',
      reading: '학술 논문, 전문서적',
      writing: '600-700자 학술 글',
      vocabulary: '전문 용어 5000개+'
    }
  },
  
  6: {
    id: 6,
    name: 'TOPIK II - 6급',
    nameEn: 'TOPIK II - Level 6',
    description: '원어민 수준의 한국어 사용 능력',
    color: 'error',
    category: 'TOPIK II',
    vocabulary: 6000,
    characteristics: [
      '모든 상황에서 자유로운 의사소통',
      '고급 문학 작품 이해',
      '전문적 발표와 토론',
      '창의적 글쓰기'
    ],
    skills: {
      listening: '모든 상황의 담화 이해',
      reading: '문학, 철학, 과학 텍스트',
      writing: '700자 이상 창의적 글',
      vocabulary: '고급 어휘 6000개+'
    }
  }
}

// Korean Journey 레벨
export const JOURNEY_LEVELS = {
  LEVEL1: {
    id: 'level1',
    name: '한글 마스터',
    nameEn: 'Hangul Master',
    description: '한글 자음, 모음부터 기초 단어까지 완전 정복',
    color: 'success',
    order: 1,
    focus: '한글 기초',
    characteristics: [
      '자음/모음 개별 학습',
      '받침 발음 규칙',
      '1-2음절 단어 100개',
      '음절 구성 이해'
    ],
    content: [
      '기본 자모 (ㄱ-ㅎ, ㅏ-ㅣ)',
      '단순 받침 7개',
      '기초 단어 100개',
      '간단한 문장 읽기'
    ],
    // Korean Journey 전용 설정
    journey: {
      speed: '매우 천천히 (0.5x 속도)',
      contentTypes: ['hangul', 'pronunciation'],
      features: ['획순 애니메이션', '음소 구별 게임', '입모양 가이드']
    }
  },
  
  LEVEL2: {
    id: 'level2', 
    name: '기초 리더',
    nameEn: 'Basic Reader',
    description: '일상 한국어 텍스트를 읽고 이해하기',
    color: 'success',
    order: 2,
    focus: '기초 읽기',
    characteristics: [
      '복잡 받침 (겹받침)',
      '음운 변화 규칙',
      '5-7어절 문장',
      '실용적 텍스트 읽기'
    ],
    content: [
      '겹받침과 음운 변화',
      '일상 대화문',
      '안내문, 표지판',
      '짧은 이야기'
    ],
    // Korean Journey 전용 설정
    journey: {
      speed: '천천히 (0.8x → 1.0x 속도)',
      contentTypes: ['reading', 'dialogue'],
      features: ['연음 법칙 학습', '속담/명언', '동요/K-Pop']
    }
  },
  
  LEVEL3: {
    id: 'level3',
    name: '중급 리더', 
    nameEn: 'Intermediate Reader',
    description: '다양한 주제의 글을 자연스럽게 읽기',
    color: 'warning',
    order: 3,
    focus: '중급 읽기',
    characteristics: [
      '10-15어절 복문',
      '다양한 문체 구분',
      '감정 표현과 억양',
      '전문 어휘 사용'
    ],
    content: [
      '뉴스 기사',
      '블로그 글',
      '문학 작품 (짧은 소설)',
      '학술 텍스트 (기초)'
    ],
    // Korean Journey 전용 설정
    journey: {
      speed: '보통 ~ 빠르게 (1.0x → 1.2x 속도)',
      contentTypes: ['reading', 'dialogue'],
      features: ['뉴스 헤드라인', '문학 작품', '드라마 대사']
    }
  },
  
  LEVEL4: {
    id: 'level4',
    name: '고급 리더',
    nameEn: 'Advanced Reader', 
    description: '전문적이고 복잡한 텍스트까지 자유자재로',
    color: 'error',
    order: 4,
    focus: '고급 읽기',
    characteristics: [
      '길고 복잡한 문장',
      '전문 분야 텍스트',
      '문학적 표현',
      '동시 통역 수준'
    ],
    content: [
      '학술 논문',
      '법률 문서',
      '고전 문학',
      '전문 잡지'
    ],
    // Korean Journey 전용 설정
    journey: {
      speed: '빠르게 (1.5x+ 속도)',
      contentTypes: ['reading', 'dialogue'],
      features: ['전문 텍스트', '방언/사투리', '프레젠테이션']
    }
  }
}

// Drama Builder 레벨 (CONVERSATION_LEVELS와 동일하지만 별도 설정)
export const DRAMA_LEVELS = {
  BEGINNER: {
    ...CONVERSATION_LEVELS.BEGINNER,
    drama: {
      sentenceLength: '3-5 단어 단문',
      dramaTypes: ['뽀로로', '타요', '일상 드라마'],
      grammarFocus: ['기초 조사', '평서문', '의문문'],
      similarSentences: 3,
      features: ['단어 대응 번역', '기초 문법 설명']
    }
  },
  INTERMEDIATE: {
    ...CONVERSATION_LEVELS.INTERMEDIATE,
    drama: {
      sentenceLength: '7-10 단어 복문',
      dramaTypes: ['사랑의 불시착', '미생', '로맨틱 코미디'],
      grammarFocus: ['연결어미', '시제', '존댓말'],
      similarSentences: 5,
      features: ['구 단위 번역', '문법 패턴 설명']
    }
  },
  ADVANCED: {
    ...CONVERSATION_LEVELS.ADVANCED,
    drama: {
      sentenceLength: '12+ 단어 복잡문',
      dramaTypes: ['킹덤', '우영우', '사극', '의학 드라마'],
      grammarFocus: ['관형절', '고급 어미', '피동/사동'],
      similarSentences: 7,
      features: ['의미 단위 번역', '뉘앙스 차이 설명']
    }
  }
}

// 레벨 조회 함수들
export const getConversationLevel = (levelId) => CONVERSATION_LEVELS[levelId.toUpperCase()]
export const getTopikLevel = (levelNum) => TOPIK_LEVELS[levelNum]  
export const getJourneyLevel = (levelId) => JOURNEY_LEVELS[levelId.toUpperCase()]
export const getDramaLevel = (levelId) => DRAMA_LEVELS[levelId.toUpperCase()]

// 레벨 목록 반환
export const getConversationLevels = () => Object.values(CONVERSATION_LEVELS)
export const getTopikLevels = () => Object.values(TOPIK_LEVELS)
export const getJourneyLevels = () => Object.values(JOURNEY_LEVELS)
export const getDramaLevels = () => Object.values(DRAMA_LEVELS)

// 다음 레벨 조회
export const getNextLevel = (currentLevel, type = 'conversation') => {
  if (type === 'conversation') {
    const levels = getConversationLevels()
    const currentIndex = levels.findIndex(level => level.id === currentLevel)
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
  } else if (type === 'topik') {
    return currentLevel < 6 ? getTopikLevel(currentLevel + 1) : null
  } else if (type === 'journey') {
    const levels = getJourneyLevels()
    const currentIndex = levels.findIndex(level => level.id === currentLevel)
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
  } else if (type === 'drama') {
    const levels = getDramaLevels()
    const currentIndex = levels.findIndex(level => level.id === currentLevel)
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
  }
  return null
}




// 백워드 호환성을 위한 기존 구조 (TalkHome.jsx에서 사용)
export const KOREAN_LEVELS = [
  {
    key: 'beginner',
    name: CONVERSATION_LEVELS.BEGINNER.name,
    description: CONVERSATION_LEVELS.BEGINNER.talk.conversationStyle,
    topics: CONVERSATION_LEVELS.BEGINNER.topics.join(', '),
    speed: CONVERSATION_LEVELS.BEGINNER.talk.speed,
    languageRatio: CONVERSATION_LEVELS.BEGINNER.talk.languageRatio,
    goals: CONVERSATION_LEVELS.BEGINNER.talk.goals
  },
  {
    key: 'intermediate',
    name: CONVERSATION_LEVELS.INTERMEDIATE.name,
    description: CONVERSATION_LEVELS.INTERMEDIATE.talk.conversationStyle,
    topics: CONVERSATION_LEVELS.INTERMEDIATE.topics.join(', '),
    speed: CONVERSATION_LEVELS.INTERMEDIATE.talk.speed,
    languageRatio: CONVERSATION_LEVELS.INTERMEDIATE.talk.languageRatio,
    goals: CONVERSATION_LEVELS.INTERMEDIATE.talk.goals
  },
  {
    key: 'advanced',
    name: CONVERSATION_LEVELS.ADVANCED.name,
    description: CONVERSATION_LEVELS.ADVANCED.talk.conversationStyle,
    topics: CONVERSATION_LEVELS.ADVANCED.topics.join(', '),
    speed: CONVERSATION_LEVELS.ADVANCED.talk.speed,
    languageRatio: CONVERSATION_LEVELS.ADVANCED.talk.languageRatio,
    goals: CONVERSATION_LEVELS.ADVANCED.talk.goals
  }
]


export const STUDY_GOALS = [
  { value: 'conversation', label: '회화 능력 향상 (Conversational Fluency)' },
  { value: 'exam', label: '시험 대비 (TOPIK Preparation)' },
  { value: 'travel', label: '여행 한국어 (Travel Korean)' },
  { value: 'business', label: '비즈니스 한국어 (Business Korean)' },
  { value: 'culture', label: '한국 문화 이해 (Cultural Understanding)' },
  { value: 'friendship', label: '한국인 친구 사귀기 (Making Korean Friends)' },
]
