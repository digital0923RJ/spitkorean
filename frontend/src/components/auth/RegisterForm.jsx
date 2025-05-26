import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Mail, Lock, User, Globe, Target, Clock } from 'lucide-react'

import Button from '@components/common/Button'
import Input from '@components/common/Input'
import TranslatableText, { T } from '@components/common/TranslatableText'
import LanguageSelector from '../common/LanguageSelector.jsx'
import { useAuth } from '@hooks/useAuth'

// 상수
import { KOREAN_LEVELS, STUDY_GOALS } from '../../shared/constants/levels.js'

// 유효성 검사
import { validateEmail, validatePassword, validateName } from '../../utils/validation.js'

// 지원 언어 목록
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: '영어 (English)' },
  { code: 'ja', name: '일본어 (日本語)' },
  { code: 'zh', name: '중국어 (中文)' },
  { code: 'vi', name: '베트남어 (Tiếng Việt)' },
  { code: 'es', name: '스페인어 (Español)' },
  { code: 'fr', name: '프랑스어 (Français)' },
  { code: 'hi', name: '힌디어 (हिन्दी)' },
  { code: 'th', name: '태국어 (ไทย)' },
  { code: 'de', name: '독일어 (Deutsch)' },
  { code: 'mn', name: '몽골어 (Монгол)' },
  { code: 'ar', name: '아랍어 (العربية)' },
  { code: 'pt', name: '포르투갈어 (Português)' },
  { code: 'tr', name: '터키어 (Türkçe)' }
]

// 유효성 검사 스키마 (커스텀 검증 함수 사용)
const registerSchema = yup.object({
  name: yup
    .string()
    .test('name-validation', '이름은 최소 2자 이상 50자 이하여야 합니다', (value) => {
      return validateName(value);
    })
    .required('이름을 입력해주세요'),
  email: yup
    .string()
    .test('email-validation', '올바른 이메일 형식을 입력해주세요', (value) => {
      return validateEmail(value);
    })
    .required('이메일을 입력해주세요'),
  password: yup
    .string()
    .test('password-validation', '비밀번호는 대문자, 소문자, 숫자를 포함한 8자 이상이어야 합니다', (value) => {
      const result = validatePassword(value);
      return result.isValid;
    })
    .required('비밀번호를 입력해주세요'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다')
    .required('비밀번호 확인을 입력해주세요'),
  nativeLanguage: yup
    .string()
    .required('모국어를 선택해주세요'),
  koreanLevel: yup
    .string()
    .required('현재 한국어 실력을 선택해주세요'),
  studyGoals: yup
    .array()
    .min(1, '최소 하나의 학습 목표를 선택해주세요'),
  agreeToTerms: yup
    .boolean()
    .oneOf([true], '이용약관에 동의해주세요')
})

/**
 * 번역 지원 회원가입 폼 컴포넌트
 */
const RegisterForm = ({ 
  onSuccess,
  showTitle = true,
  showLoginLink = true,
  className = ''
}) => {
  const { register: registerUser, isRegisterLoading, registerError, clearAuthErrors } = useAuth()
  const [step, setStep] = useState(1) // 다단계 폼
  const [selectedGoals, setSelectedGoals] = useState([])

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
    trigger
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      nativeLanguage: 'en',
      koreanLevel: 'beginner',
      studyGoals: [],
      dailyStudyTime: 15,
      agreeToTerms: false
    }
  })

  // 폼 값 감시
  const watchedPassword = watch('password')

  // 컴포넌트 마운트 시 에러 클리어
  useEffect(() => {
    clearAuthErrors()
  }, [clearAuthErrors])

  // 학습 목표 업데이트
  useEffect(() => {
    setValue('studyGoals', selectedGoals)
  }, [selectedGoals, setValue])

  // 1단계 검증
  const validateStep1 = async () => {
    const isValid = await trigger(['name', 'email', 'password', 'confirmPassword'])
    return isValid
  }

  // 2단계 검증
  const validateStep2 = async () => {
    const isValid = await trigger(['nativeLanguage', 'koreanLevel', 'studyGoals'])
    return isValid && selectedGoals.length > 0
  }

  // 다음 단계로
  const nextStep = async () => {
    if (step === 1) {
      const isValid = await validateStep1()
      if (isValid) setStep(2)
    } else if (step === 2) {
      const isValid = await validateStep2()
      if (isValid) setStep(3)
    }
  }

  // 이전 단계로
  const prevStep = () => {
    setStep(step - 1)
  }

  // 학습 목표 토글
  const toggleGoal = (goal) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    )
  }

  // 폼 제출 핸들러
  const onSubmit = async (data) => {
    try {
      const userData = {
        ...data,
        studyGoals: selectedGoals
      }
      
      const result = await registerUser(userData)
      
      if (result.success) {
        reset()
        setSelectedGoals([])
        setStep(1)
        onSuccess?.(result.user)
      }
    } catch (error) {
      console.error('Register error:', error)
    }
  }

  // 비밀번호 강도 체크 (커스텀 검증 함수 사용)
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '' }
    
    const result = validatePassword(password);
    
    if (!result.isValid) {
      return { score: 0, text: '매우 약함', color: 'error' }
    }
    
    let score = 0
    if (password.length >= 8) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^a-zA-Z\d]/.test(password)) score += 1
    
    const levels = [
      { score: 0, text: '매우 약함', color: 'error' },
      { score: 1, text: '약함', color: 'error' },
      { score: 2, text: '보통', color: 'warning' },
      { score: 3, text: '좋음', color: 'success' },
      { score: 4, text: '강함', color: 'success' },
      { score: 5, text: '매우 강함', color: 'success' }
    ]
    
    return levels[Math.min(score, 5)]
  }

  const passwordStrength = getPasswordStrength(watchedPassword)

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <T>회원가입</T>
          </h2>
          <p className="text-gray-600">
            <T>SpitKorean과 함께 한국어 학습 여행을 시작하세요</T>
          </p>
        </div>
      )}

      {/* 진행 표시기 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step >= stepNum
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {stepNum}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <T>계정 정보</T>
          <T>학습 설정</T>
          <T>약관 동의</T>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 1단계: 계정 정보 */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label={<T>이름</T>}
              placeholder="이름을 입력하세요"
              leftIcon={<User />}
              error={errors.name?.message && <T>{errors.name.message}</T>}
              {...register('name')}
              autoFocus
            />

            <Input
              label={<T>이메일</T>}
              type="email"
              placeholder="이메일을 입력하세요"
              leftIcon={<Mail />}
              error={errors.email?.message && <T>{errors.email.message}</T>}
              {...register('email')}
              autoComplete="email"
            />

            <div>
              <Input
                label={<T>비밀번호</T>}
                type="password"
                placeholder="비밀번호를 입력하세요"
                leftIcon={<Lock />}
                error={errors.password?.message && <T>{errors.password.message}</T>}
                {...register('password')}
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

            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={nextStep}
              textKey="다음 단계"
            />
          </div>
        )}

        {/* 2단계: 학습 설정 */}
        {step === 2 && (
          <div className="space-y-6">
            {/* 모국어 선택 - LanguageSelector 컴포넌트 사용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="inline w-4 h-4 mr-1" />
                <T>모국어</T>
              </label>
              <LanguageSelector
                variant="default"
                showFlag={true}
                showName={true}
                showNativeName={true}
                onLanguageChange={(languageCode) => {
                  setValue('nativeLanguage', languageCode);
                  trigger('nativeLanguage');
                }}
                placeholder="모국어를 선택하세요"
              />
              {/* Hidden input for form validation */}
              <input
                type="hidden"
                {...register('nativeLanguage')}
              />
              {errors.nativeLanguage && (
                <p className="mt-1 text-sm text-error-600">
                  <T>{errors.nativeLanguage.message}</T>
                </p>
              )}
            </div>

            {/* 한국어 실력 - 상수 파일에서 가져온 KOREAN_LEVELS 사용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <T>현재 한국어 실력</T>
              </label>
              <div className="space-y-2">
                {KOREAN_LEVELS.map((level) => (
                  <label key={level.value} className="flex items-center">
                    <input
                      type="radio"
                      value={level.value}
                      {...register('koreanLevel')}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm">
                      <T>{level.label}</T>
                    </span>
                  </label>
                ))}
              </div>
              {errors.koreanLevel && (
                <p className="mt-1 text-sm text-error-600">
                  <T>{errors.koreanLevel.message}</T>
                </p>
              )}
            </div>

            {/* 학습 목표 - 상수 파일에서 가져온 STUDY_GOALS 사용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="inline w-4 h-4 mr-1" />
                <T>학습 목표 (복수 선택 가능)</T>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STUDY_GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => toggleGoal(goal.value)}
                    className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                      selectedGoals.includes(goal.value)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <T>{goal.label}</T>
                  </button>
                ))}
              </div>
              {selectedGoals.length === 0 && errors.studyGoals && (
                <p className="mt-1 text-sm text-error-600">
                  <T>{errors.studyGoals.message}</T>
                </p>
              )}
            </div>

            {/* 일일 학습 시간 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                <T>일일 목표 학습 시간</T>
              </label>
              <select
                {...register('dailyStudyTime')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={15}><T>15분</T></option>
                <option value={30}><T>30분</T></option>
                <option value={45}><T>45분</T></option>
                <option value={60}><T>1시간</T></option>
                <option value={90}><T>1시간 30분</T></option>
                <option value={120}><T>2시간</T></option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={prevStep}
                textKey="이전"
              />
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                onClick={nextStep}
                textKey="다음 단계"
              />
            </div>
          </div>
        )}

        {/* 3단계: 약관 동의 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <T>마지막 단계입니다!</T>
              </h3>
              <p className="text-gray-600">
                <T>약관에 동의하시면 SpitKorean 서비스를 이용하실 수 있습니다.</T>
              </p>
            </div>

            {/* 약관 동의 */}
            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  {...register('agreeToTerms')}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                />
                <span className="ml-2 text-sm text-gray-600">
                  <Link to="/terms" className="text-primary-600 hover:underline">
                    <T>이용약관</T>
                  </Link>
                  <T> 및 </T>
                  <Link to="/privacy" className="text-primary-600 hover:underline">
                    <T>개인정보처리방침</T>
                  </Link>
                  <T>에 동의합니다</T>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-sm text-error-600">
                  <T>{errors.agreeToTerms.message}</T>
                </p>
              )}
            </div>

            {/* 에러 메시지 */}
            {registerError && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                <p className="text-error-600 text-sm text-center">
                  <T>{registerError}</T>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={prevStep}
                textKey="이전"
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isRegisterLoading}
                disabled={!isValid}
                textKey={isRegisterLoading ? '가입 중...' : '회원가입 완료'}
              />
            </div>
          </div>
        )}
      </form>

      {/* 로그인 링크 */}
      {showLoginLink && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <T>이미 계정이 있으신가요?</T>
            {' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 hover:underline"
            >
              <T>로그인</T>
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}

export default RegisterForm