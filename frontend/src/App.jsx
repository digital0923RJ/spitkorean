import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// 커스텀 훅
import { useAuth } from '@/hooks/useAuth'

// 레이아웃 컴포넌트
import Header from '@components/layout/Header'
import Sidebar from '@components/layout/Sidebar'
import Footer from '@components/layout/Footer'

// 페이지 컴포넌트
import Home from '@pages/Home'
import Login from '@pages/Login'
import Register from '@pages/Register'
import Dashboard from '@pages/Dashboard'

// 상품별 페이지
import TalkHome from '@pages/talk/TalkHome'
import DramaHome from '@pages/drama/DramaHome'
import TestHome from '@pages/test/TestHome'
import JourneyHome from '@pages/journey/JourneyHome'

// 구독 및 프로필 페이지
import Plans from '@pages/subscription/Plans'
import Profile from '@pages/profile/Profile'
import Settings from '@pages/profile/Settings'

// 기타 페이지
// Module not found error: The imported page/component does not exist or the import path is incorrect.
// This causes the app to fail rendering and results in a blank page.
//import Leaderboard from '@pages/Leaderboard'
//import Progress from '@pages/Progress'
//import Help from '@pages/Help'

// 인증 관련
import { checkAuthStatus } from '@store/slices/authSlice'
import ProtectedRoute from '@components/auth/ProtectedRoute'
import LoadingSpinner from '@components/common/LoadingSpinner'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading, user } = useAuth()
  
  // 사이드바 상태 관리
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    // 앱 시작 시 인증 상태 확인
    dispatch(checkAuthStatus())
  }, [dispatch])

  // 사이드바 토글 함수
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // 인증이 필요한 페이지 레이아웃
  const AuthenticatedLayout = ({ children }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar}
        />
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )

  // 공개 페이지 레이아웃
  const PublicLayout = ({ children }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  )

  return (
    <Routes>
      {/* 공개 라우트 - 사이드바 없음 */}
      <Route path="/" element={
        <PublicLayout>
          <Home />
        </PublicLayout>
      } />
      
      <Route path="/login" element={
        <PublicLayout>
          <Login />
        </PublicLayout>
      } />
      
      <Route path="/register" element={
        <PublicLayout>
          <Register />
        </PublicLayout>
      } />
      
      <Route path="/plans" element={
        <PublicLayout>
          <Plans />
        </PublicLayout>
      } />
      {/*
      <Route path="/help" element={
        <PublicLayout>
          <Help />
        </PublicLayout>
      } />
      *}
      {/* 보호된 라우트 - 사이드바 포함 */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <Dashboard />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <Profile />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <Settings />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />
      {/*
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <Leaderboard />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />
      */}
      {/*
      <Route path="/progress" element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <Progress />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />
      */}
      {/* 상품별 라우트 - 사이드바 포함 */}
      <Route path="/talk/*" element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <TalkHome />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/drama/*" element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <DramaHome />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/test/*" element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <TestHome />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/journey/*" element={
        <ProtectedRoute>
          <AuthenticatedLayout>
            <JourneyHome />
          </AuthenticatedLayout>
        </ProtectedRoute>
      } />
      
      {/* 404 처리 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App