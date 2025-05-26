// frontend/src/shared/constants/subscriptions.js

/**
 * 구독 플랜 정의 상수
 * 백엔드 API와 동기화된 구독 상품 정보
 */

export const SUBSCRIPTION_PLANS = {
  TALK: {
    id: 'talk',
    name: 'Talk Like You Mean It',
    description: '자연스러운 대화 학습에 중점을 둔 플랜. 실제 상황과 같은 대화와 음성 응답을 제공합니다.',
    price: 30.00,
    currency: 'USD',
    billing: 'monthly',
    dailyLimit: 60,
    features: [
      'AI 튜터와 실시간 대화',
      '감정 인식 및 피드백',
      '모국어 해설 지원',
      '레벨별 맞춤 대화'
    ],
    icon: '💬',
    color: '#3B82F6', // blue-500
    category: 'conversation'
  },
  
  DRAMA: {
    id: 'drama',
    name: 'Drama Builder',
    description: '드라마 기반 문장 구성 학습에 중점을 둔 플랜. 실제 드라마 대사로 문법과 표현을 배웁니다.',
    price: 20.00,
    currency: 'USD',
    billing: 'monthly',
    dailyLimit: 20,
    features: [
      '실제 드라마 문장 학습',
      '문법 피드백',
      '유사 문장 제시',
      '발음 평가'
    ],
    icon: '🎭',
    color: '#8B5CF6', // violet-500
    category: 'grammar'
  },
  
  TEST: {
    id: 'test',
    name: 'Test & Study',
    description: 'TOPIK 시험 준비에 중점을 둔 플랜. 문제 풀이와 체계적인 학습으로 실력을 향상시킵니다.',
    price: 20.00,
    currency: 'USD',
    billing: 'monthly',
    dailyLimit: 20,
    features: [
      'TOPIK 모의고사',
      '문제 자동 생성',
      '약점 분석',
      '실전 시험 시뮬레이션'
    ],
    icon: '📝',
    color: '#10B981', // emerald-500
    category: 'test'
  },
  
  JOURNEY: {
    id: 'journey',
    name: 'Korean Journey',
    description: '한글부터 시작하는 체계적인 학습 플랜. 발음과 읽기에 중점을 두어 기초를 탄탄히 합니다.',
    price: 30.00,
    currency: 'USD',
    billing: 'monthly',
    dailyLimit: 20,
    features: [
      '한글 기초부터 고급 리딩까지',
      '발음 정확도 분석',
      '속도 조절 연습',
      '단계별 리딩 콘텐츠'
    ],
    icon: '📚',
    color: '#F59E0B', // amber-500
    category: 'reading'
  }
};

export const BUNDLE_PLANS = {
  BUNDLE_2: {
    id: 'bundle_2',
    name: '2개 선택 패키지',
    description: '원하는 상품 2개를 선택하여 10% 할인된 가격에 이용하세요.',
    discount: 0.10,
    minProducts: 2,
    maxProducts: 2,
    icon: '🎁',
    color: '#EC4899' // pink-500
  },
  
  BUNDLE_3: {
    id: 'bundle_3',
    name: '3개 선택 패키지',
    description: '원하는 상품 3개를 선택하여 20% 할인된 가격에 이용하세요.',
    discount: 0.20,
    minProducts: 3,
    maxProducts: 3,
    icon: '🎊',
    color: '#8B5CF6' // violet-500
  },
  
  BUNDLE_ALL: {
    id: 'bundle_all',
    name: '올인원 패키지',
    description: '모든 상품을 25% 할인된 가격에 이용하세요.',
    discount: 0.25,
    minProducts: 4,
    maxProducts: 4,
    price: 75.00,
    originalPrice: 100.00,
    icon: '🌟',
    color: '#F59E0B' // amber-500
  }
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PENDING: 'pending',
  TRIAL: 'trial'
};

export const SUBSCRIPTION_PERIODS = {
  MONTHLY: {
    id: 'monthly',
    name: '월간',
    multiplier: 1,
    discount: 0
  },
  SEMI_ANNUAL: {
    id: 'semi_annual',
    name: '6개월',
    multiplier: 6,
    discount: 0.10
  },
  ANNUAL: {
    id: 'annual',
    name: '연간',
    multiplier: 12,
    discount: 0.20
  },
  LIFETIME: {
    id: 'lifetime',
    name: '평생',
    price: 1299,
    discount: 0
  }
};

export const TRIAL_SETTINGS = {
  DURATION_DAYS: 7,
  CREDIT_CARD_REQUIRED: false,
  AUTO_CONVERT: true
};

// 구독 상품 유틸리티 함수
export const getSubscriptionPlan = (planId) => {
  return SUBSCRIPTION_PLANS[planId.toUpperCase()] || null;
};

export const getBundlePlan = (bundleId) => {
  return BUNDLE_PLANS[bundleId.toUpperCase()] || null;
};

export const calculateBundlePrice = (selectedProducts) => {
  if (!selectedProducts || selectedProducts.length === 0) return 0;
  
  const totalPrice = selectedProducts.reduce((sum, productId) => {
    const plan = getSubscriptionPlan(productId);
    return sum + (plan ? plan.price : 0);
  }, 0);
  
  const bundleDiscount = BUNDLE_PLANS[`BUNDLE_${selectedProducts.length}`]?.discount || 0;
  
  return totalPrice * (1 - bundleDiscount);
};

export const getSubscriptionStatusDisplay = (status) => {
  const statusMap = {
    [SUBSCRIPTION_STATUS.ACTIVE]: { text: '활성', color: 'green', icon: '✅' },
    [SUBSCRIPTION_STATUS.CANCELLED]: { text: '취소됨', color: 'red', icon: '❌' },
    [SUBSCRIPTION_STATUS.EXPIRED]: { text: '만료됨', color: 'gray', icon: '⏰' },
    [SUBSCRIPTION_STATUS.PENDING]: { text: '대기중', color: 'yellow', icon: '⏳' },
    [SUBSCRIPTION_STATUS.TRIAL]: { text: '체험중', color: 'blue', icon: '🎁' }
  };
  
  return statusMap[status] || { text: '알 수 없음', color: 'gray', icon: '❓' };
};