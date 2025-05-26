// SpitKorean 4개 핵심 상품 정의

export const PRODUCTS = {
  TALK: {
    id: 'talk',
    name: 'Talk Like You Mean It',
    nameKr: '진짜 대화하기',
    description: '자연스러운 대화 학습에 중점을 둔 플랜. 실제 상황과 같은 대화와 음성 응답을 제공합니다.',
    price: 30.00,
    dailyLimit: 60,
    color: 'primary',
    icon: 'MessageCircle',
    route: '/talk',
    features: [
      'AI 튜터와 실시간 대화',
      '감정 인식 및 피드백',
      '모국어 해설 지원',
      '레벨별 맞춤 대화'
    ],
    levels: ['beginner', 'intermediate', 'advanced'],
    tag: '대화형 AI'
  },
  
  DRAMA: {
    id: 'drama',
    name: 'Drama Builder',
    nameKr: '드라마로 배우기',
    description: '드라마 기반 문장 구성 학습에 중점을 둔 플랜. 실제 드라마 대사로 문법과 표현을 배웁니다.',
    price: 20.00,
    dailyLimit: 20,
    color: 'secondary',
    icon: 'Film',
    route: '/drama',
    features: [
      '실제 드라마 문장 학습',
      '문법 피드백',
      '유사 문장 제시',
      '발음 평가'
    ],
    levels: ['beginner', 'intermediate', 'advanced'],
    tag: '문장 구성'
  },
  
  TEST: {
    id: 'test',
    name: 'Test & Study',
    nameKr: '시험 대비',
    description: 'TOPIK 시험 준비에 중점을 둔 플랜. 문제 풀이와 체계적인 학습으로 실력을 향상시킵니다.',
    price: 20.00,
    dailyLimit: 20,
    color: 'success',
    icon: 'BookOpen',
    route: '/test',
    features: [
      'TOPIK 모의고사',
      '문제 자동 생성',
      '약점 분석',
      '실전 시험 시뮬레이션'
    ],
    levels: [1, 2, 3, 4, 5, 6], // TOPIK 레벨
    tag: 'TOPIK 대비'
  },
  
  JOURNEY: {
    id: 'journey',
    name: 'Korean Journey',
    nameKr: '한국어 여행',
    description: '한글부터 시작하는 체계적인 학습 플랜. 발음과 읽기에 중점을 두어 기초를 탄탄히 합니다.',
    price: 30.00,
    dailyLimit: 20,
    color: 'warning',
    icon: 'Map',
    route: '/journey',
    features: [
      '한글 기초부터 고급 리딩까지',
      '발음 정확도 분석',
      '속도 조절 연습',
      '단계별 리딩 콘텐츠'
    ],
    levels: ['level1', 'level2', 'level3', 'level4'],
    tag: '체계적 학습'
  }
}

// 상품 배열
export const PRODUCT_LIST = Object.values(PRODUCTS)

// 상품 ID로 조회
export const getProductById = (id) => {
  return PRODUCT_LIST.find(product => product.id === id)
}

// 가격별 정렬
export const getProductsByPrice = (ascending = true) => {
  return [...PRODUCT_LIST].sort((a, b) => 
    ascending ? a.price - b.price : b.price - a.price
  )
}

// 번들 패키지 정의
export const BUNDLES = {
  BUNDLE_2: {
    id: 'bundle_2',
    name: '2개 선택 패키지',
    nameKr: '투 픽 패키지',
    description: '원하는 상품 2개를 선택하여 10% 할인된 가격에 이용하세요.',
    discount: 0.10,
    minProducts: 2,
    maxProducts: 2,
    tag: '10% 할인'
  },
  
  BUNDLE_3: {
    id: 'bundle_3',
    name: '3개 선택 패키지',
    nameKr: '쓰리 픽 패키지', 
    description: '원하는 상품 3개를 선택하여 20% 할인된 가격에 이용하세요.',
    discount: 0.20,
    minProducts: 3,
    maxProducts: 3,
    tag: '20% 할인'
  },
  
  BUNDLE_ALL: {
    id: 'bundle_all',
    name: '올인원 패키지',
    nameKr: '전체 패키지',
    description: '모든 상품을 25% 할인된 가격에 이용하세요.',
    discount: 0.25,
    minProducts: 4,
    maxProducts: 4,
    price: 75.00,
    tag: '25% 할인'
  }
}

// 번들 가격 계산
export const calculateBundlePrice = (selectedProducts) => {
  const count = selectedProducts.length
  
  if (count < 2) return 0
  
  const totalPrice = selectedProducts.reduce((sum, productId) => {
    const product = getProductById(productId)
    return sum + (product?.price || 0)
  }, 0)
  
  let discount = 0
  if (count === 2) discount = BUNDLES.BUNDLE_2.discount
  else if (count === 3) discount = BUNDLES.BUNDLE_3.discount
  else if (count >= 4) discount = BUNDLES.BUNDLE_ALL.discount
  
  return totalPrice * (1 - discount)
}

// 상품 색상 매핑
export const PRODUCT_COLORS = {
  primary: {
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    text: 'text-primary-900',
    accent: 'text-primary-600'
  },
  secondary: {
    bg: 'bg-secondary-50',
    border: 'border-secondary-200', 
    text: 'text-secondary-900',
    accent: 'text-secondary-600'
  },
  success: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    text: 'text-success-900', 
    accent: 'text-success-600'
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    text: 'text-warning-900',
    accent: 'text-warning-600'
  }
}