import api, { tokenManager, cachedGet } from './index'
import { API_ENDPOINTS } from '@shared/constants/api'

// 인증 관련 API 함수들
export const authAPI = {
  // 로그인
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    
    if (response.data.data?.token) {
      tokenManager.setToken(response.data.data.token)
      
      // refresh_token이 있다면 저장
      if (response.data.data.refresh_token) {
        tokenManager.setRefreshToken(response.data.data.refresh_token)
      }
    }
    
    return response.data
  },

  // 회원가입
  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData)
    
    if (response.data.data?.token) {
      tokenManager.setToken(response.data.data.token)
      
      if (response.data.data.refresh_token) {
        tokenManager.setRefreshToken(response.data.data.refresh_token)
      }
    }
    
    return response.data
  },

  // 로그아웃
  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      // 서버 로그아웃 실패해도 클라이언트에서는 토큰 삭제
      console.warn('Server logout failed, but clearing local tokens')
    } finally {
      tokenManager.clearTokens()
    }
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async (useCache = true) => {
    const response = await cachedGet(API_ENDPOINTS.AUTH.ME, {
      useCache,
      ttl: 10 * 60 * 1000 // 10분 캐시
    })
    return response.data
  },

  // 프로필 업데이트
  updateProfile: async (profileData) => {
    const response = await api.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, profileData)
    
    // 캐시 무효화
    clearCache('/auth/me')
    
    return response.data
  },

  // 비밀번호 찾기
  forgotPassword: async (email) => {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
    return response.data
  },

  // 비밀번호 재설정
  resetPassword: async (resetData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetData)
    return response.data
  },

  // 토큰 갱신
  refreshToken: async () => {
    const refreshToken = tokenManager.getRefreshToken()
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken
    })
    
    if (response.data.data?.access_token) {
      tokenManager.setToken(response.data.data.access_token)
    }
    
    return response.data
  },

  // 인증 상태 확인
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
      // 토큰이 유효하지 않으면 제거
      tokenManager.clearTokens()
      return { isAuthenticated: false, user: null }
    }
  },

  // 이메일 중복 확인
  checkEmailExists: async (email) => {
    const response = await api.post('/auth/check-email', { email })
    return response.data
  },

  // 사용자명 중복 확인  
  checkUsernameExists: async (username) => {
    const response = await api.post('/auth/check-username', { username })
    return response.data
  }
}

// 구글 로그인 (OAuth)
export const googleAuthAPI = {
  // 구글 로그인 URL 생성
  getGoogleAuthUrl: () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    console.log('Client ID:', clientId)
    const redirectUri = `${window.location.origin}/auth/google/callback`
    const scope = 'openid email profile'
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    })
    
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  },

  // 구글 인증 코드로 로그인 처리
  handleGoogleCallback: async (code) => {
    const response = await api.post('/auth/google/callback', { code })
    
    if (response.data.data?.token) {
      tokenManager.setToken(response.data.data.token)
      
      if (response.data.data.refresh_token) {
        tokenManager.setRefreshToken(response.data.data.refresh_token)
      }
    }
    
    return response.data
  }
}

// 인증 상태 변경 이벤트
export const authEvents = {
  // 로그인 이벤트 발생
  emitLogin: (user) => {
    window.dispatchEvent(new CustomEvent('auth:login', { detail: user }))
  },

  // 로그아웃 이벤트 발생
  emitLogout: () => {
    window.dispatchEvent(new CustomEvent('auth:logout'))
  },

  // 프로필 업데이트 이벤트 발생
  emitProfileUpdate: (user) => {
    window.dispatchEvent(new CustomEvent('auth:profile-updated', { detail: user }))
  },

  // 인증 상태 변경 리스너 등록
  onAuthChange: (callback) => {
    const handleLogin = (event) => callback({ type: 'login', user: event.detail })
    const handleLogout = () => callback({ type: 'logout', user: null })
    const handleProfileUpdate = (event) => callback({ type: 'profile-updated', user: event.detail })
    
    window.addEventListener('auth:login', handleLogin)
    window.addEventListener('auth:logout', handleLogout)
    window.addEventListener('auth:profile-updated', handleProfileUpdate)
    
    // 클리너 함수 반환
    return () => {
      window.removeEventListener('auth:login', handleLogin)
      window.removeEventListener('auth:logout', handleLogout)
      window.removeEventListener('auth:profile-updated', handleProfileUpdate)
    }
  }
}

export default authAPI