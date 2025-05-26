// frontend/src/components/layout/Sidebar.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home,
  MessageCircle,
  Film,
  BookOpen,
  Map,
  Crown,
  Star,
  TrendingUp,
  Award,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Target,
  Calendar,
  Lock,
  Play,
  Clock,
  BarChart3
} from 'lucide-react'

// ✅ 실제 존재하는 파일들 import
import Button from '@/components/common/Buttom'
import { T } from '@/components/common/TranslatableText'
import { PRODUCT_LIST } from '@/shared/constants/products'
import { ROUTES } from '../../shared/constants/routes.js'

/**
 * 번역 지원 사이드 네비게이션 컴포넌트
 */
const Sidebar = ({ collapsed = false, onToggle }) => {
  const location = useLocation()
  
  // TODO: useAuth 훅이 구현되면 실제 훅 사용
  // const { hasActiveSubscription, getSubscriptionStatus } = useAuth()
  
  // 임시 구독 상태 (실제로는 useAuth에서 가져와야 함)
  const [userSubscriptions] = useState(['talk', 'drama']) // 임시 데이터
  
  const [hoveredItem, setHoveredItem] = useState(null)
  const sidebarRef = useRef(null)

  // 임시 구독 상태 확인 함수
  const hasActiveSubscription = (productId) => {
    return userSubscriptions.includes(productId)
  }

  const getSubscriptionStatus = () => {
    return userSubscriptions
  }

  // 외부 클릭 감지 (모바일에서 사이드바 닫기)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !collapsed) {
        // 모바일에서만 자동으로 닫기
        if (window.innerWidth < 1024 && onToggle) {
          onToggle()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [collapsed, onToggle])

  // 현재 경로 확인
  const isCurrentPath = (path) => location.pathname === path
  const isProductPath = (path) => location.pathname.startsWith(path)

  // 상품 아이콘 렌더링 (실제 products.js 구조에 맞춰 수정)
  const renderProductIcon = (iconName, className = "w-5 h-5") => {
    const icons = {
      MessageCircle: <MessageCircle className={className} />,
      Film: <Film className={className} />,
      BookOpen: <BookOpen className={className} />,
      Map: <Map className={className} />
    }
    return icons[iconName] || <MessageCircle className={className} />
  }

  // 메뉴 아이템 클래스
  const getMenuItemClasses = (isActive, hasSubscription = true) => {
    let baseClasses = 'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative'
    
    if (!hasSubscription) {
      return `${baseClasses} text-gray-400 cursor-not-allowed opacity-60`
    }
    
    if (isActive) {
      return `${baseClasses} text-blue-600 bg-blue-50 border-r-2 border-blue-600`
    }
    
    return `${baseClasses} text-gray-600 hover:text-gray-900 hover:bg-gray-50`
  }

  // 섹션 제목 클래스
  const getSectionTitleClasses = () => {
    if (collapsed) {
      return 'hidden'
    }
    return 'px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'
  }

  // 진행률 바 컴포넌트
  const ProgressBar = ({ progress, color = 'blue' }) => {
    if (collapsed) return null
    
    return (
      <div className="mt-2 px-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span><T>이번 주 진도</T></span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`bg-${color}-600 h-1.5 rounded-full transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  // 구독 상태 배지
  const SubscriptionBadge = ({ productId }) => {
    if (collapsed) return null
    
    if (hasActiveSubscription(productId)) {
      return (
        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          <T>구독중</T>
        </span>
      )
    }
    
    return (
      <Lock className="ml-auto w-4 h-4 text-gray-400" />
    )
  }

  // 통계 카드 컴포넌트
  const StatCard = ({ icon, value, labelKey, color = 'gray' }) => {
    if (collapsed) return null
    
    return (
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center space-x-2">
          <div className={`p-2 bg-${color}-100 rounded-lg`}>
            {icon}
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">
              <T>{labelKey}</T>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 색상 매핑 (products.js와 호환)
  const getColorClasses = (colorName) => {
    const colorMap = {
      primary: 'blue',
      secondary: 'purple', 
      success: 'green',
      warning: 'orange'
    }
    return colorMap[colorName] || 'gray'
  }

  const activeSubscriptions = getSubscriptionStatus()

  return (
    <div 
      ref={sidebarRef}
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      } lg:relative lg:top-0 lg:h-screen`}
    >
      
      {/* 사이드바 토글 버튼 */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm"
          aria-label={collapsed ? "사이드바 열기" : "사이드바 닫기"}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      )}

      <div className="h-full flex flex-col">
        {/* 메인 네비게이션 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          
          {/* 대시보드 */}
          <Link 
            to={ROUTES.DASHBOARD}
            className={getMenuItemClasses(isCurrentPath(ROUTES.DASHBOARD))}
          >
            <Home className="w-5 h-5 mr-3 flex-shrink-0" />
            {!collapsed && <span><T>대시보드</T></span>}
            
            {/* 호버 툴팁 (접힌 상태) */}
            {collapsed && hoveredItem === 'dashboard' && (
              <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                <T>대시보드</T>
              </div>
            )}
          </Link>

          {/* 학습 코스 섹션 */}
          <div className="pt-4">
            <div className={getSectionTitleClasses()}>
              <T>학습 코스</T>
            </div>
            
            <div className="space-y-1">
              {PRODUCT_LIST.map((product) => {
                const isActive = isProductPath(product.route)
                const hasSubscription = hasActiveSubscription(product.id)
                const progress = hasSubscription ? Math.floor(Math.random() * 100) : 0
                const colorClass = getColorClasses(product.color)
                
                return (
                  <div key={product.id}>
                    <Link
                      to={hasSubscription ? product.route : ROUTES.SUBSCRIPTION.PLANS}
                      className={getMenuItemClasses(isActive, hasSubscription)}
                      onMouseEnter={() => setHoveredItem(product.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      aria-label={`${product.nameKr} ${hasSubscription ? '이동' : '구독 필요'}`}
                    >
                      <div className={`p-2 rounded-lg mr-3 flex-shrink-0 bg-${colorClass}-100`}>
                        {renderProductIcon(product.icon, `text-${colorClass}-600 w-4 h-4`)}
                      </div>
                      {!collapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              <T>{product.nameKr}</T>
                            </div>
                            {hasSubscription && (
                              <div className="text-xs text-gray-500 truncate">
                                <T>{product.tag}</T>
                              </div>
                            )}
                          </div>
                          <SubscriptionBadge productId={product.id} />
                        </>
                      )}
                      
                      {/* 호버 툴팁 (접힌 상태) */}
                      {collapsed && hoveredItem === product.id && (
                        <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                          <T>{product.nameKr}</T>
                          {hasSubscription && (
                            <span className="ml-1 text-green-400">✓</span>
                          )}
                          {!hasSubscription && (
                            <span className="ml-1 text-red-400">🔒</span>
                          )}
                        </div>
                      )}
                    </Link>
                    
                    {/* 진행률 표시 */}
                    {hasSubscription && isActive && (
                      <ProgressBar progress={progress} color={colorClass} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 구독 & 관리 섹션 */}
          <div className="pt-4">
            <div className={getSectionTitleClasses()}>
              <T>구독 & 관리</T>
            </div>
            
            <div className="space-y-1">
              <Link 
                to={ROUTES.SUBSCRIPTION.PLANS}
                className={getMenuItemClasses(isCurrentPath(ROUTES.SUBSCRIPTION.PLANS))}
                onMouseEnter={() => setHoveredItem('plans')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Crown className="w-5 h-5 mr-3 flex-shrink-0" />
                {!collapsed && <span><T>구독 관리</T></span>}
                
                {collapsed && hoveredItem === 'plans' && (
                  <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                    <T>구독 관리</T>
                  </div>
                )}
              </Link>

              <Link 
                to={ROUTES.COMMON.LEADERBOARD}
                className={getMenuItemClasses(isCurrentPath(ROUTES.COMMON.LEADERBOARD))}
                onMouseEnter={() => setHoveredItem('leaderboard')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Star className="w-5 h-5 mr-3 flex-shrink-0" />
                {!collapsed && <span><T>리더보드</T></span>}
                
                {collapsed && hoveredItem === 'leaderboard' && (
                  <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                    <T>리더보드</T>
                  </div>
                )}
              </Link>

              <Link 
                to="/progress"
                className={getMenuItemClasses(isCurrentPath('/progress'))}
                onMouseEnter={() => setHoveredItem('progress')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <BarChart3 className="w-5 h-5 mr-3 flex-shrink-0" />
                {!collapsed && <span><T>학습 분석</T></span>}
                
                {collapsed && hoveredItem === 'progress' && (
                  <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                    <T>학습 분석</T>
                  </div>
                )}
              </Link>
            </div>
          </div>

          {/* 설정 & 도움말 섹션 */}
          <div className="pt-4">
            <div className={getSectionTitleClasses()}>
              <T>설정 & 도움말</T>
            </div>
            
            <div className="space-y-1">
              <Link 
                to={ROUTES.PROFILE.SETTINGS}
                className={getMenuItemClasses(isCurrentPath(ROUTES.PROFILE.SETTINGS))}
                onMouseEnter={() => setHoveredItem('settings')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Settings className="w-5 h-5 mr-3 flex-shrink-0" />
                {!collapsed && <span><T>설정</T></span>}
                
                {collapsed && hoveredItem === 'settings' && (
                  <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                    <T>설정</T>
                  </div>
                )}
              </Link>

              <Link 
                to={ROUTES.SUPPORT.HELP}
                className={getMenuItemClasses(isCurrentPath(ROUTES.SUPPORT.HELP))}
                onMouseEnter={() => setHoveredItem('help')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <HelpCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                {!collapsed && <span><T>도움말</T></span>}
                
                {collapsed && hoveredItem === 'help' && (
                  <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                    <T>도움말</T>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </nav>

        {/* 하단 정보 영역 */}
        {!collapsed && (
          <div className="p-3 border-t border-gray-200 space-y-3">
            
            {/* 학습 통계 */}
            <div className="space-y-2">
              <StatCard
                icon={<Flame className="w-4 h-4 text-orange-600" />}
                value="7일"
                labelKey="연속 학습"
                color="orange"
              />
              
              <StatCard
                icon={<Target className="w-4 h-4 text-blue-600" />}
                value="1,250 XP"
                labelKey="총 경험치"
                color="blue"
              />
            </div>

            {/* 이번 주 목표 */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  <T>이번 주 목표</T>
                </span>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span><T>학습 세션</T></span>
                    <span>3/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 구독하지 않은 상품 추천 */}
            {activeSubscriptions.length < PRODUCT_LIST.length && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  🚀 <T>더 많은 학습 기회</T>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  <T>{PRODUCT_LIST.length - activeSubscriptions.length}개의 추가 코스로 학습을 확장하세요</T>
                </p>
                <Link to={ROUTES.SUBSCRIPTION.PLANS}>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    fullWidth 
                    textKey="코스 추가하기"
                  />
                </Link>
              </div>
            )}

            {/* 최근 활동 */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span><T>최근 활동: 2시간 전</T></span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span><T>이번 주 3회 학습</T></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar