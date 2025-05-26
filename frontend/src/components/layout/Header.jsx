// frontend/src/components/layout/Header.jsx
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  Sparkles,
  MessageCircle,
  Film,
  BookOpen,
  Map,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Crown,
  Flame,
  Star,
  ChevronDown,
  Search,
  Home,
  Globe
} from 'lucide-react'

// ✅ 실제 존재하는 파일들 import
import { useAuth } from '@/hooks/useAuth'
import { PRODUCTS, PRODUCT_LIST } from '@/shared/constants/products'
import TranslatableText, { T } from '@/components/common/TranslatableText'
import Button from '@/components/common/Button'
import { HeaderLanguageSelector } from '../common/LanguageSelector.jsx'
import { ROUTES } from '../../shared/constants/routes.js'

/**
 * 번역 지원 메인 네비게이션 헤더 컴포넌트
 */
const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // ✅ 실제 useAuth 훅 사용
  const { 
    user, 
    logout, 
    getUserDisplayName, 
    getSubscriptionStatus, 
    hasActiveSubscription 
  } = useAuth()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false)

  // 현재 경로 확인
  const isCurrentPath = (path) => location.pathname === path
  const isProductPath = (path) => location.pathname.startsWith(path)

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // 언어 변경 핸들러
  const handleLanguageChange = (languageCode) => {
    console.log('언어 변경:', languageCode)
  }

  // 상품 아이콘 렌더링
  const renderProductIcon = (iconName, className = "w-5 h-5") => {
    const icons = {
      MessageCircle: <MessageCircle className={className} />,
      Film: <Film className={className} />,
      BookOpen: <BookOpen className={className} />,
      Map: <Map className={className} />
    }
    return icons[iconName] || <MessageCircle className={className} />
  }

  // 구독 상태 배지
  const getSubscriptionBadge = (productId) => {
    if (hasActiveSubscription(productId)) {
      return (
        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          <T>구독중</T>
        </span>
      )
    }
    return null
  }

  // 활성 링크 스타일
  const getLinkClasses = (isActive) => {
    return isActive
      ? 'flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg'
      : 'flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors'
  }

  const activeSubscriptions = getSubscriptionStatus()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 왼쪽: 로고 & 네비게이션 */}
          <div className="flex items-center space-x-8">
            {/* 로고 */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SpitKorean
              </span>
            </Link>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden lg:flex items-center space-x-1">
              {/* 대시보드 */}
              <Link 
                to={ROUTES.DASHBOARD} 
                className={getLinkClasses(isCurrentPath(ROUTES.DASHBOARD))}
              >
                <Home className="w-4 h-4 mr-2" />
                <T>대시보드</T>
              </Link>

              {/* 학습 코스 드롭다운 */}
              <div className="relative">
                <button
                  onClick={() => setIsProductMenuOpen(!isProductMenuOpen)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    PRODUCT_LIST.some(p => isProductPath(p.route))
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <T>학습 코스</T>
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isProductMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* ✅ 실제 PRODUCT_LIST 사용 */}
                {isProductMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {PRODUCT_LIST.map((product) => (
                      <Link
                        key={product.id}
                        to={product.route}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProductMenuOpen(false)}
                      >
                        <div className={`p-2 rounded-lg mr-3 bg-${product.color}-100`}>
                          {renderProductIcon(product.icon, `text-${product.color}-600 w-5 h-5`)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">
                              <T>{product.nameKr}</T>
                            </span>
                            {getSubscriptionBadge(product.id)}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            <T>{product.tag}</T>
                          </p>
                        </div>
                        <span className="text-sm font-medium text-gray-900">${product.price}</span>
                      </Link>
                    ))}
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Link
                        to={ROUTES.SUBSCRIPTION.PLANS}
                        className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={() => setIsProductMenuOpen(false)}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        <T>구독 관리 & 할인 패키지</T>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 리더보드 */}
              <Link 
                to={ROUTES.COMMON.LEADERBOARD} 
                className={getLinkClasses(isCurrentPath(ROUTES.COMMON.LEADERBOARD))}
              >
                <Star className="w-4 h-4 mr-2" />
                <T>리더보드</T>
              </Link>
            </nav>
          </div>

          {/* 가운데: 검색 (데스크톱만) */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="학습 콘텐츠 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 오른쪽: 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {/* ✅ 전용 언어 선택 컴포넌트 사용 */}
            <HeaderLanguageSelector 
              onLanguageChange={handleLanguageChange}
              className="hidden md:block"
            />

            {/* 알림 (데스크톱만) */}
            <button className="hidden lg:flex p-2 text-gray-400 hover:text-gray-600 transition-colors relative rounded-lg hover:bg-gray-50">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* 연속 학습 표시 (데스크톱만) */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-orange-50 rounded-lg">
              <Flame className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">7<T>일</T></span>
            </div>

            {/* 프로필 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900 max-w-32 truncate">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activeSubscriptions.length > 0 ? (
                      <T>{activeSubscriptions.length}개 구독</T>
                    ) : (
                      <T>무료 사용자</T>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* 프로필 드롭다운 메뉴 */}
              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="font-medium text-gray-900">{getUserDisplayName()}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      to={ROUTES.PROFILE.BASE}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      <T>프로필</T>
                    </Link>
                    <Link
                      to={ROUTES.PROFILE.SETTINGS}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      <T>설정</T>
                    </Link>
                    <Link
                      to={ROUTES.SUBSCRIPTION.PLANS}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Crown className="w-4 h-4 mr-3" />
                      <T>구독 관리</T>
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-100 py-1">
                    {/* ✅ Button 컴포넌트 사용 */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:bg-red-50"
                      leftIcon={<LogOut className="w-4 h-4" />}
                      onClick={() => {
                        setIsProfileMenuOpen(false)
                        handleLogout()
                      }}
                    >
                      <T>로그아웃</T>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 - 번역 지원 버전 */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white py-4">
            <div className="space-y-2">
              {/* 검색 (모바일) */}
              <div className="px-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="학습 콘텐츠 검색..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 대시보드 */}
              <Link 
                to={ROUTES.DASHBOARD} 
                className={getLinkClasses(isCurrentPath(ROUTES.DASHBOARD))}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-4 h-4 mr-3" />
                <T>대시보드</T>
              </Link>

              {/* 학습 코스들 */}
              <div className="px-3 py-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  <T>학습 코스</T>
                </div>
                <div className="space-y-1">
                  {PRODUCT_LIST.map((product) => (
                    <Link
                      key={product.id}
                      to={product.route}
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className={`p-1.5 rounded-md mr-3 bg-${product.color}-100`}>
                        {renderProductIcon(product.icon, `text-${product.color}-600 w-4 h-4`)}
                      </div>
                      <span className="flex-1">
                        <T>{product.nameKr}</T>
                      </span>
                      {getSubscriptionBadge(product.id)}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 나머지 메뉴들도 <T> 태그로 감싸기 */}
              {/* ... */}
            </div>
          </div>
        )}
      </div>

      {/* 클릭 외부 영역 감지 */}
      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </header>
  )
}

export default Header