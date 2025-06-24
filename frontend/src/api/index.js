// src/api/index.js
import axios from 'axios'
import toast from 'react-hot-toast'
import { API_CONFIG, API_ENDPOINTS, ERROR_TYPES, ERROR_MESSAGES, HTTP_STATUS, CACHE_CONFIG } from '@/shared/constants/api'
import { tokenUtils, sessionUtils } from '@/utils/auth'

// ===== 기본 Axios 설정 =====
const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
    'X-Client-Platform': 'web'
  },
})

// ===== 토큰 관리자 =====
export const tokenManager = {
  getToken: () => localStorage.getItem('access_token'),
  setToken: (token) => {
    localStorage.setItem('access_token', token)
    if (token) {
      const tokenInfo = tokenUtils.getUserFromToken(token)
      if (tokenInfo?.exp) {
        const expiryMinutes = Math.floor((tokenInfo.exp * 1000 - Date.now()) / (1000 * 60))
        sessionUtils.setSessionTimeout(expiryMinutes)
      }
    }
  },
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setRefreshToken: (token) => localStorage.setItem('refresh_token', token),
  clearTokens: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    sessionUtils.clearSession()
  },
  isTokenValid: () => {
    const token = tokenManager.getToken()
    return tokenUtils.isTokenValid(token)
  },
  isTokenExpiringSoon: () => {
    const token = tokenManager.getToken()
    return tokenUtils.isTokenExpiringSoon(token)
  }
}

// ===== 요청 큐 관리 =====
const pendingRequests = new Map()

const generateRequestKey = (config) => {
  return `${config.method}-${config.url}-${JSON.stringify(config.params)}-${JSON.stringify(config.data)}`
}

// ===== 요청 인터셉터 =====
api.interceptors.request.use(
  (config) => {
    // 인증 토큰 추가
    const token = tokenManager.getToken()
    if (token && tokenUtils.isTokenValid(token)) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 사용자 언어 설정 추가
    const userLanguage = localStorage.getItem('user_language') || 'ko'
    config.headers['Accept-Language'] = userLanguage
    
    // 중복 요청 방지 (GET 요청만)
    if (config.method === 'get') {
      const requestKey = generateRequestKey(config)
      
      if (pendingRequests.has(requestKey)) {
        return pendingRequests.get(requestKey)
      }
      
      const requestPromise = Promise.resolve(config)
      pendingRequests.set(requestKey, requestPromise)
      
      requestPromise.finally(() => {
        pendingRequests.delete(requestKey)
      })
    }
    
    // Request ID 추가 (디버깅용)
    config.metadata = {
      requestId: Math.random().toString(36).substr(2, 9),
      startTime: Date.now()
    }
    
    // 요청 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request [${config.metadata.requestId}]: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
        headers: config.headers
      })
    }
    
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// ===== 응답 인터셉터 =====
api.interceptors.response.use(
  (response) => {
    const { config } = response
    const responseTime = Date.now() - config.metadata?.startTime
    
    // 응답 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log(`✅ API Response [${config.metadata?.requestId}]: ${config.method?.toUpperCase()} ${config.url}`, {
        status: response.status,
        responseTime: `${responseTime}ms`,
        data: response.data
      })
    }
    
    // 성능 경고 (3초 이상)
    if (responseTime > 3000) {
      console.warn(`⚠️ Slow API Response: ${config.url} took ${responseTime}ms`)
    }
    
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const requestId = originalRequest?.metadata?.requestId
    
    // 네트워크 에러
    if (!error.response) {
      const errorType = error.code === 'ECONNABORTED' ? ERROR_TYPES.TIMEOUT_ERROR : ERROR_TYPES.NETWORK_ERROR
      handleApiError(errorType, null, requestId)
      return Promise.reject({ 
        type: errorType, 
        message: ERROR_MESSAGES[errorType],
        requestId 
      })
    }
    
    const { status, data } = error.response
    
    // 401 Unauthorized - 토큰 갱신 시도
    if (status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = tokenManager.getRefreshToken()
        
        if (refreshToken) {
          const response = await axios.post(`${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}${API_ENDPOINTS.AUTH.REFRESH}`, {
            refresh_token: refreshToken
          })
          
          const { access_token, refresh_token: newRefreshToken } = response.data.data
          
          tokenManager.setToken(access_token)
          if (newRefreshToken) {
            tokenManager.setRefreshToken(newRefreshToken)
          }
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        tokenManager.clearTokens()
        
        window.dispatchEvent(new CustomEvent('auth:logout', { 
          detail: { reason: 'token_refresh_failed' } 
        }))
        
        return Promise.reject({ 
          type: ERROR_TYPES.AUTH_ERROR, 
          message: '인증이 만료되었습니다. 다시 로그인해주세요.',
          requestId
        })
      }
    }
    
    // 기타 HTTP 에러 처리
    let errorType = ERROR_TYPES.UNKNOWN_ERROR
    let errorMessage = data?.message || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR]
    
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        errorType = ERROR_TYPES.VALIDATION_ERROR
        if (data?.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.join(', ')
        }
        break
      case HTTP_STATUS.FORBIDDEN:
        errorType = ERROR_TYPES.AUTH_ERROR
        errorMessage = '접근 권한이 없습니다.'
        break
      case HTTP_STATUS.NOT_FOUND:
        errorMessage = '요청한 리소스를 찾을 수 없습니다.'
        break
      case HTTP_STATUS.CONFLICT:
        errorMessage = '이미 존재하는 데이터입니다.'
        break
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        errorType = ERROR_TYPES.RATE_LIMIT_ERROR
        const retryAfter = error.response.headers['retry-after']
        if (retryAfter) {
          errorMessage = `${ERROR_MESSAGES[errorType]} (${retryAfter}초 후 재시도)`
        }
        break
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        errorType = ERROR_TYPES.SERVER_ERROR
        break
    }
    
    handleApiError(errorType, errorMessage, requestId)
    
    console.error(`❌ API Error [${requestId}]: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
      status,
      errorType,
      errorMessage,
      data,
      responseTime: originalRequest?.metadata ? Date.now() - originalRequest.metadata.startTime : 'unknown'
    })
    
    return Promise.reject({
      type: errorType,
      message: errorMessage,
      status,
      data,
      requestId
    })
  }
)

// ===== 에러 처리 함수 =====
const handleApiError = (errorType, customMessage, requestId) => {
  const message = customMessage || ERROR_MESSAGES[errorType]
  
  const toastKey = `${errorType}-${message}`
  if (!window.lastToastMessage || window.lastToastMessage !== toastKey) {
    switch (errorType) {
      case ERROR_TYPES.AUTH_ERROR:
        toast.error(message, { icon: '🔒' })
        break
      case ERROR_TYPES.NETWORK_ERROR:
        toast.error(message, { icon: '📡' })
        break
      case ERROR_TYPES.RATE_LIMIT_ERROR:
        toast.error(message, { icon: '⏱️' })
        break
      default:
        toast.error(message)
    }
    
    window.lastToastMessage = toastKey
    setTimeout(() => { window.lastToastMessage = null }, 3000)
  }
  
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('event', 'api_error', {
      error_type: errorType,
      error_message: message,
      request_id: requestId
    })
  }
}

// ===== 캐시 시스템 =====
const cache = new Map()

export const cachedGet = async (url, options = {}) => {
  const { 
    ttl = CACHE_CONFIG.TTL.MEDIUM, 
    useCache = true,
    cacheKey: customCacheKey,
    bypassCache = false
  } = options
  
  if (!useCache || bypassCache) {
    return api.get(url, options)
  }
  
  const cacheKey = customCacheKey || `${CACHE_CONFIG.PREFIX}${url}`
  const cachedData = cache.get(cacheKey)
  
  if (cachedData && Date.now() - cachedData.timestamp < ttl) {
    if (import.meta.env.DEV) {
      console.log(`📦 Cache Hit: ${url}`)
    }
    return { data: cachedData.data }
  }
  
  try {
    const response = await api.get(url, options)
    
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    })
    
    if (import.meta.env.DEV) {
      console.log(`💾 Cache Set: ${url}`)
    }
    
    return response
  } catch (error) {
    if (cachedData && error.type === ERROR_TYPES.NETWORK_ERROR) {
      console.log(`📦 Cache Fallback: ${url}`)
      toast.info('오프라인 모드: 캐시된 데이터를 표시합니다')
      return { data: cachedData.data }
    }
    throw error
  }
}

export const clearCache = (pattern) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}

// ===== 인증 API =====
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    
    if (response.data.data?.token) {
      tokenManager.setToken(response.data.data.token)
      
      if (response.data.data.refresh_token) {
        tokenManager.setRefreshToken(response.data.data.refresh_token)
      }
    }
    
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    
    if (response.data.data?.token) {
      tokenManager.setToken(response.data.data.token)
      
      if (response.data.data.refresh_token) {
        tokenManager.setRefreshToken(response.data.data.refresh_token)
      }
    }
    
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.warn('Server logout failed, but clearing local tokens')
    } finally {
      tokenManager.clearTokens()
    }
  },

  getCurrentUser: async (useCache = true) => {
    const response = await cachedGet('/auth/me', {
      useCache,
      ttl: 10 * 60 * 1000
    })
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/update-profile', profileData)
    clearCache('/auth/me')
    return response.data
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData)
    return response.data
  },

  refreshToken: async () => {
    const refreshToken = tokenManager.getRefreshToken()
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    const response = await api.post('/auth/refresh', {
      refresh_token: refreshToken
    })
    
    if (response.data.data?.access_token) {
      tokenManager.setToken(response.data.data.access_token)
    }
    
    return response.data
  },

  checkAuthStatus: async () => {
    const token = tokenManager.getToken()
    
    if (!token) {
      return { isAuthenticated: false, user: null }
    }
    
    try {
      const userData = await authAPI.getCurrentUser(true)
      return {
        isAuthenticated: true,
        user: userData.data
      }
    } catch (error) {
      tokenManager.clearTokens()
      return { isAuthenticated: false, user: null }
    }
  }
}

// ===== Talk Like You Mean It API =====
export const talkAPI = {
  sendMessage: async (data) => {
    const response = await api.post('/talk/chat', data)
    return response.data
  },

  getSessions: async () => {
    const response = await api.get('/talk/sessions')
    return response.data
  },

  getSession: async (sessionId) => {
    const response = await api.get(`/talk/session/${sessionId}`)
    return response.data
  },

  getUsage: async () => {
    const response = await api.get('/talk/usage')
    return response.data
  }
}

// ===== Drama Builder API =====
export const dramaAPI = {
  getSentences: async (level = 'beginner') => {
    const response = await api.get(`/drama/sentences?level=${level}`)
    return response.data
  },

  checkSentence: async (data) => {
    const response = await api.post('/drama/check', data)
    return response.data
  },

  getProgress: async () => {
    const response = await api.get('/drama/progress')
    return response.data
  },

  getUsage: async () => {
    const response = await api.get('/drama/usage')
    return response.data
  }
}

// ===== Test & Study API =====
export const testAPI = {
  getQuestions: async (level = 3, count = 10, type = 'mixed') => {
    const response = await api.get(`/test/questions?level=${level}&count=${count}&type=${type}`)
    return response.data
  },

  submitAnswers: async (data) => {
    const response = await api.post('/test/submit', data)
    return response.data
  },

  getResults: async () => {
    const response = await api.get('/test/results')
    return response.data
  },

  getUsage: async () => {
    const response = await api.get('/test/usage')
    return response.data
  }
}

// ===== Korean Journey API =====
export const journeyAPI = {
  getContent: async (level = 'level1', type = 'reading') => {
    const response = await api.get(`/journey/content?level=${level}&type=${type}`)
    return response.data
  },

  submitReading: async (formData) => {
    const response = await api.post('/journey/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getProgress: async () => {
    const response = await api.get('/journey/progress')
    return response.data
  },

  getUsage: async () => {
    const response = await api.get('/journey/usage')
    return response.data
  }
}

// ===== 구독 관리 API =====
export const subscriptionAPI = {
  getPlans: async () => {
    const response = await api.get('/common/subscription/plans')
    return response.data
  },

  getMySubscriptions: async () => {
    const response = await api.get('/common/subscription/my-subscriptions')
    return response.data
  },

  create: async (subscriptionData) => {
    const response = await api.post('/common/subscription/subscribe', subscriptionData)
    return response.data
  },

  cancel: async (subscriptionId) => {
    const response = await api.post(`/subscription/cancel/${subscriptionId}`)
    return response.data
  },

  getBillingHistory: async (params = {}) => {
    const queryParams = new URLSearchParams({
      limit: params.limit || 20,
      skip: params.skip || 0,
      ...params
    })
    
    const response = await api.get(`/subscription/billing-history?${queryParams}`)
    return response.data
  },

  getUsageStats: async () => {
    const response = await api.get('common/subscription/usage-stats')
    return response.data
  },

  processPayment: async (paymentData) => {
    const response = await api.post('/subscription/process-payment', paymentData)
    return response.data
  },

  validateDiscountCode: async (discountCode) => {
    const response = await api.post('/subscription/validate-discount', { 
      discount_code: discountCode 
    })
    return response.data
  }
}

// ===== 게임화 API =====
export const gamificationAPI = {
  updateStreak: async () => {
    const response = await api.post('/common/streak')
    clearCache('/common/gamification')
    return response.data
  },

  getUserStats: async (useCache = true) => {
    const response = await cachedGet('/common/gamification', {
      useCache,
      ttl: 5 * 60 * 1000
    })
    return response.data
  },

  getLeaderboard: async ({ league = null, limit = 10, useCache = true }) => {
    const params = new URLSearchParams()
    if (league) params.append('league', league)
    params.append('limit', limit.toString())
    
    const url = `/common/league-ranking?${params.toString()}`
    
    const response = await cachedGet(url, {
      useCache,
      ttl: 2 * 60 * 1000
    })
    return response.data
  },

  updateXP: async ({ activity, amount, metadata = {} }) => {
    const response = await api.post('/common/xp', {
      activity,
      amount,
      metadata,
      timestamp: new Date().toISOString()
    })
    
    clearCache('/common/gamification')
    clearCache('/common/league-ranking')
    
    return response.data
  }
}

// ===== 유틸리티 함수들 =====
export const apiWithRetry = async (apiCall, maxRetries = 3) => {
  let lastError
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error
      
      const nonRetryableErrors = [
        ERROR_TYPES.AUTH_ERROR,
        ERROR_TYPES.VALIDATION_ERROR,
        HTTP_STATUS.NOT_FOUND,
        HTTP_STATUS.FORBIDDEN
      ]
      
      const isNonRetryable = nonRetryableErrors.includes(error.type) || 
                           nonRetryableErrors.includes(error.status)
      
      if (isNonRetryable || attempt === maxRetries) {
        throw error
      }
      
      const delay = 1000 * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      console.log(`🔄 API Retry ${attempt}/${maxRetries} after ${delay}ms`)
    }
  }
  
  throw lastError
}

export const uploadFile = async (url, file, options = {}) => {
  const { 
    onProgress, 
    additionalData = {},
    validateFile = true 
  } = options
  
  if (validateFile) {
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error(`파일 크기가 너무 큽니다. 최대 ${maxSize / (1024 * 1024)}MB까지 업로드 가능합니다.`)
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'audio/wav', 'audio/mp3', 'audio/ogg']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('지원하지 않는 파일 형식입니다.')
    }
  }
  
  const formData = new FormData()
  formData.append('file', file)
  
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value)
  })
  
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  })
}

export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/health`, {
      timeout: 5000
    })
    return {
      isHealthy: response.status === 200,
      responseTime: response.headers['x-response-time'],
      version: response.data?.version
    }
  } catch (error) {
    return {
      isHealthy: false,
      error: error.message
    }
  }
}

// ===== 통합 API 객체 =====
export const spitKoreanAPI = {
  auth: authAPI,
  talk: talkAPI,
  drama: dramaAPI,
  test: testAPI,
  journey: journeyAPI,
  subscription: subscriptionAPI,
  gamification: gamificationAPI
}

// ===== 이벤트 관리 =====
export const authEvents = {
  emitLogin: (user) => {
    window.dispatchEvent(new CustomEvent('auth:login', { detail: user }))
  },

  emitLogout: () => {
    window.dispatchEvent(new CustomEvent('auth:logout'))
  },

  emitProfileUpdate: (user) => {
    window.dispatchEvent(new CustomEvent('auth:profile-updated', { detail: user }))
  },

  onAuthChange: (callback) => {
    const handleLogin = (event) => callback({ type: 'login', user: event.detail })
    const handleLogout = () => callback({ type: 'logout', user: null })
    const handleProfileUpdate = (event) => callback({ type: 'profile-updated', user: event.detail })
    
    window.addEventListener('auth:login', handleLogin)
    window.addEventListener('auth:logout', handleLogout)
    window.addEventListener('auth:profile-updated', handleProfileUpdate)
    
    return () => {
      window.removeEventListener('auth:login', handleLogin)
      window.removeEventListener('auth:logout', handleLogout)
      window.removeEventListener('auth:profile-updated', handleProfileUpdate)
    }
  }
}

export const gamificationEvents = {
  emitXPGain: (data) => {
    window.dispatchEvent(new CustomEvent('gamification:xp-gained', { detail: data }))
  },

  emitStreakUpdate: (data) => {
    window.dispatchEvent(new CustomEvent('gamification:streak-updated', { detail: data }))
  },

  emitAchievementUnlock: (achievement) => {
    window.dispatchEvent(new CustomEvent('gamification:achievement-unlocked', { detail: achievement }))
  },

  onGamificationEvent: (callback) => {
    const handleXPGain = (event) => callback({ type: 'xp-gained', data: event.detail })
    const handleStreakUpdate = (event) => callback({ type: 'streak-updated', data: event.detail })
    const handleAchievementUnlock = (event) => callback({ type: 'achievement-unlocked', data: event.detail })
    
    window.addEventListener('gamification:xp-gained', handleXPGain)
    window.addEventListener('gamification:streak-updated', handleStreakUpdate)
    window.addEventListener('gamification:achievement-unlocked', handleAchievementUnlock)
    
    return () => {
      window.removeEventListener('gamification:xp-gained', handleXPGain)
      window.removeEventListener('gamification:streak-updated', handleStreakUpdate)
      window.removeEventListener('gamification:achievement-unlocked', handleAchievementUnlock)
    }
  }
}

// ===== 상수 정의 =====
export const XP_ACTIVITIES = {
  DAILY_LOGIN: 'daily_login',
  COMPLETE_LESSON: 'complete_lesson',
  PERFECT_SCORE: 'perfect_score',
  STREAK_MILESTONE: 'streak_milestone',
  TALK_CHAT: 'talk_chat',
  DRAMA_SENTENCE_COMPLETE: 'drama_sentence_complete',
  TEST_QUIZ_COMPLETE: 'test_quiz_complete',
  JOURNEY_READING_COMPLETE: 'journey_reading_complete'
}

export const ACHIEVEMENT_IDS = {
  STREAK_7_DAYS: '7_day_streak',
  STREAK_30_DAYS: '30_day_streak',
  STREAK_100_DAYS: '100_day_streak',
  GRAMMAR_EXPERT: 'grammar_expert',
  PRONUNCIATION_MASTER: 'pronunciation_master',
  VOCABULARY_HERO: 'vocabulary_hero',
  TEST_ACE: 'test_ace',
  SOCIAL_BUTTERFLY: 'social_butterfly'
}

export const LEAGUES = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  DIAMOND: 'diamond'
}

// ===== 온라인/오프라인 상태 감지 =====
let isOnline = navigator.onLine

window.addEventListener('online', () => {
  isOnline = true
  toast.success('인터넷 연결이 복구되었습니다')
})

window.addEventListener('offline', () => {
  isOnline = false
  toast.error('인터넷 연결이 끊어졌습니다')
})

export const getNetworkStatus = () => isOnline

// ===== 주기적 캐시 정리 =====
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > 24 * 60 * 60 * 1000) { // 24시간
      cache.delete(key)
    }
  }
}, 5 * 60 * 1000) // 5분마다 실행

// ===== 기본 export =====
export default api