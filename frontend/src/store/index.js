// frontend/src/store/index.js
import { configureStore } from '@reduxjs/toolkit'

// 슬라이스 임포트
import authSlice from './slices/authSlice'
import talkSlice from './slices/talkSlice'
import dramaSlice from './slices/dramaSlice'
import testSlice from './slices/testSlice'
import journeySlice from './slices/journeySlice'
import subscriptionSlice from './slices/subscriptionSlice'
import languageSlice from './slices/languageSlice'
import feedbackSlice from './slices/feedbackSlice'
import gamificationSlice from './slices/gamificationSlice'

// API 미들웨어
import { apiMiddleware } from './middleware/api'

// 개발 환경에서 Redux DevTools Logger 추가
const isDevelopment = import.meta.env.MODE === 'development'

// Redux 미들웨어 설정
const middleware = (getDefaultMiddleware) => {
  const middlewares = getDefaultMiddleware({
    serializableCheck: {
      // 직렬화 검사에서 제외할 액션 타입들
      ignoredActions: [
        'persist/PERSIST',
        'persist/REHYDRATE',
        'journey/startRecording',
        'journey/stopRecording',
        'talk/addTempMessage',
        'drama/addWordToAnswer',
        'drama/removeWordFromAnswer'
      ],
      // 직렬화 검사에서 제외할 경로들
      ignoredPaths: [
        'register',
        'rehydrate',
        'journey.recording.audioBlob',
        'drama.shuffledWords',
        'drama.currentSession.bookmarkedQuestions'
      ],
    },
    // 개발 환경에서 불변성 검사 활성화
    immutableCheck: isDevelopment,
    // 개발 환경에서 액션 창조자 검사 활성화
    actionCreatorCheck: isDevelopment,
  })

  // API 미들웨어 추가
  middlewares.push(apiMiddleware)

  // 개발 환경에서 추가 미들웨어
  if (isDevelopment) {
    // Redux Logger (선택적)
    // import logger from 'redux-logger'
    // middlewares.push(logger)
  }

  return middlewares
}

// Redux Store 구성
const store = configureStore({
  reducer: {
    auth: authSlice,
    talk: talkSlice,
    drama: dramaSlice,
    test: testSlice,
    journey: journeySlice,
    subscription: subscriptionSlice,
    language: languageSlice,
    feedback: feedbackSlice,
    gamification: gamificationSlice,
  },
  middleware,
  // Vite 환경 변수 사용
  devTools: isDevelopment && {
    name: 'SpitKorean Store',
    trace: true,
    traceLimit: 25,
  },
  // 초기 상태 (필요한 경우)
  preloadedState: undefined,
})

// Store 타입 추론을 위한 JSDoc 타입 정의 (TypeScript 지원 시 활용)
/**
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */

// Store에서 dispatch 함수 추출
export const { dispatch } = store

// 개발 환경에서 전역 접근 가능하도록 설정
if (isDevelopment && typeof window !== 'undefined') {
  window.__REDUX_STORE__ = store
}

// 환경별 설정 정보 (디버깅용)
if (isDevelopment) {
  console.log('🏪 Redux Store Configuration:', {
    mode: import.meta.env.MODE,
    devTools: true,
    slices: Object.keys(store.getState()),
    middleware: [
      'RTK Default',
      'API Middleware',
      'Serializable Check',
      'Immutable Check'
    ]
  })
}

// HMR (Hot Module Replacement) 지원 - Vite 환경
if (import.meta.hot) {
  // 슬라이스 변경 시 핫 리로드
  import.meta.hot.accept('./slices/authSlice', () => {
    console.log('🔄 Reloading authSlice...')
  })
  
  import.meta.hot.accept('./slices/talkSlice', () => {
    console.log('🔄 Reloading talkSlice...')
  })
  
  import.meta.hot.accept('./slices/dramaSlice', () => {
    console.log('🔄 Reloading dramaSlice...')
  })
  
  import.meta.hot.accept('./slices/testSlice', () => {
    console.log('🔄 Reloading testSlice...')
  })
  
  import.meta.hot.accept('./slices/journeySlice', () => {
    console.log('🔄 Reloading journeySlice...')
  })
  
  import.meta.hot.accept('./slices/subscriptionSlice', () => {
    console.log('🔄 Reloading subscriptionSlice...')
  })
  
  import.meta.hot.accept('./slices/languageSlice', () => {
    console.log('🔄 Reloading languageSlice...')
  })
  
  import.meta.hot.accept('./slices/feedbackSlice', () => {
    console.log('🔄 Reloading feedbackSlice...')
  })
  
  import.meta.hot.accept('./slices/gamificationSlice', () => {
    console.log('🔄 Reloading gamificationSlice...')
  })
}

// 상태 지속성 (Redux Persist) 설정 - 필요한 경우
export const persistConfig = {
  key: 'spitkorean',
  version: 1,
  storage: typeof window !== 'undefined' ? window.localStorage : null,
  whitelist: [
    'auth',           // 사용자 인증 정보 유지
    'language',       // 언어 설정 유지
    'subscription',   // 구독 정보 유지
    'gamification'    // 게임화 데이터 유지
  ],
  blacklist: [
    'talk',          // 대화는 세션 기반이므로 제외
    'drama',         // 드라마 진행 상태는 서버에서 관리
    'test',          // 테스트 상태는 휘발성
    'journey',       // 읽기 세션은 휘발성
    'feedback'       // 피드백은 실시간 생성
  ]
}

// Store 성능 모니터링 (개발 환경)
if (isDevelopment) {
  let actionCount = 0
  let lastLogTime = Date.now()
  
  store.subscribe(() => {
    actionCount++
    const now = Date.now()
    
    // 5초마다 액션 카운트 로그
    if (now - lastLogTime > 5000) {
      console.log(`⚡ Redux Actions: ${actionCount} in last 5 seconds`)
      actionCount = 0
      lastLogTime = now
    }
  })
}

// Store 내보내기
export default store

// 유틸리티 함수들
export const getState = () => store.getState()
export const subscribe = (callback) => store.subscribe(callback)

// 상품별 상태 셀렉터 (편의 함수)
export const getAuthState = () => store.getState().auth
export const getTalkState = () => store.getState().talk
export const getDramaState = () => store.getState().drama
export const getTestState = () => store.getState().test
export const getJourneyState = () => store.getState().journey
export const getSubscriptionState = () => store.getState().subscription
export const getLanguageState = () => store.getState().language
export const getFeedbackState = () => store.getState().feedback
export const getGamificationState = () => store.getState().gamification

// 스토어 리셋 함수 (로그아웃 시 사용)
export const resetStore = () => {
  // 각 슬라이스의 리셋 액션을 디스패치
  dispatch({ type: 'auth/forceLogout' })
  dispatch({ type: 'talk/resetState' })
  dispatch({ type: 'drama/resetDramaState' })
  dispatch({ type: 'test/resetState' })
  dispatch({ type: 'journey/resetJourneyState' })
  dispatch({ type: 'feedback/clearAllFeedbacks' })
  
  // 로컬 스토리지 정리
  if (typeof window !== 'undefined') {
    localStorage.removeItem('persist:spitkorean')
  }
}

// API 엔드포인트 상수들 (Vite 환경 변수 사용)
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
}

// 환경별 설정
export const ENVIRONMENT = {
  isDevelopment,
  isProduction: import.meta.env.MODE === 'production',
  isTest: import.meta.env.MODE === 'test',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString()
}