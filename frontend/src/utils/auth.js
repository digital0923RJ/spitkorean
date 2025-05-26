import { jwtDecode } from 'jwt-decode'
import { PRODUCTS } from '@shared/constants/products'
import { LEVELS } from '@shared/constants/levels'
import { SUPPORTED_LANGUAGES } from '@shared/constants/languages'

/**
 * 토큰 관련 유틸리티 함수들
 */
export const tokenUtils = {
  /**
   * JWT 토큰이 유효한지 확인
   * @param {string} token - JWT 토큰
   * @returns {boolean} 유효성 여부
   */
  isTokenValid: (token) => {
    if (!token) return false
    
    try {
      const decoded = jwtDecode(token)
      const currentTime = Date.now() / 1000
      
      // 토큰 만료 시간 체크
      if (decoded.exp && decoded.exp < currentTime) {
        return false
      }
      
      // 토큰 발급 시간이 미래인지 체크 (시계 동기화 문제 대응)
      if (decoded.iat && decoded.iat > currentTime + 60) {
        return false
      }
      
      return true
    } catch (error) {
      console.warn('Invalid token format:', error)
      return false
    }
  },

  /**
   * JWT 토큰에서 사용자 정보 추출
   * @param {string} token - JWT 토큰
   * @returns {object|null} 사용자 정보 또는 null
   */
  getUserFromToken: (token) => {
    if (!tokenUtils.isTokenValid(token)) return null
    
    try {
      const decoded = jwtDecode(token)
      return {
        id: decoded.sub || decoded.user_id,
        email: decoded.email,
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
        exp: decoded.exp,
        iat: decoded.iat
      }
    } catch (error) {
      console.error('Failed to decode token:', error)
      return null
    }
  },

  /**
   * 토큰 만료까지 남은 시간 (초)
   * @param {string} token - JWT 토큰
   * @returns {number} 남은 시간 (초), 유효하지 않으면 0
   */
  getTokenExpiresIn: (token) => {
    if (!tokenUtils.isTokenValid(token)) return 0
    
    try {
      const decoded = jwtDecode(token)
      const currentTime = Date.now() / 1000
      return Math.max(0, decoded.exp - currentTime)
    } catch (error) {
      return 0
    }
  },

  /**
   * 토큰이 곧 만료되는지 확인 (기본 5분 전)
   * @param {string} token - JWT 토큰
   * @param {number} beforeMinutes - 만료 전 몇 분
   * @returns {boolean} 곧 만료 여부
   */
  isTokenExpiringSoon: (token, beforeMinutes = 5) => {
    const expiresIn = tokenUtils.getTokenExpiresIn(token)
    return expiresIn > 0 && expiresIn < beforeMinutes * 60
  }
}

/**
 * 사용자 권한 관련 유틸리티 함수들
 */
export const authUtils = {
  /**
   * 사용자가 특정 역할을 가지고 있는지 확인
   * @param {object} user - 사용자 객체
   * @param {string|string[]} roles - 확인할 역할(들)
   * @returns {boolean} 역할 보유 여부
   */
  hasRole: (user, roles) => {
    if (!user?.roles) return false
    
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles]
    const requiredRoles = Array.isArray(roles) ? roles : [roles]
    
    return requiredRoles.some(role => userRoles.includes(role))
  },

  /**
   * 사용자가 특정 권한을 가지고 있는지 확인
   * @param {object} user - 사용자 객체
   * @param {string|string[]} permissions - 확인할 권한(들)
   * @returns {boolean} 권한 보유 여부
   */
  hasPermission: (user, permissions) => {
    if (!user?.permissions) return false
    
    const userPermissions = Array.isArray(user.permissions) ? user.permissions : [user.permissions]
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions]
    
    return requiredPermissions.some(permission => userPermissions.includes(permission))
  },

  /**
   * 사용자가 관리자인지 확인
   * @param {object} user - 사용자 객체
   * @returns {boolean} 관리자 여부
   */
  isAdmin: (user) => {
    return authUtils.hasRole(user, ['admin', 'super_admin'])
  },

  /**
   * 사용자 이메일이 인증되었는지 확인
   * @param {object} user - 사용자 객체
   * @returns {boolean} 이메일 인증 여부
   */
  isEmailVerified: (user) => {
    return user?.emailVerified === true || user?.email_verified === true
  },

  /**
   * 사용자 계정이 활성화되어 있는지 확인
   * @param {object} user - 사용자 객체
   * @returns {boolean} 계정 활성화 여부
   */
  isAccountActive: (user) => {
    return user?.status === 'active' && !user?.suspended
  }
}

/**
 * 구독 관련 유틸리티 함수들
 */
export const subscriptionUtils = {
  /**
   * 사용자의 활성 구독 목록 조회
   * @param {object} user - 사용자 객체
   * @returns {array} 활성 구독 목록
   */
  getActiveSubscriptions: (user) => {
    if (!user?.subscriptions) return []
    
    return user.subscriptions.filter(sub => 
      sub.status === 'active' && 
      (!sub.endDate || new Date(sub.endDate) > new Date())
    )
  },

  /**
   * 특정 상품 구독 여부 확인
   * @param {object} user - 사용자 객체
   * @param {string} productId - 상품 ID (talk, drama, test, journey)
   * @returns {boolean} 구독 여부
   */
  hasActiveSubscription: (user, productId) => {
    const activeSubscriptions = subscriptionUtils.getActiveSubscriptions(user)
    return activeSubscriptions.some(sub => sub.product === productId)
  },

  /**
   * 여러 상품 구독 여부 확인
   * @param {object} user - 사용자 객체
   * @param {string[]} productIds - 상품 ID 목록
   * @returns {boolean} 모든 상품 구독 여부
   */
  hasAllSubscriptions: (user, productIds) => {
    return productIds.every(productId => 
      subscriptionUtils.hasActiveSubscription(user, productId)
    )
  },

  /**
   * 번들 구독 여부 확인
   * @param {object} user - 사용자 객체
   * @returns {boolean} 전체 번들 구독 여부
   */
  hasBundleSubscription: (user) => {
    const allProducts = Object.keys(PRODUCTS)
    return subscriptionUtils.hasAllSubscriptions(user, allProducts)
  },

  /**
   * 구독 만료일까지 남은 일수
   * @param {object} subscription - 구독 객체
   * @returns {number} 남은 일수, 만료되었으면 0
   */
  getDaysUntilExpiry: (subscription) => {
    if (!subscription?.endDate) return Infinity
    
    const today = new Date()
    const expiryDate = new Date(subscription.endDate)
    const diffTime = expiryDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  },

  /**
   * 구독이 곧 만료되는지 확인 (기본 7일 전)
   * @param {object} subscription - 구독 객체
   * @param {number} beforeDays - 만료 전 며칠
   * @returns {boolean} 곧 만료 여부
   */
  isSubscriptionExpiringSoon: (subscription, beforeDays = 7) => {
    const daysUntilExpiry = subscriptionUtils.getDaysUntilExpiry(subscription)
    return daysUntilExpiry > 0 && daysUntilExpiry <= beforeDays
  }
}

/**
 * 사용자 프로필 관련 유틸리티 함수들
 */
export const profileUtils = {
  /**
   * 사용자 표시 이름 생성
   * @param {object} user - 사용자 객체
   * @returns {string} 표시 이름
   */
  getDisplayName: (user) => {
    if (user?.profile?.name) return user.profile.name
    if (user?.name) return user.name
    if (user?.email) return user.email.split('@')[0]
    return '사용자'
  },

  /**
   * 사용자 아바타 URL 조회
   * @param {object} user - 사용자 객체
   * @returns {string|null} 아바타 URL
   */
  getAvatarUrl: (user) => {
    return user?.profile?.avatar || 
           user?.profile?.profileImage || 
           user?.avatar || 
           null
  },

  /**
   * 사용자 한국어 레벨 정보 조회
   * @param {object} user - 사용자 객체
   * @returns {object} 레벨 정보
   */
  getKoreanLevelInfo: (user) => {
    const level = user?.profile?.koreanLevel || 'beginner'
    return LEVELS[level] || LEVELS.beginner
  },

  /**
   * 사용자 모국어 정보 조회
   * @param {object} user - 사용자 객체
   * @returns {object} 언어 정보
   */
  getNativeLanguageInfo: (user) => {
    const langCode = user?.profile?.nativeLanguage || 'en'
    return SUPPORTED_LANGUAGES.find(lang => lang.code === langCode) || 
           SUPPORTED_LANGUAGES.find(lang => lang.code === 'en')
  },

  /**
   * 사용자 관심사 목록 조회
   * @param {object} user - 사용자 객체
   * @returns {array} 관심사 목록
   */
  getInterests: (user) => {
    return user?.profile?.interests || []
  },

  /**
   * 일일 학습 목표 시간 조회 (분)
   * @param {object} user - 사용자 객체
   * @returns {number} 일일 학습 목표 시간 (분)
   */
  getDailyStudyGoal: (user) => {
    return user?.preferences?.dailyStudyTime || 15
  }
}

/**
 * 세션 관리 유틸리티 함수들
 */
export const sessionUtils = {
  /**
   * 세션 만료 시간 설정
   * @param {number} minutes - 만료 시간 (분)
   */
  setSessionTimeout: (minutes) => {
    const expiryTime = new Date(Date.now() + minutes * 60 * 1000)
    localStorage.setItem('session_expiry', expiryTime.toISOString())
  },

  /**
   * 세션이 만료되었는지 확인
   * @returns {boolean} 세션 만료 여부
   */
  isSessionExpired: () => {
    const expiryTime = localStorage.getItem('session_expiry')
    if (!expiryTime) return false
    
    return new Date() >= new Date(expiryTime)
  },

  /**
   * 세션 만료까지 남은 시간 (분)
   * @returns {number} 남은 시간 (분)
   */
  getSessionTimeRemaining: () => {
    const expiryTime = localStorage.getItem('session_expiry')
    if (!expiryTime) return 0
    
    const remaining = new Date(expiryTime) - new Date()
    return Math.max(0, Math.floor(remaining / (1000 * 60)))
  },

  /**
   * 세션 정보 클리어
   */
  clearSession: () => {
    localStorage.removeItem('session_expiry')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

/**
 * 인증 상태 검증 함수들
 */
export const validationUtils = {
  /**
   * 이메일 형식 검증
   * @param {string} email - 이메일 주소
   * @returns {boolean} 유효성 여부
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * 비밀번호 강도 검증
   * @param {string} password - 비밀번호
   * @returns {object} 검증 결과
   */
  validatePassword: (password) => {
    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    
    const score = Object.values(checks).filter(Boolean).length
    
    return {
      ...checks,
      score,
      strength: score < 3 ? 'weak' : score < 4 ? 'medium' : 'strong',
      isValid: checks.minLength && checks.hasUpperCase && checks.hasLowerCase && checks.hasNumber
    }
  },

  /**
   * 사용자명 형식 검증
   * @param {string} username - 사용자명
   * @returns {boolean} 유효성 여부
   */
  isValidUsername: (username) => {
    // 3-20자, 영문자/숫자/언더스코어만 허용
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    return usernameRegex.test(username)
  }
}

/**
 * 인증 관련 상수들
 */
export const AUTH_CONSTANTS = {
  // 토큰 키
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  SESSION_EXPIRY_KEY: 'session_expiry',
  
  // 역할
  ROLES: {
    USER: 'user',
    PREMIUM: 'premium',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  },
  
  // 권한
  PERMISSIONS: {
    READ_PROFILE: 'read:profile',
    WRITE_PROFILE: 'write:profile',
    ACCESS_TALK: 'access:talk',
    ACCESS_DRAMA: 'access:drama',
    ACCESS_TEST: 'access:test',
    ACCESS_JOURNEY: 'access:journey',
    ADMIN_PANEL: 'admin:panel'
  },
  
  // 세션 타임아웃 (분)
  SESSION_TIMEOUT: 24 * 60, // 24시간
  
  // 토큰 갱신 임계값 (분)
  TOKEN_REFRESH_THRESHOLD: 5
}

/**
 * 전체 인증 상태 검증 (메인 함수)
 * @param {object} user - 사용자 객체
 * @param {string} token - 액세스 토큰
 * @returns {object} 인증 상태 정보
 */
export const validateAuthState = (user, token) => {
  const isTokenValid = tokenUtils.isTokenValid(token)
  const isEmailVerified = authUtils.isEmailVerified(user)
  const isAccountActive = authUtils.isAccountActive(user)
  const activeSubscriptions = subscriptionUtils.getActiveSubscriptions(user)
  
  return {
    isAuthenticated: isTokenValid && user && isAccountActive,
    isEmailVerified,
    isAccountActive,
    hasActiveSubscriptions: activeSubscriptions.length > 0,
    activeSubscriptions,
    tokenExpiresIn: tokenUtils.getTokenExpiresIn(token),
    isTokenExpiringSoon: tokenUtils.isTokenExpiringSoon(token),
    sessionTimeRemaining: sessionUtils.getSessionTimeRemaining(),
    isSessionExpired: sessionUtils.isSessionExpired()
  }
}

// 기본 내보내기
export default {
  tokenUtils,
  authUtils,
  subscriptionUtils,
  profileUtils,
  sessionUtils,
  validationUtils,
  validateAuthState,
  AUTH_CONSTANTS
}