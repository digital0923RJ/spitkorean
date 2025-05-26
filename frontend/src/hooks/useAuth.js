import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import {
  loginUser,
  registerUser,
  logoutUser,
  checkAuthStatus,
  updateUserProfile,
  forgotPassword,
  resetPassword as resetPasswordAction, // 새로 추가된 액션
  clearErrors,
  resetSuccessStates,
  forceLogout,
  selectAuth,
  selectUser,
  selectIsAuthenticated
} from '@store/slices/authSlice'
import { authEvents } from '@api/auth'

// 🆕 유틸리티 import
import { getAuthToken, removeAuthToken } from '../utils/auth.js'

// 🆕 상수 import
import { ROUTES } from '../shared/constants/routes.js'

/**
 * 인증 관련 기능을 제공하는 커스텀 훅
 */
export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Redux 상태 선택
  const auth = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  
  // 로그인 함수
  const login = useCallback(async (credentials, options = {}) => {
    const { redirectTo = ROUTES.DASHBOARD, showSuccessToast = true } = options
    
    try {
      const result = await dispatch(loginUser(credentials)).unwrap()
      
      if (result) {
        // 로그인 성공 후 리다이렉트
        const from = location.state?.from?.pathname || redirectTo
        navigate(from, { replace: true })
        
        return { success: true, user: result.user }
      }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch, navigate, location.state])
  
  // 회원가입 함수
  const register = useCallback(async (userData, options = {}) => {
    const { redirectTo = ROUTES.DASHBOARD } = options
    
    try {
      const result = await dispatch(registerUser(userData)).unwrap()
      
      if (result) {
        // 회원가입 성공 후 리다이렉트
        navigate(redirectTo, { replace: true })
        return { success: true, user: result.user }
      }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch, navigate])
  
  // 로그아웃 함수
  const logout = useCallback(async (options = {}) => {
    const { redirectTo = ROUTES.AUTH.LOGIN, showSuccessToast = true } = options
    
    try {
      await dispatch(logoutUser()).unwrap()
      
      // 🆕 유틸리티 함수 사용하여 토큰 제거
      removeAuthToken()
      
      // 로그아웃 후 리다이렉트
      navigate(redirectTo, { replace: true })
      return { success: true }
    } catch (error) {
      // 로그아웃은 대부분 성공으로 처리 (클라이언트 토큰 삭제는 항상 됨)
      removeAuthToken()
      navigate(redirectTo, { replace: true })
      return { success: true }
    }
  }, [dispatch, navigate])
  
  // 프로필 업데이트 함수
  const updateProfile = useCallback(async (profileData) => {
    try {
      const result = await dispatch(updateUserProfile(profileData)).unwrap()
      return { success: true, user: result.user }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])
  
  // 비밀번호 재설정 요청 함수 (기존)
  const requestPasswordReset = useCallback(async (email) => {
    try {
      await dispatch(forgotPassword(email)).unwrap()
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])
  
  // 🆕 비밀번호 재설정 함수 (새로 추가)
  const resetPassword = useCallback(async (resetData) => {
    const { token, email, password } = resetData
    
    try {
      const result = await dispatch(resetPasswordAction({
        token,
        email,
        password
      })).unwrap()
      
      return { success: true, message: result.message }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])
  
  // 🆕 비밀번호 변경 함수 (로그인된 사용자용)
  const changePassword = useCallback(async (passwordData) => {
    const { currentPassword, newPassword } = passwordData
    
    try {
      const result = await dispatch(updateUserProfile({
        currentPassword,
        newPassword,
        type: 'password_change'
      })).unwrap()
      
      return { success: true, user: result.user }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])
  
  // 🆕 이메일 인증 요청 함수
  const requestEmailVerification = useCallback(async () => {
    try {
      // 실제 구현에서는 별도의 액션을 만들어야 할 수 있음
      const result = await dispatch(updateUserProfile({
        type: 'request_email_verification'
      })).unwrap()
      
      return { success: true, message: result.message }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])
  
  // 🆕 이메일 인증 확인 함수
  const verifyEmail = useCallback(async (verificationToken) => {
    try {
      // 실제 구현에서는 별도의 액션을 만들어야 할 수 있음
      const result = await dispatch(updateUserProfile({
        type: 'verify_email',
        token: verificationToken
      })).unwrap()
      
      return { success: true, user: result.user }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])
  
  // 인증 상태 확인 함수
  const checkAuth = useCallback(async () => {
    try {
      const result = await dispatch(checkAuthStatus()).unwrap()
      return result
    } catch (error) {
      return { isAuthenticated: false, user: null }
    }
  }, [dispatch])
  
  // 강제 로그아웃 (토큰 만료 등)
  const forceSignOut = useCallback((redirectTo = ROUTES.AUTH.LOGIN) => {
    dispatch(forceLogout())
    removeAuthToken() // 🆕 토큰 제거
    navigate(redirectTo, { replace: true })
  }, [dispatch, navigate])
  
  // 에러 클리어 함수
  const clearAuthErrors = useCallback(() => {
    dispatch(clearErrors())
  }, [dispatch])
  
  // 성공 상태 리셋 함수
  const resetAuthSuccessStates = useCallback(() => {
    dispatch(resetSuccessStates())
  }, [dispatch])
  
  // 인증 상태 변경 이벤트 리스너
  useEffect(() => {
    const cleanup = authEvents.onAuthChange((event) => {
      switch (event.type) {
        case 'login':
          console.log('Auth event: User logged in', event.user)
          break
        case 'logout':
          console.log('Auth event: User logged out')
          break
        case 'profile-updated':
          console.log('Auth event: Profile updated', event.user)
          break
        case 'password-reset':
          console.log('Auth event: Password reset')
          break
        case 'email-verified':
          console.log('Auth event: Email verified', event.user)
          break
      }
    })
    
    return cleanup
  }, [])
  
  // 세션 만료 체크
  useEffect(() => {
    if (!isAuthenticated || !auth.sessionExpiry) return
    
    const checkSessionExpiry = () => {
      const now = new Date().getTime()
      const expiry = new Date(auth.sessionExpiry).getTime()
      
      if (now >= expiry) {
        forceSignOut(`${ROUTES.AUTH.LOGIN}?reason=session_expired`)
      }
    }
    
    // 1분마다 세션 만료 체크
    const interval = setInterval(checkSessionExpiry, 60000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated, auth.sessionExpiry, forceSignOut])
  
  // 유틸리티 함수들
  const hasRole = useCallback((role) => {
    return user?.roles?.includes(role) || false
  }, [user])
  
  const hasPermission = useCallback((permission) => {
    return user?.permissions?.includes(permission) || false
  }, [user])
  
  const isEmailVerified = useCallback(() => {
    return user?.emailVerified || false
  }, [user])
  
  const getUserDisplayName = useCallback(() => {
    return user?.profile?.name || user?.email?.split('@')[0] || '사용자'
  }, [user])
  
  const getUserAvatar = useCallback(() => {
    return user?.profile?.avatar || user?.profile?.profileImage || null
  }, [user])
  
  const getSubscriptionStatus = useCallback(() => {
    return user?.subscriptions?.filter(sub => sub.status === 'active') || []
  }, [user])
  
  const hasActiveSubscription = useCallback((productId) => {
    const activeSubscriptions = getSubscriptionStatus()
    return productId 
      ? activeSubscriptions.some(sub => sub.product === productId)
      : activeSubscriptions.length > 0
  }, [getSubscriptionStatus])
  
  // 🆕 계정 삭제 함수
  const deleteAccount = useCallback(async (confirmationData) => {
    const { password, confirmText } = confirmationData
    
    try {
      // 실제 구현에서는 별도의 액션 필요
      const result = await dispatch(updateUserProfile({
        type: 'delete_account',
        password,
        confirmText
      })).unwrap()
      
      // 계정 삭제 후 로그아웃 처리
      dispatch(forceLogout())
      removeAuthToken()
      navigate(`${ROUTES.AUTH.LOGIN}?reason=account_deleted`, { replace: true })
      
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch, navigate])
  
  // 로그인 필요 여부 체크
  const requireAuth = useCallback((redirectTo = ROUTES.AUTH.LOGIN) => {
    if (!isAuthenticated) {
      navigate(redirectTo, { 
        state: { from: location },
        replace: true 
      })
      return false
    }
    return true
  }, [isAuthenticated, navigate, location])
  
  // 🆕 편의 함수들 추가
  const getAuthHeaders = useCallback(() => {
    const token = getAuthToken() // 🆕 유틸리티 함수 사용
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [])
  
  const isLoading = auth.isLoading
  const error = auth.error
  const isLoginLoading = auth.isLoginLoading
  const isRegisterLoading = auth.isRegisterLoading
  const isProfileUpdateLoading = auth.isProfileUpdateLoading
  const registerError = auth.registerError
  const loginError = auth.loginError
  const profileUpdateError = auth.profileUpdateError
  
  return {
    // 상태
    ...auth,
    user,
    isAuthenticated,
    
    // 로딩 상태들 (개별적으로 노출)
    isLoading,
    error,
    isLoginLoading,
    isRegisterLoading,
    isProfileUpdateLoading,
    registerError,
    loginError,
    profileUpdateError,
    
    // 기본 액션 함수들
    login,
    register, 
    logout,
    updateProfile,
    checkAuth,
    forceSignOut,
    clearAuthErrors,
    resetAuthSuccessStates,
    
    // 🆕 비밀번호 관련 함수들
    requestPasswordReset,
    resetPassword,
    changePassword,
    
    // 🆕 이메일 인증 관련 함수들
    requestEmailVerification,
    verifyEmail,
    
    // 🆕 계정 관리 함수들
    deleteAccount,
    
    // 유틸리티 함수들
    hasRole,
    hasPermission,
    isEmailVerified,
    getUserDisplayName,
    getUserAvatar,
    getSubscriptionStatus,
    hasActiveSubscription,
    requireAuth,
    getAuthHeaders
  }
}

export default useAuth