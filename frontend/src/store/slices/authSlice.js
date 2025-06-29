import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI, authEvents } from '@/api/auth'
import { setAuthToken, removeAuthToken, getAuthToken } from '@/utils/auth'
import { tokenUtils, sessionUtils, validateAuthState } from '@/utils/auth'
import toast from 'react-hot-toast'

// 비동기 액션들
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      
      if (response.status === 'success') {
        // 토큰 저장
        setAuthToken(response.data.token)
        
        // 세션 타임아웃 설정 (24시간)
        sessionUtils.setSessionTimeout(24 * 60)
        
        // 이벤트 발행
        authEvents.emitLogin(response.data.user)
        
        toast.success(`안녕하세요, ${response.data.user.profile?.name || '사용자'}님!`)
        return response.data
      }
      
      return rejectWithValue(response.message || '로그인에 실패했습니다.')
    } catch (error) {
      return rejectWithValue(error.message || '로그인 중 오류가 발생했습니다.')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData)

      // Log the actual API response (for debugging)
      console.log('API Response:', response)

      // Consider it successful if the status is "success" or the message includes "완료" (completed)
      const isSuccess =
        response?.status === 'success' ||
        response?.message?.includes('완료')

      if (isSuccess) {
        // Save the auth token
        setAuthToken(response.data.token)

        // Set session timeout (24 hours)
        sessionUtils.setSessionTimeout(24 * 60)

        // Emit login event
        authEvents.emitLogin(response.data.user)

        // Show success toast (in Korean)
        toast.success(
          '회원가입이 완료되었습니다! SpitKorean에 오신 것을 환영합니다! 🎉'
        )

        return response.data
      }

      // If not successful, treat as an error
      return rejectWithValue(
        response?.message || 'Registration failed.'
      )
    } catch (error) {
      return rejectWithValue(
        error?.message || 'An error occurred during registration.'
      )
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // 서버에 로그아웃 요청
      await authAPI.logout()
      
      // 로컬 토큰 삭제
      removeAuthToken()
      sessionUtils.clearSession()
      
      // 이벤트 발행
      authEvents.emitLogout()
      
      toast.success('안전하게 로그아웃되었습니다.')
      return true
    } catch (error) {
      console.warn('Logout error:', error)
      
      // 서버 로그아웃 실패해도 클라이언트는 정리
      removeAuthToken()
      sessionUtils.clearSession()
      authEvents.emitLogout()
      
      return true
    }
  }
)

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      // 로컬 토큰 확인
      const token = getAuthToken()
      
      if (!token || !tokenUtils.isTokenValid(token)) {
        // 토큰이 없거나 유효하지 않으면 정리
        removeAuthToken()
        sessionUtils.clearSession()
        
        return {
          isAuthenticated: false,
          user: null
        }
      }
      
      // 서버에서 사용자 정보 확인
      const response = await authAPI.getCurrentUser()
      
      if (response.status === 'success') {
        // 인증 상태 검증
        const authState = validateAuthState(response.data, token)
        
        if (!authState.isAuthenticated) {
          removeAuthToken()
          sessionUtils.clearSession()
          
          return {
            isAuthenticated: false,
            user: null
          }
        }
        
        return {
          isAuthenticated: true,
          user: response.data,
          authState
        }
      }
      
      return rejectWithValue('인증 상태 확인 실패')
    } catch (error) {
      // 인증 실패 시 토큰 정리
      removeAuthToken()
      sessionUtils.clearSession()
      
      return rejectWithValue(error.message || '인증 상태 확인 실패')
    }
  }
)



export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await authAPI.refreshToken()
      
      if (response.status === 'success') {
        // 새 토큰 저장
        setAuthToken(response.data.token)
        
        // 세션 타임아웃 갱신
        sessionUtils.setSessionTimeout(24 * 60)
        
        return {
          token: response.data.token,
          user: response.data.user
        }
      }
      
      return rejectWithValue('토큰 갱신 실패')
    } catch (error) {
      // 토큰 갱신 실패 시 로그아웃 처리
      removeAuthToken()
      sessionUtils.clearSession()
      
      return rejectWithValue(error.message || '토큰 갱신 실패')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      
      if (response.status === 'success') {
        authEvents.emitProfileUpdate(response.data.user)
        toast.success('프로필이 성공적으로 업데이트되었습니다.')
        return response.data
      }
      
      return rejectWithValue(response.message || '프로필 업데이트에 실패했습니다.')
    } catch (error) {
      return rejectWithValue(error.message || '프로필 업데이트 중 오류가 발생했습니다.')
    }
  }
)

export const updateUserSubscriptions = createAsyncThunk(
  'auth/updateUserSubscriptions',
  async (subscriptions, { getState }) => {
    const { auth } = getState()
    
    if (!auth.user) return null
    
    // 사용자 객체 업데이트
    const updatedUser = {
      ...auth.user,
      subscriptions
    }
    
    // 구독 업데이트 이벤트 발행
    authEvents.emitSubscriptionUpdate(updatedUser)
    
    return updatedUser
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(email)
      
      if (response.status === 'success') {
        toast.success('비밀번호 재설정 이메일이 발송되었습니다.')
        return response.data
      }
      
      return rejectWithValue(response.message || '비밀번호 재설정 요청에 실패했습니다.')
    } catch (error) {
      return rejectWithValue(error.message || '비밀번호 재설정 요청 중 오류가 발생했습니다.')
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(token, newPassword)
      
      if (response.status === 'success') {
        toast.success('비밀번호가 성공적으로 재설정되었습니다.')
        return response.data
      }
      
      return rejectWithValue(response.message || '비밀번호 재설정에 실패했습니다.')
    } catch (error) {
      return rejectWithValue(error.message || '비밀번호 재설정 중 오류가 발생했습니다.')
    }
  }
)

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (verificationToken, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyEmail(verificationToken)
      
      if (response.status === 'success') {
        toast.success('이메일이 성공적으로 인증되었습니다!')
        return response.data
      }
      
      return rejectWithValue(response.message || '이메일 인증에 실패했습니다.')
    } catch (error) {
      return rejectWithValue(error.message || '이메일 인증 중 오류가 발생했습니다.')
    }
  }
)

// 초기 상태
const initialState = {
  // 사용자 정보
  user: null,
  isAuthenticated: false,
  
  // 로딩 상태들
  isLoading: false,
  isLoginLoading: false,
  isRegisterLoading: false,
  isLogoutLoading: false,
  isProfileUpdateLoading: false,
  isForgotPasswordLoading: false,
  isResetPasswordLoading: false,
  isVerifyEmailLoading: false,
  isRefreshTokenLoading: false,
  
  // 에러 상태들
  error: null,
  loginError: null,
  registerError: null,
  profileUpdateError: null,
  forgotPasswordError: null,
  resetPasswordError: null,
  verifyEmailError: null,
  refreshTokenError: null,
  
  // 성공 상태들
  forgotPasswordSuccess: false,
  resetPasswordSuccess: false,
  verifyEmailSuccess: false,
  
  // 세션 관련
  lastLoginTime: null,
  sessionExpiry: null,
  tokenExpiresAt: null,
  
  // 기타
  rememberMe: false,
  loginAttempts: 0,
  isFirstTimeUser: false,
}

// Redux Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 에러 클리어
    clearErrors: (state) => {
      state.error = null
      state.loginError = null
      state.registerError = null
      state.profileUpdateError = null
      state.forgotPasswordError = null
      state.resetPasswordError = null
      state.verifyEmailError = null
      state.refreshTokenError = null
    },
    
    // 특정 에러 클리어
    clearError: (state, action) => {
      const errorType = action.payload
      if (state[errorType] !== undefined) {
        state[errorType] = null
      }
    },
    
    // 성공 상태 리셋
    resetSuccessStates: (state) => {
      state.forgotPasswordSuccess = false
      state.resetPasswordSuccess = false
      state.verifyEmailSuccess = false
    },
    
    // 수동 로그아웃 (토큰 만료, 보안 이슈 등)
    forceLogout: (state, action) => {
      const reason = action.payload?.reason || 'unknown'
      
      state.user = null
      state.isAuthenticated = false
      state.lastLoginTime = null
      state.sessionExpiry = null
      state.tokenExpiresAt = null
      state.error = null
      
      // 토큰 정리
      removeAuthToken()
      sessionUtils.clearSession()
      
      // 이벤트 발행
      authEvents.emitLogout()
      
      // 사용자에게 알림
      if (reason === 'token_expired') {
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.')
      } else if (reason === 'security') {
        toast.error('보안상의 이유로 로그아웃되었습니다.')
      }
    },
    
    // 사용자 정보 업데이트 (실시간)
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    
    // 구독 정보 업데이트
    updateSubscriptions: (state, action) => {
      if (state.user) {
        state.user.subscriptions = action.payload
      }
    },
    
    // 세션 만료 시간 설정
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload
    },
    
    // 토큰 만료 시간 설정
    setTokenExpiry: (state, action) => {
      state.tokenExpiresAt = action.payload
    },
    
    // Remember Me 설정
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload
    },
    
    // 로그인 시도 횟수 증가
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1
    },
    
    // 로그인 시도 횟수 리셋
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0
    },
    
    // 첫 사용자 여부 설정
    setFirstTimeUser: (state, action) => {
      state.isFirstTimeUser = action.payload
    }
  },
  
  extraReducers: (builder) => {
    // 로그인
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoginLoading = true
        state.loginError = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoginLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.lastLoginTime = new Date().toISOString()
        state.loginError = null
        state.loginAttempts = 0
        
        // 토큰 만료 시간 설정
        const token = getAuthToken()
        if (token) {
          const expiresIn = tokenUtils.getTokenExpiresIn(token)
          state.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoginLoading = false
        state.loginError = action.payload
        state.isAuthenticated = false
        state.user = null
        state.loginAttempts += 1
      })
    
    // 회원가입
    builder
      .addCase(registerUser.pending, (state) => {
        state.isRegisterLoading = true
        state.registerError = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isRegisterLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.lastLoginTime = new Date().toISOString()
        state.registerError = null
        state.isFirstTimeUser = true
        
        // 토큰 만료 시간 설정
        const token = getAuthToken()
        if (token) {
          const expiresIn = tokenUtils.getTokenExpiresIn(token)
          state.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isRegisterLoading = false
        state.registerError = action.payload
        state.isAuthenticated = false
        state.user = null
      })
    
    // 로그아웃
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLogoutLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLogoutLoading = false
        state.isAuthenticated = false
        state.user = null
        state.lastLoginTime = null
        state.sessionExpiry = null
        state.tokenExpiresAt = null
        state.error = null
        state.isFirstTimeUser = false
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLogoutLoading = false
        // 로그아웃 실패해도 클라이언트 상태는 리셋
        state.isAuthenticated = false
        state.user = null
        state.lastLoginTime = null
        state.sessionExpiry = null
        state.tokenExpiresAt = null
        state.isFirstTimeUser = false
      })
    
    // 인증 상태 확인
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = action.payload.isAuthenticated
        state.user = action.payload.user
        state.error = null
        
        if (action.payload.isAuthenticated && action.payload.user) {
          // 토큰 만료 시간 설정
          const token = getAuthToken()
          if (token) {
            const expiresIn = tokenUtils.getTokenExpiresIn(token)
            state.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
          }
        }
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload
        state.tokenExpiresAt = null
      })
    
    // 토큰 갱신
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isRefreshTokenLoading = true
        state.refreshTokenError = null
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isRefreshTokenLoading = false
        state.user = action.payload.user
        state.refreshTokenError = null
        
        // 새 토큰 만료 시간 설정
        const expiresIn = tokenUtils.getTokenExpiresIn(action.payload.token)
        state.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isRefreshTokenLoading = false
        state.refreshTokenError = action.payload
        // 토큰 갱신 실패 시 로그아웃 처리
        state.isAuthenticated = false
        state.user = null
        state.tokenExpiresAt = null
      })
    
    // 프로필 업데이트
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isProfileUpdateLoading = true
        state.profileUpdateError = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isProfileUpdateLoading = false
        state.user = action.payload.user
        state.profileUpdateError = null
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isProfileUpdateLoading = false
        state.profileUpdateError = action.payload
      })
    
    // 구독 업데이트
    builder
      .addCase(updateUserSubscriptions.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload
        }
      })
    
    // 비밀번호 찾기
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isForgotPasswordLoading = true
        state.forgotPasswordError = null
        state.forgotPasswordSuccess = false
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isForgotPasswordLoading = false
        state.forgotPasswordSuccess = true
        state.forgotPasswordError = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isForgotPasswordLoading = false
        state.forgotPasswordError = action.payload
        state.forgotPasswordSuccess = false
      })
    
    // 비밀번호 재설정
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isResetPasswordLoading = true
        state.resetPasswordError = null
        state.resetPasswordSuccess = false
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isResetPasswordLoading = false
        state.resetPasswordSuccess = true
        state.resetPasswordError = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isResetPasswordLoading = false
        state.resetPasswordError = action.payload
        state.resetPasswordSuccess = false
      })
    
    // 이메일 인증
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isVerifyEmailLoading = true
        state.verifyEmailError = null
        state.verifyEmailSuccess = false
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isVerifyEmailLoading = false
        state.verifyEmailSuccess = true
        state.verifyEmailError = null
        
        // 사용자 이메일 인증 상태 업데이트
        if (state.user) {
          state.user.emailVerified = true
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isVerifyEmailLoading = false
        state.verifyEmailError = action.payload
        state.verifyEmailSuccess = false
      })
  },
})

// 액션 내보내기
export const {
  clearErrors,
  clearError,
  resetSuccessStates,
  forceLogout,
  updateUser,
  updateSubscriptions,
  setSessionExpiry,
  setTokenExpiry,
  setRememberMe,
  incrementLoginAttempts,
  resetLoginAttempts,
  setFirstTimeUser
} = authSlice.actions

// 셀렉터들
export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsLoading = (state) => state.auth.isLoading
export const selectAuthError = (state) => state.auth.error
export const selectLoginError = (state) => state.auth.loginError
export const selectRegisterError = (state) => state.auth.registerError
export const selectIsLoginLoading = (state) => state.auth.isLoginLoading
export const selectIsRegisterLoading = (state) => state.auth.isRegisterLoading
export const selectIsLogoutLoading = (state) => state.auth.isLogoutLoading
export const selectIsProfileUpdateLoading = (state) => state.auth.isProfileUpdateLoading
export const selectTokenExpiresAt = (state) => state.auth.tokenExpiresAt
export const selectLoginAttempts = (state) => state.auth.loginAttempts
export const selectIsFirstTimeUser = (state) => state.auth.isFirstTimeUser

// 복합 셀렉터들
export const selectUserDisplayName = (state) => {
  const user = state.auth.user
  return user?.profile?.name || user?.name || user?.email?.split('@')[0] || '사용자'
}

export const selectUserSubscriptions = (state) => {
  return state.auth.user?.subscriptions || []
}

export const selectActiveSubscriptions = (state) => {
  const subscriptions = state.auth.user?.subscriptions || []
  return subscriptions.filter(sub => 
    sub.status === 'active' && 
    (!sub.endDate || new Date(sub.endDate) > new Date())
  )
}

export const selectHasActiveSubscription = (productId) => (state) => {
  const activeSubscriptions = selectActiveSubscriptions(state)
  return activeSubscriptions.some(sub => sub.product === productId)
}

export const selectUserKoreanLevel = (state) => {
  return state.auth.user?.profile?.koreanLevel || 'beginner'
}

export const selectUserNativeLanguage = (state) => {
  return state.auth.user?.profile?.nativeLanguage || 'en'
}

export const selectIsTokenExpiringSoon = (state) => {
  const tokenExpiresAt = state.auth.tokenExpiresAt
  if (!tokenExpiresAt) return false
  
  const expiryTime = new Date(tokenExpiresAt)
  const now = new Date()
  const fiveMinutes = 5 * 60 * 1000 // 5분을 밀리초로
  
  return (expiryTime - now) < fiveMinutes && (expiryTime - now) > 0
}

// 리듀서 내보내기
export default authSlice.reducer