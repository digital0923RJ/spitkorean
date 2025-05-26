// API 경로 및 설정 상수

// 기본 API 설정
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  VERSION: 'v1',
  TIMEOUT: 30000, // 30초
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1초
}

// API 엔드포인트
export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register', 
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/update-profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  
  // Talk Like You Mean It
  TALK: {
    CHAT: '/talk/chat',
    SESSIONS: '/talk/sessions',
    SESSION: '/talk/session', // + /:sessionId
    USAGE: '/talk/usage',
    HISTORY: '/talk/history'
  },
  
  // Drama Builder  
  DRAMA: {
    SENTENCES: '/drama/sentences',
    CHECK: '/drama/check',
    PROGRESS: '/drama/progress',
    USAGE: '/drama/usage',
    SIMILAR: '/drama/similar',
    GRAMMAR: '/drama/grammar'
  },
  
  // Test & Study
  TEST: {
    QUESTIONS: '/test/questions',
    SUBMIT: '/test/submit', 
    RESULTS: '/test/results',
    USAGE: '/test/usage',
    STATISTICS: '/test/statistics',
    WEAKNESSES: '/test/weaknesses'
  },
  
  // Korean Journey
  JOURNEY: {
    CONTENT: '/journey/content',
    SUBMIT: '/journey/submit',
    PROGRESS: '/journey/progress', 
    USAGE: '/journey/usage',
    PRONUNCIATION: '/journey/pronunciation'
  },
  
  // 공통
  COMMON: {
    STREAK: '/common/streak',
    GAMIFICATION: '/common/gamification',
    LEAGUE_RANKING: '/common/league-ranking',
    SUBSCRIPTION_PLANS: '/common/subscription/plans',
    SUBSCRIBE: '/common/subscription/subscribe'
  },
  
  // 구독 관리
  SUBSCRIPTION: {
    STATUS: '/subscription/status',
    CANCEL: '/subscription/cancel',
    UPDATE: '/subscription/update',
    PAYMENT_HISTORY: '/subscription/payment-history'
  }
}

// HTTP 메서드
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST', 
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
}

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
}

// 에러 타입
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR', 
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

// 에러 메시지
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK_ERROR]: '네트워크 연결을 확인해주세요.',
  [ERROR_TYPES.TIMEOUT_ERROR]: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  [ERROR_TYPES.AUTH_ERROR]: '인증이 필요합니다. 다시 로그인해주세요.',
  [ERROR_TYPES.VALIDATION_ERROR]: '입력 정보를 확인해주세요.',
  [ERROR_TYPES.RATE_LIMIT_ERROR]: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
  [ERROR_TYPES.SERVER_ERROR]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  [ERROR_TYPES.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.'
}

// 로딩 상태
export const LOADING_STATES = {
  IDLE: 'idle',
  PENDING: 'pending', 
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
}

// 캐시 설정
export const CACHE_CONFIG = {
  // 캐시 키 접두사
  PREFIX: 'spitkorean_',
  
  // 캐시 유효 시간 (밀리초)
  TTL: {
    SHORT: 5 * 60 * 1000,      // 5분
    MEDIUM: 30 * 60 * 1000,    // 30분  
    LONG: 2 * 60 * 60 * 1000,  // 2시간
    DAY: 24 * 60 * 60 * 1000   // 24시간
  },
  
  // 캐시할 API 엔드포인트
  CACHEABLE_ENDPOINTS: [
    API_ENDPOINTS.COMMON.SUBSCRIPTION_PLANS,
    API_ENDPOINTS.COMMON.GAMIFICATION,
    API_ENDPOINTS.AUTH.ME
  ]
}

// 파일 업로드 설정
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    AUDIO: ['audio/wav', 'audio/mp3', 'audio/ogg', 'audio/m4a'],
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  CHUNK_SIZE: 1024 * 1024 // 1MB chunks
}

// WebSocket 설정 (실시간 기능용)
export const WEBSOCKET_CONFIG = {
  URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
  RECONNECT_INTERVAL: 5000, // 5초
  MAX_RECONNECT_ATTEMPTS: 5,
  PING_INTERVAL: 30000 // 30초
}

// 페이지네이션 기본값
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
}

// 정렬 옵션
export const SORT_OPTIONS = {
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc', 
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  SCORE_ASC: 'score_asc',
  SCORE_DESC: 'score_desc'
}

// API 키 설정 (클라이언트 사이드용)
export const CLIENT_API_KEYS = {
  GOOGLE_TRANSLATE: import.meta.env.VITE_GOOGLE_TRANSLATE_KEY,
  STRIPE_PUBLISHABLE: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
}

// 개발/프로덕션 환경 구분
export const ENVIRONMENT = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE
}