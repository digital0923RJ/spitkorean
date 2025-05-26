import React, { useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

import AuthLayout from '../components/layout/AuthLayout.jsx'
import LoginForm from '@components/auth/LoginForm'
import TranslatableText, { T, TUI, TBlock } from '@/components/common/TranslatableText'
import { ROUTES } from '../shared/constants/routes.js'
import { useAuth } from '@hooks/useAuth'

/**
 * 로그인 페이지 (AuthLayout과 ROUTES 활용)
 */
const Login = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  
  // 로그인 후 리다이렉트할 경로 확인
  const redirectTo = location.state?.from?.pathname || ROUTES.DASHBOARD
  
  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])
  
  // URL 파라미터에서 메시지 확인
  useEffect(() => {
    const reason = searchParams.get('reason')
    const message = searchParams.get('message')
    const redirect = searchParams.get('redirect')
    
    // 리다이렉트 경로가 URL 파라미터에 있는 경우 처리
    if (redirect && ROUTES[redirect.toUpperCase()]) {
      // 유효한 라우트인 경우에만 설정
    }
    
    // 에러/알림 메시지 처리
    if (reason === 'session_expired') {
      toast.error('세션이 만료되었습니다. 다시 로그인해주세요.')
    } else if (reason === 'subscription_required') {
      toast.error('구독이 필요한 서비스입니다. 로그인 후 구독해주세요.')
    } else if (reason === 'unauthorized') {
      toast.error('로그인이 필요합니다.')
    } else if (reason === 'subscription_expired') {
      toast.warning('구독이 만료되었습니다. 갱신해주세요.')
    } else if (message) {
      const decodedMessage = decodeURIComponent(message)
      toast.info(decodedMessage)
    }
  }, [searchParams])

  // 로그인 성공 핸들러
  const handleLoginSuccess = (userData) => {
    console.log('Login successful:', userData)
    
    // 성공 메시지
    toast.success(`환영합니다, ${userData.profile?.name || userData.email}님!`)
    
    // 사용자의 구독 상태에 따른 리다이렉트 결정
    const hasSubscriptions = userData.subscriptions && userData.subscriptions.length > 0
    
    if (!hasSubscriptions && location.state?.from?.pathname?.includes('/subscription')) {
      // 구독이 없고 구독 페이지에서 왔으면 구독 페이지로
      navigate(ROUTES.SUBSCRIPTION.PLANS, { replace: true })
    } else if (!hasSubscriptions) {
      // 구독이 없으면 대시보드로 (거기서 구독 안내)
      navigate(ROUTES.DASHBOARD, { replace: true })
    } else {
      // 원래 가려던 페이지나 대시보드로
      navigate(redirectTo, { replace: true })
    }
  }

  // 로그인 에러 핸들러
  const handleLoginError = (error) => {
    console.error('Login error:', error)
    
    // 에러 유형에 따른 메시지
    if (error.code === 'INVALID_CREDENTIALS') {
      toast.error('이메일 또는 비밀번호가 올바르지 않습니다.')
    } else if (error.code === 'EMAIL_NOT_VERIFIED') {
      toast.error('이메일 인증이 필요합니다. 이메일을 확인해주세요.')
    } else if (error.code === 'ACCOUNT_LOCKED') {
      toast.error('계정이 잠겼습니다. 고객지원에 문의해주세요.')
    } else {
      toast.error(error.message || '로그인 중 오류가 발생했습니다.')
    }
  }

  // 회원가입 페이지로 이동
  const handleSignupClick = () => {
    // 현재 리다이렉트 정보를 회원가입 페이지에도 전달
    navigate(ROUTES.AUTH.REGISTER, {
      state: location.state,
      replace: false
    })
  }

  // 비밀번호 찾기 페이지로 이동
  const handleForgotPasswordClick = () => {
    navigate(ROUTES.AUTH.FORGOT_PASSWORD)
  }

  return (
    <AuthLayout
      variant="login"
      showBranding={true}
      showFeatures={true}
      showStats={true}
      showTestimonials={false}
      className="login-page"
    >
      {/* 로그인 폼 컨테이너 */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 lg:p-10">
        
        {/* 폼 헤더 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <T>로그인</T>
          </h2>
          <TBlock 
            as="p" 
            className="text-gray-600"
            context="ui"
          >
            SpitKorean 계정으로 로그인하여 한국어 학습을 계속하세요
          </TBlock>
        </div>

        {/* 특별 알림 (리다이렉트 정보가 있는 경우) */}
        {location.state?.from && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <div className="text-sm text-blue-800">
                <T>로그인 후 요청하신 페이지로 이동합니다</T>
              </div>
            </div>
          </div>
        )}

        {/* 로그인 폼 */}
        <LoginForm 
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
          showTitle={false}
          showSignupLink={false}
          showForgotPasswordLink={true}
          onForgotPasswordClick={handleForgotPasswordClick}
          className="mb-6"
        />

        {/* 구분선 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              <TUI>또는</TUI>
            </span>
          </div>
        </div>

        {/* 소셜 로그인 (예시) */}
        <div className="space-y-3 mb-6">
          <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <div className="w-5 h-5 mr-3 bg-red-500 rounded"></div>
            <TUI>Google로 계속하기</TUI>
          </button>
          
          <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <div className="w-5 h-5 mr-3 bg-blue-600 rounded"></div>
            <TUI>Facebook으로 계속하기</TUI>
          </button>
        </div>

        {/* 회원가입 링크 */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            <T>계정이 없으신가요?</T>{' '}
            <button
              onClick={handleSignupClick}
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              <TUI>무료로 회원가입</TUI>
            </button>
          </p>
        </div>

        {/* 추가 링크들 */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:justify-between items-center space-y-2 sm:space-y-0 text-sm">
            <button
              onClick={() => navigate(ROUTES.SUPPORT.FAQ)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <TUI>자주 묻는 질문</TUI>
            </button>
            
            <button
              onClick={() => navigate(ROUTES.SUPPORT.CONTACT)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <TUI>고객지원</TUI>
            </button>
            
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <TUI>서비스 소개</TUI>
            </button>
          </div>
        </div>

        {/* 보안 안내 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-2">
              <T>🔒 안전한 로그인</T>
            </div>
            <div className="text-xs text-gray-400 leading-relaxed">
              <T>
                모든 데이터는 SSL/TLS 암호화로 보호됩니다. 
                개인정보는 업계 표준에 따라 안전하게 관리됩니다.
              </T>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default Login