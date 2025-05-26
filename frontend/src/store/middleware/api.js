// frontend/src/store/middleware/api.js
import toast from 'react-hot-toast'
import { isRejectedWithValue } from '@reduxjs/toolkit'

// API 클라이언트
import apiClient from '../../api/index.js'

/**
 * SpitKorean API 미들웨어
 * 
 * 기능:
 * - API 호출 로깅
 * - 에러 처리 및 사용자 알림
 * - 인증 토큰 만료 처리
 * - 재시도 로직
 * - 성능 모니터링
 * - RTK Query rejected 액션 처리
 */

// 환경별 설정
const isDevelopment = import.meta.env.MODE === 'development'
const isProduction = import.meta.env.MODE === 'production'

// API 호출 통계
let apiStats = {
  totalCalls: 0,
  successCalls: 0,
  errorCalls: 0,
  avgResponseTime: 0,
  lastReset: Date.now()
}

// 에러 메시지 맵핑
const ERROR_MESSAGES = {
  // 일반 에러
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  TIMEOUT_ERROR: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  SERVER_ERROR: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  
  // 인증 에러
  UNAUTHORIZED: '로그인이 필요합니다.',
  TOKEN_EXPIRED: '로그인이 만료되었습니다. 다시 로그인해주세요.',
  FORBIDDEN: '접근 권한이 없습니다.',
  
  // 구독 에러
  SUBSCRIPTION_REQUIRED: '구독이 필요한 서비스입니다.',
  USAGE_LIMIT_EXCEEDED: '일일 사용량을 초과했습니다.',
  
  // 상품별 특정 에러
  TALK_SESSION_ERROR: '대화 세션에 문제가 발생했습니다.',
  DRAMA_CONTENT_ERROR: '드라마 콘텐츠를 불러올 수 없습니다.',
  TEST_GENERATION_ERROR: '문제 생성에 실패했습니다.',
  JOURNEY_AUDIO_ERROR: '음성 처리에 실패했습니다.',
  
  // 결제 에러
  PAYMENT_FAILED: '결제에 실패했습니다.',
  CARD_DECLINED: '카드가 거절되었습니다.',
  INSUFFICIENT_FUNDS: '잔액이 부족합니다.',
  
  // RTK Query 전용 에러
  FETCH_ERROR: '데이터를 가져오는 중 오류가 발생했습니다.',
  PARSING_ERROR: '응답 데이터 처리 중 오류가 발생했습니다.',
  CUSTOM_ERROR: '서비스에서 오류가 발생했습니다.'
}

// 재시도 대상 액션들
const RETRYABLE_ACTIONS = [
  'talk/sendMessage',
  'drama/fetchSentences',
  'test/fetchQuestions',
  'journey/fetchContent',
  'gamification/updateXP',
  'subscription/fetchPlans',
  // RTK Query 엔드포인트
  'talkApi/sendMessage',
  'dramaApi/getSentences',
  'testApi/getQuestions',
  'journeyApi/getContent'
]

// 자동 토스트 제외 액션들 (조용히 실행)
const SILENT_ACTIONS = [
  'auth/checkAuthStatus',
  'gamification/checkLevelUp',
  'subscription/validateDiscountCode',
  // RTK Query 엔드포인트
  'authApi/checkAuthStatus',
  'gamificationApi/getUserStats'
]

// 성공 메시지 표시 액션들
const SUCCESS_TOAST_ACTIONS = {
  'auth/loginUser': (action) => `안녕하세요, ${action.payload.user?.profile?.name || '사용자'}님!`,
  'auth/registerUser': () => '회원가입이 완료되었습니다! 🎉',
  'subscription/createSubscription': () => '구독이 성공적으로 처리되었습니다!',
  'drama/submitSentenceAnswer': (action) => action.payload.is_correct ? '정답입니다! 🎉' : '다시 도전해보세요!',
  'test/submitTest': (action) => `테스트 완료! 점수: ${action.payload.score}점`,
  'journey/submitReading': () => '리딩 세션이 완료되었습니다!',
  // RTK Query 엔드포인트
  'authApi/login': (action) => `안녕하세요, ${action.payload.user?.profile?.name || '사용자'}님!`,
  'subscriptionApi/create': () => '구독이 성공적으로 처리되었습니다!'
}

/**
 * API 호출 통계 업데이트
 */
const updateApiStats = (isSuccess, responseTime) => {
  apiStats.totalCalls++
  if (isSuccess) {
    apiStats.successCalls++
  } else {
    apiStats.errorCalls++
  }
  
  // 평균 응답 시간 계산
  if (responseTime) {
    apiStats.avgResponseTime = (apiStats.avgResponseTime + responseTime) / 2
  }
  
  // 1시간마다 통계 리셋
  if (Date.now() - apiStats.lastReset > 3600000) {
    if (isDevelopment) {
      console.log('📊 API Stats (Last Hour):', {
        ...apiStats,
        successRate: `${((apiStats.successCalls / apiStats.totalCalls) * 100).toFixed(1)}%`
      })
    }
    
    apiStats = {
      totalCalls: 0,
      successCalls: 0,
      errorCalls: 0,
      avgResponseTime: 0,
      lastReset: Date.now()
    }
  }
}

/**
 * 에러 코드에 따른 메시지 반환
 */
const getErrorMessage = (error, actionType) => {
  const errorCode = error?.code || error?.type
  const status = error?.status || error?.response?.status
  
  // HTTP 상태 코드별 처리
  if (status === 401) return ERROR_MESSAGES.UNAUTHORIZED
  if (status === 403) return ERROR_MESSAGES.FORBIDDEN
  if (status === 429) return ERROR_MESSAGES.USAGE_LIMIT_EXCEEDED
  if (status >= 500) return ERROR_MESSAGES.SERVER_ERROR
  
  // 상품별 특정 에러
  if (actionType.includes('talk')) return ERROR_MESSAGES.TALK_SESSION_ERROR
  if (actionType.includes('drama')) return ERROR_MESSAGES.DRAMA_CONTENT_ERROR
  if (actionType.includes('test')) return ERROR_MESSAGES.TEST_GENERATION_ERROR
  if (actionType.includes('journey')) return ERROR_MESSAGES.JOURNEY_AUDIO_ERROR
  
  // 에러 코드별 처리
  if (errorCode === 'NETWORK_ERROR') return ERROR_MESSAGES.NETWORK_ERROR
  if (errorCode === 'TIMEOUT_ERROR') return ERROR_MESSAGES.TIMEOUT_ERROR
  if (errorCode === 'SUBSCRIPTION_REQUIRED') return ERROR_MESSAGES.SUBSCRIPTION_REQUIRED
  
  // 기본 에러 메시지
  return error?.message || '알 수 없는 오류가 발생했습니다.'
}

/**
 * RTK Query 에러 메시지 생성
 */
const getRTKQueryErrorMessage = (error, actionType) => {
  // RTK Query 에러 구조 분석
  const status = error?.status || error?.originalStatus
  const data = error?.data || error?.error
  
  // RTK Query 특화 에러 처리
  if (error?.name === 'ConditionError') {
    return '요청 조건이 충족되지 않았습니다.'
  }
  
  if (error?.name === 'ResponseError') {
    return '서버 응답에 문제가 있습니다.'
  }
  
  // fetch 에러 처리
  if (typeof status === 'string') {
    switch (status) {
      case 'FETCH_ERROR':
        return ERROR_MESSAGES.FETCH_ERROR
      case 'TIMEOUT_ERROR':
        return ERROR_MESSAGES.TIMEOUT_ERROR
      case 'PARSING_ERROR':
        return ERROR_MESSAGES.PARSING_ERROR
      case 'CUSTOM_ERROR':
        return data?.message || ERROR_MESSAGES.CUSTOM_ERROR
      default:
        return getErrorMessage(error, actionType)
    }
  }
  
  // 기존 HTTP 상태 코드 처리로 폴백
  return getErrorMessage(error, actionType)
}

/**
 * 토큰 만료 확인 및 처리
 */
const handleTokenExpiry = (error, dispatch) => {
  const status = error?.status || error?.response?.status
  const message = error?.message || ''
  
  if (status === 401 || message.includes('token') || message.includes('expired')) {
    // 토큰 만료 시 강제 로그아웃
    dispatch({ type: 'auth/forceLogout' })
    
    toast.error(ERROR_MESSAGES.TOKEN_EXPIRED, {
      id: 'token-expired',
      duration: 5000,
      icon: '🔐'
    })
    
    // API 클라이언트의 토큰 정리
    if (apiClient.tokenManager) {
      apiClient.tokenManager.clearTokens()
    }
    
    // 로그인 페이지로 리다이렉트 (필요시)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    }
    
    return true
  }
  
  return false
}

/**
 * 재시도 로직
 */
const attemptRetry = async (action, dispatch, retryCount = 0) => {
  const maxRetries = 3
  const retryDelay = Math.pow(2, retryCount) * 1000 // 지수적 백오프
  
  if (retryCount >= maxRetries) {
    return false
  }
  
  if (isDevelopment) {
    console.log(`🔄 Retrying ${action.type} (attempt ${retryCount + 1}/${maxRetries})`)
  }
  
  await new Promise(resolve => setTimeout(resolve, retryDelay))
  
  try {
    // 원본 액션 재실행
    const result = await dispatch(action)
    
    if (result.meta?.requestStatus === 'fulfilled') {
      toast.success('재시도에 성공했습니다!', {
        id: `retry-success-${action.type}`,
        duration: 2000
      })
      return true
    }
  } catch (retryError) {
    console.warn(`Retry ${retryCount + 1} failed:`, retryError)
  }
  
  // 재귀적으로 재시도
  return attemptRetry(action, dispatch, retryCount + 1)
}

/**
 * 성능 모니터링
 */
const monitorPerformance = (action, startTime) => {
  const endTime = performance.now()
  const duration = endTime - startTime
  
  // 느린 API 호출 감지 (3초 이상)
  if (duration > 3000) {
    console.warn(`🐌 Slow API call detected: ${action.type} took ${duration.toFixed(2)}ms`)
    
    if (isDevelopment) {
      toast(`API 응답이 느립니다: ${(duration / 1000).toFixed(1)}초`, {
        icon: '🐌',
        duration: 3000
      })
    }
  }
  
  return duration
}

/**
 * 요청 중복 제거
 */
const pendingRequests = new Map()

const deduplicateRequest = (action) => {
  const key = `${action.type}-${JSON.stringify(action.meta?.arg || {})}`
  
  if (pendingRequests.has(key)) {
    if (isDevelopment) {
      console.log(`🔄 Duplicate request detected for ${action.type}`)
    }
    return true
  }
  
  pendingRequests.set(key, Date.now())
  
  // 30초 후 자동 정리
  setTimeout(() => {
    pendingRequests.delete(key)
  }, 30000)
  
  return false
}

/**
 * RTK Query와 일반 thunk 액션을 구분하는 헬퍼
 */
const isRTKQueryAction = (action) => {
  return action.meta?.arg?.endpointName !== undefined
}

/**
 * API 클라이언트 상태 모니터링
 */
const monitorApiClient = () => {
  if (apiClient?.getNetworkStatus && !apiClient.getNetworkStatus()) {
    toast.error('인터넷 연결을 확인해주세요.', {
      id: 'network-status',
      duration: 3000,
      icon: '📡'
    })
  }
}

/**
 * API 미들웨어 메인 함수
 */
export const apiMiddleware = (storeAPI) => (next) => (action) => {
  const { dispatch, getState } = storeAPI
  const startTime = performance.now()
  
  // RTK Query rejected 액션 처리 (isRejectedWithValue 활용)
  if (isRejectedWithValue(action)) {
    const { type, payload, meta } = action
    const baseType = type.replace('/rejected', '')
    const error = payload || action.error
    const duration = monitorPerformance(action, startTime)
    
    updateApiStats(false, duration)
    
    if (isDevelopment) {
      console.error(`❌ RTK Rejected Action: ${baseType}`, {
        error,
        duration: `${duration.toFixed(2)}ms`,
        meta,
        endpointName: meta?.arg?.endpointName,
        originalArgs: meta?.arg?.originalArgs
      })
    }
    
    // RTK Query 에러에 대한 특별 처리
    if (meta?.arg?.endpointName) {
      const endpointName = meta.arg.endpointName
      
      // 엔드포인트별 커스텀 에러 처리
      if (endpointName.includes('auth')) {
        if (handleTokenExpiry(error, dispatch)) {
          return next(action)
        }
      }
      
      // API 클라이언트의 에러 메트릭스 업데이트
      if (apiClient.apiMetrics) {
        apiClient.apiMetrics.record(true, duration)
      }
    }
    
    // 에러 토스트 표시 (RTK Query 특화)
    if (!SILENT_ACTIONS.some(silentAction => baseType.includes(silentAction))) {
      const errorMessage = getRTKQueryErrorMessage(error, baseType)
      toast.error(errorMessage, {
        id: `rtk-error-${baseType}`,
        duration: 5000,
        icon: '⚠️'
      })
    }
    
    // 에러 리포팅
    reportError(error, baseType, {
      isRTKQuery: true,
      endpointName: meta?.arg?.endpointName,
      originalArgs: meta?.arg?.originalArgs
    })
    
    return next(action)
  }
  
  // 액션이 비동기 thunk가 아닌 경우 그대로 통과
  if (!action.type || typeof action.type !== 'string') {
    return next(action)
  }
  
  // pending 액션 처리
  if (action.type.endsWith('/pending')) {
    const baseType = action.type.replace('/pending', '')
    
    // 요청 중복 확인
    if (deduplicateRequest(action)) {
      return next(action)
    }
    
    if (isDevelopment) {
      console.log(`🚀 API Request: ${baseType}`, {
        payload: action.meta?.arg,
        timestamp: new Date().toISOString(),
        endpointName: action.meta?.arg?.endpointName || 'unknown',
        isRTKQuery: isRTKQueryAction(action)
      })
    }
    
    // API 클라이언트의 메트릭스 시작
    if (apiClient.apiMetrics && action.meta?.requestId) {
      action.meta.startTime = startTime
    }
    
    return next(action)
  }
  
  // fulfilled 액션 처리
  if (action.type.endsWith('/fulfilled')) {
    const baseType = action.type.replace('/fulfilled', '')
    const duration = monitorPerformance(action, startTime)
    
    updateApiStats(true, duration)
    
    if (isDevelopment) {
      console.log(`✅ API Success: ${baseType}`, {
        payload: action.payload,
        duration: `${duration.toFixed(2)}ms`,
        endpointName: action.meta?.arg?.endpointName || 'unknown',
        isRTKQuery: isRTKQueryAction(action)
      })
    }
    
    // API 클라이언트의 메트릭스 업데이트
    if (apiClient.apiMetrics) {
      apiClient.apiMetrics.record(false, duration)
    }
    
    // 성공 토스트 표시
    if (SUCCESS_TOAST_ACTIONS[baseType] && !SILENT_ACTIONS.some(silentAction => baseType.includes(silentAction))) {
      const message = SUCCESS_TOAST_ACTIONS[baseType](action)
      if (message) {
        toast.success(message, {
          id: `success-${baseType}`,
          duration: 2000
        })
      }
    }
    
    return next(action)
  }
  
  // rejected 액션 처리 (기존 thunk 방식)
  if (action.type.endsWith('/rejected')) {
    const baseType = action.type.replace('/rejected', '')
    const duration = monitorPerformance(action, startTime)
    const error = action.payload || action.error
    
    updateApiStats(false, duration)
    
    if (isDevelopment) {
      console.error(`❌ API Error: ${baseType}`, {
        error,
        duration: `${duration.toFixed(2)}ms`,
        meta: action.meta,
        isRTKQuery: isRTKQueryAction(action)
      })
    }
    
    // 토큰 만료 처리
    if (handleTokenExpiry(error, dispatch)) {
      return next(action)
    }
    
    // 재시도 로직 (조건부)
    if (RETRYABLE_ACTIONS.some(retryableAction => baseType.includes(retryableAction)) && !action.meta?.isRetry) {
      const shouldRetry = error?.code === 'NETWORK_ERROR' || 
                         error?.status >= 500 || 
                         error?.message?.includes('timeout')
      
      if (shouldRetry) {
        // 재시도 표시 추가
        const retryAction = {
          ...action.meta?.originalAction || action,
          meta: { ...action.meta, isRetry: true }
        }
        
        attemptRetry(retryAction, dispatch).catch(() => {
          // 재시도 실패 시 원본 에러 표시
          if (!SILENT_ACTIONS.some(silentAction => baseType.includes(silentAction))) {
            const errorMessage = getErrorMessage(error, baseType)
            toast.error(errorMessage, {
              id: `error-${baseType}`,
              duration: 5000
            })
          }
        })
        
        return next(action)
      }
    }
    
    // 에러 토스트 표시
    if (!SILENT_ACTIONS.some(silentAction => baseType.includes(silentAction))) {
      const errorMessage = getErrorMessage(error, baseType)
      toast.error(errorMessage, {
        id: `error-${baseType}`,
        duration: 5000,
        icon: '⚠️'
      })
    }
    
    // 에러 리포팅
    reportError(error, baseType, {
      isRTKQuery: isRTKQueryAction(action),
      meta: action.meta
    })
    
    return next(action)
  }
  
  // 기타 액션들은 그대로 통과
  return next(action)
}

/**
 * API 통계 조회 함수 (디버깅용)
 */
export const getApiStats = () => {
  return {
    ...apiStats,
    successRate: apiStats.totalCalls > 0 
      ? `${((apiStats.successCalls / apiStats.totalCalls) * 100).toFixed(1)}%`
      : '0%',
    errorRate: apiStats.totalCalls > 0 
      ? `${((apiStats.errorCalls / apiStats.totalCalls) * 100).toFixed(1)}%`
      : '0%'
  }
}

/**
 * 통계 리셋 함수
 */
export const resetApiStats = () => {
  apiStats = {
    totalCalls: 0,
    successCalls: 0,
    errorCalls: 0,
    avgResponseTime: 0,
    lastReset: Date.now()
  }
}

/**
 * 에러 리포팅 (프로덕션용) - 향상된 버전
 */
const reportError = (error, actionType, context = {}) => {
  if (isProduction && typeof window !== 'undefined') {
    // 실제 프로덕션에서는 Sentry, LogRocket 등의 서비스 사용
    try {
      const errorReport = {
        error: {
          message: error?.message || 'Unknown error',
          stack: error?.stack,
          code: error?.code,
          status: error?.status
        },
        actionType,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: context.userId || 'anonymous'
        }
      }
      
      // window.Sentry?.captureException(error, {
      //   tags: { actionType },
      //   extra: errorReport
      // })
      
      console.error('Production API Error Report:', errorReport)
      
      // API 클라이언트를 통한 에러 로그 전송 (선택적)
      if (apiClient?.trackUserActivity) {
        apiClient.trackUserActivity('api_error', {
          action_type: actionType,
          error_code: error?.code || error?.status,
          error_message: error?.message
        })
      }
    } catch (reportingError) {
      console.error('Error reporting failed:', reportingError)
    }
  }
}

/**
 * 개발 환경에서 전역 접근 허용
 */
if (isDevelopment && typeof window !== 'undefined') {
  window.__API_STATS__ = getApiStats
  window.__RESET_API_STATS__ = resetApiStats
  window.__API_CLIENT__ = apiClient
  
  // 10초마다 API 통계 출력
  setInterval(() => {
    const stats = getApiStats()
    const clientStats = apiClient?.apiMetrics?.getStats?.() || {}
    
    if (stats.totalCalls > 0 || clientStats.totalRequests > 0) {
      console.log('📊 Live API Stats:', {
        middleware: stats,
        client: clientStats
      })
    }
  }, 10000)
}

// 네트워크 상태 주기적 체크 (5초마다)
if (typeof window !== 'undefined') {
  setInterval(monitorApiClient, 5000)
}

/**
 * 특정 액션 타입에 대한 커스텀 에러 핸들러 등록
 */
const ERROR_HANDLERS = {}

export const registerCustomErrorHandler = (actionType, handler) => {
  if (typeof handler === 'function') {
    ERROR_HANDLERS[actionType] = handler
  }
}

export default apiMiddleware