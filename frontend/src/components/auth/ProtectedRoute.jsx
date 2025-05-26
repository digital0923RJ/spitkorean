import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import LoadingSpinner from '@components/common/LoadingSpinner'

// 상수
import { ROUTES } from '../../shared/constants/routes.js'

/**
 * 인증된 사용자만 접근할 수 있는 라우트를 보호하는 컴포넌트
 */
const ProtectedRoute = ({ 
  children, 
  requiredSubscription = null,
  requiredRole = null,
  fallbackPath = ROUTES.AUTH.LOGIN,
  showLoader = true,
  ...props 
}) => {
  const { isAuthenticated, isLoading, hasActiveSubscription, hasRole } = useAuth()
  const location = useLocation()

  // 로딩 중인 경우
  if (isLoading && showLoader) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">인증 상태를 확인하는 중...</p>
        </div>
      </div>
    )
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    )
  }

  // 특정 역할이 필요한 경우 체크
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Navigate
        to={ROUTES.ERROR.UNAUTHORIZED}
        state={{ from: location, requiredRole }}
        replace
      />
    )
  }

  // 특정 구독이 필요한 경우 체크
  if (requiredSubscription && !hasActiveSubscription(requiredSubscription)) {
    return (
      <Navigate
        to={ROUTES.SUBSCRIPTION.PLANS}
        state={{ 
          from: location, 
          requiredSubscription,
          message: `${requiredSubscription} 서비스 구독이 필요합니다.`
        }}
        replace
      />
    )
  }

  // 모든 조건을 통과한 경우 컴포넌트 렌더링
  return children
}

// 구독 상품별 보호된 라우트 컴포넌트들
export const TalkProtectedRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredSubscription="talk" {...props}>
    {children}
  </ProtectedRoute>
)

export const DramaProtectedRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredSubscription="drama" {...props}>
    {children}
  </ProtectedRoute>
)

export const TestProtectedRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredSubscription="test" {...props}>
    {children}
  </ProtectedRoute>
)

export const JourneyProtectedRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredSubscription="journey" {...props}>
    {children}
  </ProtectedRoute>
)

// 관리자 전용 라우트
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="admin" fallbackPath={ROUTES.ERROR.UNAUTHORIZED} {...props}>
    {children}
  </ProtectedRoute>
)

// 이메일 인증이 필요한 라우트
export const EmailVerifiedRoute = ({ 
  children, 
  fallbackPath = ROUTES.AUTH.VERIFY_EMAIL, 
  ...props 
}) => {
  const { user, isEmailVerified } = useAuth()
  const location = useLocation()

  if (!isEmailVerified()) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    )
  }

  return (
    <ProtectedRoute {...props}>
      {children}
    </ProtectedRoute>
  )
}

// 게스트 전용 라우트 (이미 로그인된 사용자는 접근 불가)
export const GuestRoute = ({ children, redirectTo = ROUTES.DASHBOARD }) => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}

// 구독 체크 후 적절한 페이지로 리다이렉트하는 라우트
export const SubscriptionAwareRoute = ({ children, productId, ...props }) => {
  const { hasActiveSubscription } = useAuth()
  const location = useLocation()

  if (!hasActiveSubscription(productId)) {
    return (
      <Navigate
        to={ROUTES.SUBSCRIPTION.PLANS}
        state={{ 
          from: location, 
          requiredSubscription: productId,
          message: `${productId} 서비스를 이용하려면 구독이 필요합니다.`
        }}
        replace
      />
    )
  }

  return (
    <ProtectedRoute {...props}>
      {children}
    </ProtectedRoute>
  )
}

// 복합 권한 체크 라우트 (역할 + 구독)
export const AdvancedProtectedRoute = ({ 
  children, 
  requiredRole = null,
  requiredSubscription = null,
  requireEmailVerification = false,
  ...props 
}) => {
  const { hasRole, hasActiveSubscription, isEmailVerified } = useAuth()
  const location = useLocation()

  // 이메일 인증 체크
  if (requireEmailVerification && !isEmailVerified()) {
    return (
      <Navigate
        to={ROUTES.AUTH.VERIFY_EMAIL}
        state={{ from: location }}
        replace
      />
    )
  }

  // 역할 체크
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Navigate
        to={ROUTES.ERROR.UNAUTHORIZED}
        state={{ from: location, requiredRole }}
        replace
      />
    )
  }

  // 구독 체크
  if (requiredSubscription && !hasActiveSubscription(requiredSubscription)) {
    return (
      <Navigate
        to={ROUTES.SUBSCRIPTION.PLANS}
        state={{ 
          from: location, 
          requiredSubscription,
          message: `${requiredSubscription} 서비스 구독이 필요합니다.`
        }}
        replace
      />
    )
  }

  return (
    <ProtectedRoute {...props}>
      {children}
    </ProtectedRoute>
  )
}

export default ProtectedRoute