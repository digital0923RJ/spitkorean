import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// 레이아웃 컴포넌트
import AuthLayout from '@components/layout/AuthLayout'
import ProtectedRoute from '@components/auth/ProtectedRoute'
import LoadingSpinner from '@components/common/LoadingSpinner'

// 라우트 상수
import { ROUTES } from '@/shared/constants/routes'

// 공통 페이지들 (즉시 로드)
import Home from '@pages/Home'
import Login from '@pages/Login'
import Register from '@pages/Register'
import Dashboard from '@pages/Dashboard'

// 지연 로딩 컴포넌트들
const Profile = React.lazy(() => import('@pages/profile/Profile'))
const EditProfile = React.lazy(() => import('@pages/profile/EditProfile'))
const Settings = React.lazy(() => import('@pages/profile/Settings'))

// 구독 관련 페이지들
const Plans = React.lazy(() => import('@pages/subscription/Plans'))
const Checkout = React.lazy(() => import('@pages/subscription/Checkout'))
const ManageSubscription = React.lazy(() => import('@pages/subscription/ManageSubscription'))

// Talk Like You Mean It 페이지들
const TalkHome = React.lazy(() => import('@pages/talk/TalkHome'))
const ChatSession = React.lazy(() => import('@pages/talk/ChatSession'))
const SessionHistory = React.lazy(() => import('@pages/talk/SessionHistory'))

// Drama Builder 페이지들
const DramaHome = React.lazy(() => import('@pages/drama/DramaHome'))
const SentencePractice = React.lazy(() => import('@pages/drama/SentencePractice'))
const DramaProgress = React.lazy(() => import('@pages/drama/Progress'))

// Test & Study 페이지들
const TestHome = React.lazy(() => import('@pages/test/TestHome'))
const QuizSession = React.lazy(() => import('@pages/test/QuizSession'))
const TestResults = React.lazy(() => import('@pages/test/Results'))
const Statistics = React.lazy(() => import('@pages/test/Statistics'))

// Korean Journey 페이지들
const JourneyHome = React.lazy(() => import('@pages/journey/JourneyHome'))
const ReadingSession = React.lazy(() => import('@pages/journey/ReadingSession'))
const LevelProgress = React.lazy(() => import('@pages/journey/LevelProgress'))

// 기타 페이지들
const Help = React.lazy(() => import('@pages/Help'))
const Contact = React.lazy(() => import('@pages/Contact'))
const Community = React.lazy(() => import('@pages/Community'))
const Blog = React.lazy(() => import('@pages/Blog'))
const Terms = React.lazy(() => import('@pages/legal/Terms'))
const Privacy = React.lazy(() => import('@pages/legal/Privacy'))
const Cookies = React.lazy(() => import('@pages/legal/Cookies'))
const Refund = React.lazy(() => import('@pages/legal/Refund'))
const Leaderboard = React.lazy(() => import('@pages/Leaderboard'))

// 에러 페이지들
const NotFound = React.lazy(() => import('@pages/errors/NotFound'))
const Maintenance = React.lazy(() => import('@pages/errors/Maintenance'))

/**
 * 로딩 컴포넌트
 */
const SuspenseWrapper = ({ children }) => (
  <Suspense 
    fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="페이지를 불러오는 중..." />
      </div>
    }
  >
    {children}
  </Suspense>
)

/**
 * 인증이 필요한 라우트 래퍼
 */
const ProtectedSuspenseRoute = ({ children, requireSubscription = null }) => (
  <ProtectedRoute requireSubscription={requireSubscription}>
    <SuspenseWrapper>
      {children}
    </SuspenseWrapper>
  </ProtectedRoute>
)

/**
 * 메인 라우팅 설정
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path={ROUTES.HOME} element={<Home />} />
      
      {/* 인증 관련 라우트 - AuthLayout 적용 */}
      <Route path={ROUTES.AUTH.LOGIN} element={
        <AuthLayout variant="login" showTestimonials={true}>
          <Login />
        </AuthLayout>
      } />
      
      <Route path={ROUTES.AUTH.REGISTER} element={
        <AuthLayout variant="register" showFeatures={true} showStats={true}>
          <Register />
        </AuthLayout>
      } />
      
      {/* 구독 관련 라우트 (공개) */}
      <Route path={ROUTES.SUBSCRIPTION.PLANS} element={
        <SuspenseWrapper>
          <Plans />
        </SuspenseWrapper>
      } />
      
      {/* 도움말 및 정보 페이지들 (공개) */}
      <Route path={ROUTES.SUPPORT.HELP} element={
        <SuspenseWrapper>
          <Help />
        </SuspenseWrapper>
      } />
      <Route path={ROUTES.SUPPORT.CONTACT} element={
        <SuspenseWrapper>
          <Contact />
        </SuspenseWrapper>
      } />
      <Route path="/community" element={
        <SuspenseWrapper>
          <Community />
        </SuspenseWrapper>
      } />
      <Route path="/blog" element={
        <SuspenseWrapper>
          <Blog />
        </SuspenseWrapper>
      } />
      
      {/* 법적 페이지들 (공개) */}
      <Route path="/terms" element={
        <SuspenseWrapper>
          <Terms />
        </SuspenseWrapper>
      } />
      <Route path="/privacy" element={
        <SuspenseWrapper>
          <Privacy />
        </SuspenseWrapper>
      } />
      <Route path="/cookies" element={
        <SuspenseWrapper>
          <Cookies />
        </SuspenseWrapper>
      } />
      <Route path="/refund" element={
        <SuspenseWrapper>
          <Refund />
        </SuspenseWrapper>
      } />

      {/* =============== 보호된 라우트 =============== */}
      
      {/* 대시보드 */}
      <Route path={ROUTES.DASHBOARD} element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* 프로필 관련 라우트 */}
      <Route path={ROUTES.PROFILE.BASE} element={
        <ProtectedSuspenseRoute>
          <Profile />
        </ProtectedSuspenseRoute>
      } />
      <Route path={ROUTES.PROFILE.EDIT} element={
        <ProtectedSuspenseRoute>
          <EditProfile />
        </ProtectedSuspenseRoute>
      } />
      <Route path={ROUTES.PROFILE.SETTINGS} element={
        <ProtectedSuspenseRoute>
          <Settings />
        </ProtectedSuspenseRoute>
      } />

      {/* 구독 관련 라우트 (보호됨) */}
      <Route path={ROUTES.SUBSCRIPTION.CHECKOUT} element={
        <ProtectedSuspenseRoute>
          <Checkout />
        </ProtectedSuspenseRoute>
      } />
      <Route path={ROUTES.SUBSCRIPTION.MANAGE} element={
        <ProtectedSuspenseRoute>
          <ManageSubscription />
        </ProtectedSuspenseRoute>
      } />

      {/* 리더보드 */}
      <Route path={ROUTES.COMMON.LEADERBOARD} element={
        <ProtectedSuspenseRoute>
          <Leaderboard />
        </ProtectedSuspenseRoute>
      } />

      {/* =============== Talk Like You Mean It 라우트 =============== */}
      <Route path="/talk/*" element={
        <ProtectedSuspenseRoute requireSubscription="talk">
          <Routes>
            <Route index element={<TalkHome />} />
            <Route path="home" element={<TalkHome />} />
            <Route path="chat" element={<ChatSession />} />
            <Route path="chat/:sessionId" element={<ChatSession />} />
            <Route path="session/:sessionId" element={<ChatSession />} />
            <Route path="history" element={<SessionHistory />} />
            <Route path="*" element={<Navigate to="/talk" replace />} />
          </Routes>
        </ProtectedSuspenseRoute>
      } />

      {/* =============== Drama Builder 라우트 =============== */}
      <Route path="/drama/*" element={
        <ProtectedSuspenseRoute requireSubscription="drama">
          <Routes>
            <Route index element={<DramaHome />} />
            <Route path="home" element={<DramaHome />} />
            <Route path="practice" element={<SentencePractice />} />
            <Route path="practice/:episodeId" element={<SentencePractice />} />
            <Route path="level/:level" element={<SentencePractice />} />
            <Route path="progress" element={<DramaProgress />} />
            <Route path="sentences/:dramaId" element={<SentencePractice />} />
            <Route path="*" element={<Navigate to="/drama" replace />} />
          </Routes>
        </ProtectedSuspenseRoute>
      } />

      {/* =============== Test & Study 라우트 =============== */}
      <Route path="/test/*" element={
        <ProtectedSuspenseRoute requireSubscription="test">
          <Routes>
            <Route index element={<TestHome />} />
            <Route path="home" element={<TestHome />} />
            <Route path="quiz" element={<QuizSession />} />
            <Route path="quiz/:testId" element={<QuizSession />} />
            <Route path="level/:level" element={<QuizSession />} />
            <Route path="session/:testId" element={<QuizSession />} />
            <Route path="results" element={<TestResults />} />
            <Route path="results/:resultId" element={<TestResults />} />
            <Route path="review/:resultId" element={<TestResults />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="*" element={<Navigate to="/test" replace />} />
          </Routes>
        </ProtectedSuspenseRoute>
      } />

      {/* =============== Korean Journey 라우트 =============== */}
      <Route path="/journey/*" element={
        <ProtectedSuspenseRoute requireSubscription="journey">
          <Routes>
            <Route index element={<JourneyHome />} />
            <Route path="home" element={<JourneyHome />} />
            <Route path="reading" element={<ReadingSession />} />
            <Route path="reading/:contentId" element={<ReadingSession />} />
            <Route path="level/:level" element={<ReadingSession />} />
            <Route path="session/:contentId" element={<ReadingSession />} />
            <Route path="progress" element={<LevelProgress />} />
            <Route path="pronunciation" element={<ReadingSession />} />
            <Route path="*" element={<Navigate to="/journey" replace />} />
          </Routes>
        </ProtectedSuspenseRoute>
      } />

      {/* =============== 유지보수 및 에러 페이지 =============== */}
      
      {/* 유지보수 모드 */}
      <Route path="/maintenance" element={
        <SuspenseWrapper>
          <Maintenance />
        </SuspenseWrapper>
      } />

      {/* 404 페이지 */}
      <Route path={ROUTES.ERROR.NOT_FOUND} element={
        <SuspenseWrapper>
          <NotFound />
        </SuspenseWrapper>
      } />

      {/* 기본 리디렉션 및 404 처리 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

/**
 * 조건부 라우팅을 위한 헬퍼 컴포넌트들
 */

/**
 * 유지보수 모드 체크 래퍼
 */
export const MaintenanceWrapper = ({ children }) => {
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true'
  
  if (isMaintenanceMode) {
    return <Navigate to="/maintenance" replace />
  }
  
  return children
}

/**
 * 라우트 가드 - 특정 조건에 따른 접근 제어
 */
export const RouteGuard = ({ children, condition, fallback }) => {
  if (!condition) {
    return <Navigate to={fallback} replace />
  }
  
  return children
}

/**
 * 실험 기능 라우트 (feature flag 기반)
 */
export const ExperimentalRoute = ({ children, featureFlag }) => {
  const isFeatureEnabled = import.meta.env[`VITE_FEATURE_${featureFlag.toUpperCase()}`] === 'true'
  
  if (!isFeatureEnabled) {
    return <Navigate to="/404" replace />
  }
  
  return children
}

/**
 * 역할 기반 라우트 (관리자 등)
 */
export const RoleBasedRoute = ({ children, requiredRole }) => {
  // 실제 구현에서는 user context에서 역할 확인
  // const { user } = useAuth()
  // const hasRequiredRole = user?.roles?.includes(requiredRole)
  
  // if (!hasRequiredRole) {
  //   return <Navigate to="/unauthorized" replace />
  // }
  
  return children
}

/**
 * 라우트 분석을 위한 래퍼 (Google Analytics 등)
 */
export const AnalyticsWrapper = ({ children }) => {
  // 페이지 뷰 추적 로직
  React.useEffect(() => {
    // gtag('config', 'GA_MEASUREMENT_ID', {
    //   page_path: window.location.pathname,
    // })
  }, [])
  
  return children
}

/**
 * 에러 경계가 포함된 라우트 래퍼
 */
export const ErrorBoundaryRoute = ({ children }) => {
  // ErrorBoundary import가 필요함
  // import { ErrorBoundary } from 'react-error-boundary'
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          페이지를 불러오는 중 오류가 발생했습니다
        </h2>
        <p className="text-gray-600 mb-6">
          잠시 후 다시 시도해주세요
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          페이지 새로고침
        </button>
      </div>
    </div>
  )
}

export default AppRoutes