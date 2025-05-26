// frontend/src/shared/constants/routes.js

/**
 * 애플리케이션 라우트 경로 정의
 * React Router와 동기화된 경로 상수
 */

// 공통 라우트
export const ROUTES = {
  // 메인 페이지
  HOME: '/',
  
  // 인증 관련
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password/:token',
    VERIFY_EMAIL: '/verify-email/:token'
  },
  
  // 대시보드
  DASHBOARD: '/dashboard',
  
  // 프로필 및 설정
  PROFILE: {
    BASE: '/profile',
    EDIT: '/profile/edit',
    SETTINGS: '/profile/settings',
    SUBSCRIPTION: '/profile/subscription'
  },
  
  // Talk Like You Mean It
  TALK: {
    BASE: '/talk',
    HOME: '/talk/home',
    CHAT: '/talk/chat',
    SESSION: '/talk/session/:sessionId',
    HISTORY: '/talk/history',
    SETTINGS: '/talk/settings'
  },
  
  // Drama Builder
  DRAMA: {
    BASE: '/drama',
    HOME: '/drama/home',
    PRACTICE: '/drama/practice',
    LEVEL: '/drama/level/:level',
    PROGRESS: '/drama/progress',
    SENTENCES: '/drama/sentences/:dramaId'
  },
  
  // Test & Study
  TEST: {
    BASE: '/test',
    HOME: '/test/home',
    QUIZ: '/test/quiz',
    LEVEL: '/test/level/:level',
    SESSION: '/test/session/:testId',
    RESULTS: '/test/results',
    STATISTICS: '/test/statistics',
    REVIEW: '/test/review/:resultId'
  },
  
  // Korean Journey
  JOURNEY: {
    BASE: '/journey',
    HOME: '/journey/home',
    READING: '/journey/reading',
    LEVEL: '/journey/level/:level',
    SESSION: '/journey/session/:contentId',
    PROGRESS: '/journey/progress',
    PRONUNCIATION: '/journey/pronunciation'
  },
  
  // 구독 관련
  SUBSCRIPTION: {
    BASE: '/subscription',
    PLANS: '/subscription/plans',
    CHECKOUT: '/subscription/checkout',
    SUCCESS: '/subscription/success',
    CANCEL: '/subscription/cancel',
    MANAGE: '/subscription/manage'
  },
  
  // 공통 기능
  COMMON: {
    GAMIFICATION: '/gamification',
    LEADERBOARD: '/leaderboard',
    ACHIEVEMENTS: '/achievements',
    STREAKS: '/streaks'
  },
  
  // 고객 지원
  SUPPORT: {
    BASE: '/support',
    FAQ: '/support/faq',
    CONTACT: '/support/contact',
    HELP: '/support/help'
  },
  
  // 에러 페이지
  ERROR: {
    NOT_FOUND: '/404',
    SERVER_ERROR: '/500',
    UNAUTHORIZED: '/401',
    FORBIDDEN: '/403'
  }
};

// 보호된 라우트 (로그인 필요)
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROFILE.BASE,
  ROUTES.PROFILE.EDIT,
  ROUTES.PROFILE.SETTINGS,
  ROUTES.PROFILE.SUBSCRIPTION,
  ROUTES.TALK.BASE,
  ROUTES.DRAMA.BASE,
  ROUTES.TEST.BASE,
  ROUTES.JOURNEY.BASE,
  ROUTES.SUBSCRIPTION.MANAGE,
  ROUTES.COMMON.GAMIFICATION,
  ROUTES.COMMON.LEADERBOARD,
  ROUTES.COMMON.ACHIEVEMENTS
];

// 구독이 필요한 라우트
export const SUBSCRIPTION_REQUIRED_ROUTES = {
  [ROUTES.TALK.BASE]: 'talk',
  [ROUTES.DRAMA.BASE]: 'drama',
  [ROUTES.TEST.BASE]: 'test',
  [ROUTES.JOURNEY.BASE]: 'journey'
};

// 게스트 전용 라우트 (로그인 시 리다이렉트)
export const GUEST_ONLY_ROUTES = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.FORGOT_PASSWORD
];

// 네비게이션 메뉴 구조
export const NAVIGATION_MENU = {
  MAIN: [
    {
      id: 'dashboard',
      label: '대시보드',
      path: ROUTES.DASHBOARD,
      icon: 'dashboard',
      description: '학습 현황 및 통계'
    },
    {
      id: 'talk',
      label: 'Talk Like You Mean It',
      path: ROUTES.TALK.HOME,
      icon: 'chat',
      description: 'AI와 자연스러운 대화',
      subscription: 'talk'
    },
    {
      id: 'drama',
      label: 'Drama Builder',
      path: ROUTES.DRAMA.HOME,
      icon: 'theater',
      description: '드라마로 배우는 문법',
      subscription: 'drama'
    },
    {
      id: 'test',
      label: 'Test & Study',
      path: ROUTES.TEST.HOME,
      icon: 'quiz',
      description: 'TOPIK 시험 대비',
      subscription: 'test'
    },
    {
      id: 'journey',
      label: 'Korean Journey',
      path: ROUTES.JOURNEY.HOME,
      icon: 'book',
      description: '한글부터 고급까지',
      subscription: 'journey'
    }
  ],
  
  SECONDARY: [
    {
      id: 'leaderboard',
      label: '리더보드',
      path: ROUTES.COMMON.LEADERBOARD,
      icon: 'trophy',
      description: '순위 및 경쟁'
    },
    {
      id: 'achievements',
      label: '성취',
      path: ROUTES.COMMON.ACHIEVEMENTS,
      icon: 'medal',
      description: '배지 및 업적'
    },
    {
      id: 'subscription',
      label: '구독 관리',
      path: ROUTES.SUBSCRIPTION.MANAGE,
      icon: 'credit_card',
      description: '요금제 및 결제'
    }
  ],
  
  PROFILE: [
    {
      id: 'profile',
      label: '프로필',
      path: ROUTES.PROFILE.BASE,
      icon: 'person',
      description: '개인 정보'
    },
    {
      id: 'settings',
      label: '설정',
      path: ROUTES.PROFILE.SETTINGS,
      icon: 'settings',
      description: '앱 설정'
    }
  ]
};

// 브레드크럼 정의
export const BREADCRUMB_CONFIG = {
  [ROUTES.DASHBOARD]: [{ label: '대시보드' }],
  
  [ROUTES.TALK.HOME]: [
    { label: '대시보드', path: ROUTES.DASHBOARD },
    { label: 'Talk Like You Mean It' }
  ],
  [ROUTES.TALK.CHAT]: [
    { label: '대시보드', path: ROUTES.DASHBOARD },
    { label: 'Talk Like You Mean It', path: ROUTES.TALK.HOME },
    { label: '대화' }
  ],
  
  [ROUTES.DRAMA.HOME]: [
    { label: '대시보드', path: ROUTES.DASHBOARD },
    { label: 'Drama Builder' }
  ],
  [ROUTES.DRAMA.PRACTICE]: [
    { label: '대시보드', path: ROUTES.DASHBOARD },
    { label: 'Drama Builder', path: ROUTES.DRAMA.HOME },
    { label: '연습' }
  ],
  
  [ROUTES.TEST.HOME]: [
    { label: '대시보드', path: ROUTES.DASHBOARD },
    { label: 'Test & Study' }
  ],
  [ROUTES.TEST.QUIZ]: [
    { label: '대시보드', path: ROUTES.DASHBOARD },
    { label: 'Test & Study', path: ROUTES.TEST.HOME },
    { label: '퀴즈' }
  ],
  
  [ROUTES.JOURNEY.HOME]: [
    { label: '대시보드', path: ROUTES.DASHBOARD },
    { label: 'Korean Journey' }
  ],
  [ROUTES.JOURNEY.READING]: [
    { label: '대시보드', path: ROUTES.DASHBOARD },
    { label: 'Korean Journey', path: ROUTES.JOURNEY.HOME },
    { label: '읽기' }
  ],
  
  [ROUTES.SUBSCRIPTION.PLANS]: [
    { label: '대시보드', path: ROUTES.DASHBOARD },
    { label: '구독', path: ROUTES.SUBSCRIPTION.BASE },
    { label: '요금제' }
  ]
};

// 라우트 유틸리티 함수
export const buildRoute = (route, params = {}) => {
  let path = route;
  
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  
  return path;
};

export const isProtectedRoute = (pathname) => {
  return PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
};

export const getRequiredSubscription = (pathname) => {
  const requiredSub = Object.entries(SUBSCRIPTION_REQUIRED_ROUTES)
    .find(([route]) => pathname === route || pathname.startsWith(route + '/'));
  
  return requiredSub ? requiredSub[1] : null;
};

export const isGuestOnlyRoute = (pathname) => {
  return GUEST_ONLY_ROUTES.includes(pathname);
};

export const getNavigationItem = (pathname) => {
  const allItems = [
    ...NAVIGATION_MENU.MAIN,
    ...NAVIGATION_MENU.SECONDARY,
    ...NAVIGATION_MENU.PROFILE
  ];
  
  return allItems.find(item => 
    pathname === item.path || pathname.startsWith(item.path + '/')
  );
};