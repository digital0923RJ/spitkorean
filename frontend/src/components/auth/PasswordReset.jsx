import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Lock } from 'lucide-react'

// 컴포넌트
import Input from '../common/Input.jsx'
import Button from '../common/Buttom.jsx'
import TranslatableText, { T } from '../common/TranslatableText'

// 유효성 검사
import { validateEmail, validatePassword, validators } from '../../utils/validation.js'

// 훅
import { useAuth } from '../../hooks/useAuth'

// 비밀번호 재설정 요청 스키마
const requestResetSchema = yup.object({
  email: yup
    .string()
    .test('email-validation', '올바른 이메일 형식을 입력해주세요', (value) => {
      return validateEmail(value);
    })
    .required('이메일을 입력해주세요')
})

// 비밀번호 재설정 스키마
const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .test('password-validation', '비밀번호는 대문자, 소문자, 숫자를 포함한 8자 이상이어야 합니다', (value) => {
      const result = validatePassword(value);
      return result.isValid;
    })
    .required('새 비밀번호를 입력해주세요'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다')
    .required('비밀번호 확인을 입력해주세요')
})

/**
 * 비밀번호 재설정 컴포넌트
 */
const PasswordReset = ({ 
  onSuccess,
  showBackLink = true,
  className = ''
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // URL에서 토큰 가져오기
  const resetToken = searchParams.get('token')
  const tokenEmail = searchParams.get('email')
  
  // 상태 관리
  const [step, setStep] = useState(resetToken ? 'reset' : 'request') // 'request' | 'sent' | 'reset' | 'success'
  const [emailSent, setEmailSent] = useState(false)
  const [resetEmail, setResetEmail] = useState(tokenEmail || '')
  
  // 인증 상태 (실제 프로젝트에서는 useAuth 훅 사용)
  const { 
    requestPasswordReset, 
    resetPassword, 
    isLoading, 
    error, 
    clearAuthErrors 
  } = useAuth()

  // 현재 스키마 선택
  const currentSchema = step === 'reset' ? resetPasswordSchema : requestResetSchema

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(currentSchema),
    mode: 'onChange',
    defaultValues: {
      email: resetEmail,
      password: '',
      confirmPassword: ''
    }
  })

  // 비밀번호 감시 (강도 체크용)
  const watchedPassword = watch('password')

  // 컴포넌트 마운트 시 에러 클리어
  useEffect(() => {
    clearAuthErrors()
  }, [clearAuthErrors])

  // 이메일이 변경되면 폼 업데이트
  useEffect(() => {
    if (tokenEmail) {
      setResetEmail(tokenEmail)
      setValue('email', tokenEmail)
    }
  }, [tokenEmail, setValue])

  // 비밀번호 재설정 요청 핸들러
  const handleRequestReset = async (data) => {
    try {
      const result = await requestPasswordReset(data.email)
      
      if (result.success) {
        setResetEmail(data.email)
        setEmailSent(true)
        setStep('sent')
      }
    } catch (error) {
      console.error('Password reset request error:', error)
    }
  }

  // 비밀번호 재설정 핸들러
  const handleResetPassword = async (data) => {
    try {
      const result = await resetPassword({
        token: resetToken,
        email: resetEmail || tokenEmail,
        password: data.password
      })
      
      if (result.success) {
        setStep('success')
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login')
          onSuccess?.(result)
        }, 3000)
      }
    } catch (error) {
      console.error('Password reset error:', error)
    }
  }

  // 폼 제출 핸들러
  const onSubmit = step === 'reset' ? handleResetPassword : handleRequestReset

  // 이메일 재전송
  const handleResendEmail = async () => {
    if (resetEmail) {
      await handleRequestReset({ email: resetEmail })
    }
  }

  // 비밀번호 강도 체크
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: 'gray' }
    
    let score = 0
    if (password.length >= 8) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^a-zA-Z\d]/.test(password)) score += 1
    
    const levels = [
      { score: 0, text: '매우 약함', color: 'red' },
      { score: 1, text: '약함', color: 'red' },
      { score: 2, text: '보통', color: 'yellow' },
      { score: 3, text: '좋음', color: 'blue' },
      { score: 4, text: '강함', color: 'green' },
      { score: 5, text: '매우 강함', color: 'green' }
    ]
    
    return levels[Math.min(score, 5)]
  }

  const passwordStrength = getPasswordStrength(watchedPassword)

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* 뒤로 가기 링크 */}
      {showBackLink && step !== 'success' && (
        <div className="mb-6">
          <Link 
            to="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <T>로그인으로 돌아가기</T>
          </Link>
        </div>
      )}

      {/* 비밀번호 재설정 요청 단계 */}
      {step === 'request' && (
        <div>
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <T>비밀번호 재설정</T>
            </h2>
            <p className="text-gray-600">
              <T>가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</T>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label={<T>이메일 주소</T>}
              type="email"
              placeholder="이메일을 입력하세요"
              leftIcon={<Mail />}
              error={errors.email?.message && <T>{errors.email.message}</T>}
              {...register('email')}
              autoFocus
              autoComplete="email"
            />

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                <p className="text-error-600 text-sm text-center">
                  <T>{error}</T>
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={!isValid}
              textKey={isLoading ? '전송 중...' : '재설정 링크 보내기'}
            />
          </form>
        </div>
      )}

      {/* 이메일 전송 완료 단계 */}
      {step === 'sent' && (
        <div className="text-center">
          <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <T>이메일을 확인하세요</T>
          </h2>
          <p className="text-gray-600 mb-6">
            <T>{resetEmail}로 비밀번호 재설정 링크를 보내드렸습니다. 이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.</T>
          </p>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              <T>이메일이 오지 않았나요?</T>
            </p>
            <Button
              variant="outline"
              size="md"
              onClick={handleResendEmail}
              loading={isLoading}
              textKey={isLoading ? '재전송 중...' : '이메일 다시 보내기'}
            />
          </div>
        </div>
      )}

      {/* 비밀번호 재설정 단계 */}
      {step === 'reset' && (
        <div>
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <T>새 비밀번호 설정</T>
            </h2>
            <p className="text-gray-600">
              <T>새로운 비밀번호를 입력하여 계정을 보호하세요.</T>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                label={<T>새 비밀번호</T>}
                type="password"
                placeholder="새 비밀번호를 입력하세요"
                leftIcon={<Lock />}
                error={errors.password?.message && <T>{errors.password.message}</T>}
                {...register('password')}
                autoFocus
                autoComplete="new-password"
              />
              {watchedPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all bg-${passwordStrength.color}-500`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm text-${passwordStrength.color}-600`}>
                      <T>{passwordStrength.text}</T>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Input
              label={<T>비밀번호 확인</T>}
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              leftIcon={<Lock />}
              error={errors.confirmPassword?.message && <T>{errors.confirmPassword.message}</T>}
              {...register('confirmPassword')}
              autoComplete="new-password"
            />

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                <p className="text-error-600 text-sm text-center">
                  <T>{error}</T>
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={!isValid}
              textKey={isLoading ? '재설정 중...' : '비밀번호 재설정 완료'}
            />
          </form>
        </div>
      )}

      {/* 재설정 완료 단계 */}
      {step === 'success' && (
        <div className="text-center">
          <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <T>비밀번호 재설정 완료!</T>
          </h2>
          <p className="text-gray-600 mb-6">
            <T>비밀번호가 성공적으로 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다.</T>
          </p>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/login')}
            textKey="지금 로그인하기"
          />
        </div>
      )}

      {/* 추가 도움말 */}
      {(step === 'request' || step === 'sent') && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">
                <T>이메일이 오지 않나요?</T>
              </p>
              <ul className="space-y-1 text-blue-600">
                <li>• <T>스팸 폴더를 확인해주세요</T></li>
                <li>• <T>이메일 주소가 올바른지 확인해주세요</T></li>
                <li>• <T>몇 분 후에 다시 시도해주세요</T></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PasswordReset