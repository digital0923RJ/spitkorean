import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { 
  CheckCircle, 
  Gift,
  Star,
  Clock,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

import AuthLayout from '../components/layout/AuthLayout.jsx'
import RegisterForm from '@components/auth/RegisterForm'
import { T, TUI, TBlock } from '@/components/common/TranslatableText'
import { ROUTES } from '../shared/constants/routes.js'
import { useAuth } from '@hooks/useAuth'

/**
 * 회원가입 페이지 (AuthLayout과 ROUTES 활용)
 */
const Register = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [referralCode, setReferralCode] = useState('')
  const [promoCode, setPromoCode] = useState('')
  
  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true })
    }
  }, [isAuthenticated, navigate])
  
  // URL 파라미터에서 정보 확인
  useEffect(() => {
    const plan = searchParams.get('plan')
    const referral = searchParams.get('ref')
    const promo = searchParams.get('promo')
    const source = searchParams.get('source')
    
    // 추천 코드 설정
    if (referral) {
      setReferralCode(referral)
      toast.success('추천 코드가 적용되었습니다! 🎉')
    }
    
    // 프로모션 코드 설정
    if (promo) {
      setPromoCode(promo)
      toast.success('프로모션 코드가 적용되었습니다! 💎')
    }
    
    // 특정 플랜으로 유입된 경우
    if (plan) {
      toast.info(`${plan} 코스로 시작하시는군요! 가입 후 바로 이용 가능합니다.`)
    }
    
    // 유입 소스별 메시지
    if (source === 'landing') {
      toast.info('환영합니다! 14일 무료 체험을 시작해보세요.')
    } else if (source === 'blog') {
      toast.info('블로그에서 오셨군요! 특별 혜택을 준비했습니다.')
    }
  }, [searchParams])

  // 회원가입 성공 핸들러
  const handleRegisterSuccess = (userData) => {
    console.log('Registration successful:', userData)
    
    // 성공 메시지
    toast.success(`환영합니다, ${userData.profile?.name || userData.email}님! 🎉`)
    
    // URL 파라미터에서 플랜 정보 확인
    const targetPlan = searchParams.get('plan')
    const hasFreeTrial = searchParams.get('trial') === 'true'
    
    if (targetPlan && hasFreeTrial) {
      // 특정 플랜의 무료 체험으로 시작
      navigate(`${ROUTES.SUBSCRIPTION.PLANS}?plan=${targetPlan}&trial=true`, { 
        replace: true,
        state: { 
          welcomeMessage: '가입을 축하합니다! 무료 체험을 시작해보세요.',
          newUser: true 
        }
      })
    } else if (targetPlan) {
      // 특정 플랜 구독 페이지로
      navigate(`${ROUTES.SUBSCRIPTION.CHECKOUT}?plan=${targetPlan}`, { 
        replace: true,
        state: { 
          welcomeMessage: '가입을 축하합니다! 선택하신 플랜을 구독해보세요.',
          newUser: true 
        }
      })
    } else {
      // 일반적인 경우 - 대시보드로 (온보딩 포함)
      navigate(ROUTES.DASHBOARD, { 
        replace: true,
        state: { 
          welcomeMessage: '가입을 축하합니다! 먼저 레벨 테스트를 받아보세요.',
          newUser: true,
          showOnboarding: true
        }
      })
    }
  }

  // 회원가입 에러 핸들러
  const handleRegisterError = (error) => {
    console.error('Registration error:', error)
    
    // 에러 유형에 따른 메시지
    if (error.code === 'EMAIL_ALREADY_EXISTS') {
      toast.error('이미 등록된 이메일입니다. 로그인을 시도해보세요.')
    } else if (error.code === 'WEAK_PASSWORD') {
      toast.error('비밀번호가 너무 약합니다. 더 강력한 비밀번호를 설정해주세요.')
    } else if (error.code === 'INVALID_EMAIL') {
      toast.error('유효하지 않은 이메일 주소입니다.')
    } else if (error.code === 'TERMS_NOT_ACCEPTED') {
      toast.error('이용약관 및 개인정보처리방침에 동의해주세요.')
    } else {
      toast.error(error.message || '회원가입 중 오류가 발생했습니다.')
    }
  }

  // 로그인 페이지로 이동
  const handleLoginClick = () => {
    // 현재 URL 파라미터를 로그인 페이지에도 전달
    const currentParams = new URLSearchParams(searchParams)
    const loginParams = new URLSearchParams()
    
    // 중요한 파라미터들만 전달
    if (currentParams.get('plan')) loginParams.set('plan', currentParams.get('plan'))
    if (currentParams.get('ref')) loginParams.set('ref', currentParams.get('ref'))
    if (currentParams.get('promo')) loginParams.set('promo', currentParams.get('promo'))
    
    const paramsString = loginParams.toString()
    const loginPath = paramsString ? `${ROUTES.AUTH.LOGIN}?${paramsString}` : ROUTES.AUTH.LOGIN
    
    navigate(loginPath, {
      state: location.state,
      replace: false
    })
  }

  return (
    <AuthLayout
      variant="register"
      showBranding={true}
      showFeatures={true}
      showStats={true}
      showTestimonials={true}
      className="register-page"
    >
      {/* 회원가입 폼 컨테이너 */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 lg:p-10">
        
        {/* 폼 헤더 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <T>무료로 시작하기</T>
          </h2>
          <TBlock 
            as="p" 
            className="text-gray-600"
            context="ui"
          >
            AI와 함께하는 한국어 학습의 새로운 경험을 시작해보세요
          </TBlock>
        </div>

        {/* 특별 혜택 안내 */}
        {(referralCode || promoCode || searchParams.get('plan')) && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                <T>특별 혜택이 적용됩니다!</T>
              </span>
            </div>
            <div className="space-y-1 text-sm text-green-700">
              {referralCode && (
                <div>• <T>추천 코드</T>: {referralCode} - <T>첫 달 50% 할인</T></div>
              )}
              {promoCode && (
                <div>• <T>프로모션 코드</T>: {promoCode} - <T>추가 혜택 적용</T></div>
              )}
              {searchParams.get('plan') && (
                <div>• <T>선택된 플랜</T>: {searchParams.get('plan')} - <T>14일 무료 체험</T></div>
              )}
            </div>
          </div>
        )}

        {/* 빠른 시작 옵션 */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <span className="text-sm text-gray-500">
              <TUI>빠른 시작</TUI>
            </span>
          </div>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <div className="w-5 h-5 mr-3 bg-red-500 rounded"></div>
              <TUI>Google로 계속하기</TUI>
            </button>
            
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <div className="w-5 h-5 mr-3 bg-blue-600 rounded"></div>
              <TUI>Facebook으로 계속하기</TUI>
            </button>
          </div>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                <TUI>또는 이메일로 가입</TUI>
              </span>
            </div>
          </div>
        </div>

        {/* 회원가입 폼 */}
        <RegisterForm 
          onSuccess={handleRegisterSuccess}
          onError={handleRegisterError}
          showTitle={false}
          showLoginLink={false}
          referralCode={referralCode}
          promoCode={promoCode}
          defaultPlan={searchParams.get('plan')}
          className="mb-6"
        />

        {/* 로그인 링크 */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            <T>이미 계정이 있으신가요?</T>{' '}
            <button
              onClick={handleLoginClick}
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              <TUI>로그인하기</TUI>
            </button>
          </p>
        </div>

        {/* 보장 및 혜택 안내 */}
        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">
                  <T>14일 무료 체험</T>
                </div>
                <div className="text-sm text-blue-700">
                  <T>모든 기능을 무료로 체험해보세요. 언제든지 취소 가능합니다.</T>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">
                  <T>30일 환불 보장</T>
                </div>
                <div className="text-sm text-green-700">
                  <T>만족하지 못하시면 30일 내 100% 환불해드립니다.</T>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 추가 링크들 */}
        <div className="pt-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:justify-between items-center space-y-2 sm:space-y-0 text-sm">
            <button
              onClick={() => navigate(ROUTES.SUPPORT.FAQ)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <TUI>자주 묻는 질문</TUI>
            </button>
            
            <button
              onClick={() => navigate(ROUTES.SUBSCRIPTION.PLANS)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <TUI>요금제 비교</TUI>
            </button>
            
            <button
              onClick={() => navigate(ROUTES.SUPPORT.CONTACT)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <TUI>고객지원</TUI>
            </button>
          </div>
        </div>

        {/* 학습자 후기 미니 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex -space-x-2">
              {['S', 'M', 'K', 'J'].map((initial, index) => (
                <div key={index} className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                  {initial}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm font-medium text-gray-900">4.9/5</span>
              </div>
              <div className="text-sm text-gray-600">
                <T>10,000명 이상의 학습자가 선택한 SpitKorean</T>
              </div>
            </div>
          </div>
        </div>

        {/* 보안 정보 */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500 mb-2">
            <T>🔒 안전한 가입</T>
          </div>
          <div className="flex justify-center items-center space-x-4 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span><T>SSL 암호화</T></span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span><T>GDPR 준수</T></span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span><T>개인정보 보호</T></span>
            </div>
          </div>
        </div>

        {/* 혜택 요약 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900 mb-2">
              <T>지금 가입하면 받는 혜택</T>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span><T>14일 무료 체험</T></span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span><T>개인 맞춤 학습 계획</T></span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span><T>AI 튜터 무제한 이용</T></span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span><T>언제든지 취소 가능</T></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default Register