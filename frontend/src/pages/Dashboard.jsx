import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { 
  MessageCircle, 
  Film, 
  BookOpen, 
  Map,
  TrendingUp,
  Calendar,
  Award,
  Users,
  Play,
  ArrowRight,
  Flame,
  Target,
  Clock,
  BarChart3,
  Star,
  Trophy,
  Zap,
  ChevronRight,
  Lock,
  Sparkles,
  Gift,
  Settings,
  Bell,
  Plus
} from 'lucide-react'

import Button from '../components/common/Buttom.jsx'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import TranslatableText, { T, TUI, TBlock } from '@/components/common/TranslatableText'
import { useAuth } from '@/hooks/useAuth'
import { useGamification } from '../hooks/useGamification.js'
import { PRODUCTS, PRODUCT_LIST } from '@/shared/constants/products'
import { ROUTES } from '@/shared/constants/routes'

/**
 * 대시보드 페이지 (게임화 시스템 통합)
 */
const Dashboard = () => {
  const dispatch = useDispatch()
  const { user, getUserDisplayName, getSubscriptionStatus, hasActiveSubscription, isLoading: authLoading } = useAuth()
  
  // 게임화 훅 사용
  const {
    totalXP,
    currentLevel,
    currentLeague,
    streakDays,
    achievements,
    leaderboard,
    userRank,
    isLoading: gamificationLoading,
    addDailyLoginXP,
    updateStreakDays,
    refreshStats,
    refreshLeaderboard,
    getXPToNextLevel,
    getCurrentLevelProgress,
    getLeagueInfo,
    hasAchievement,
    getStreakBonus,
    isOnStreak,
    getDaysUntilStreakMilestone,
    showLevelUpModal,
    showAchievementModal
  } = useGamification()
  
  const [loading, setLoading] = useState(true)
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [todayStats, setTodayStats] = useState({
    completedLessons: 0,
    weeklyGoal: 5,
    weeklyProgress: 0,
    dailyGoalProgress: 0
  })

  // 초기 데이터 로딩
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // 병렬로 데이터 로딩
        
        // 일일 로그인 XP 추가 (하루에 한 번만)
        const lastLoginDate = localStorage.getItem('lastLoginDate')
        const today = new Date().toDateString()
        
        if (lastLoginDate !== today) {
          await addDailyLoginXP()
          await updateStreakDays()
          localStorage.setItem('lastLoginDate', today)
          setWelcomeMessage('일일 로그인 보너스 +5 XP! 🎉')
        }
        
      } catch (error) {
        console.error('Dashboard data loading error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardData()
  }, [dispatch, refreshStats, refreshLeaderboard, currentLeague, addDailyLoginXP, updateStreakDays])

  // 웰컴 메시지 자동 해제
  useEffect(() => {
    if (welcomeMessage) {
      const timer = setTimeout(() => {
        setWelcomeMessage('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [welcomeMessage])

  // 아이콘 렌더링 함수
  const renderIcon = (iconName, className = "w-5 h-5") => {
    const iconMap = {
      MessageCircle: <MessageCircle className={className} />,
      Film: <Film className={className} />,
      BookOpen: <BookOpen className={className} />,
      Map: <Map className={className} />
    }
    return iconMap[iconName] || <MessageCircle className={className} />
  }

  // 색상 클래스 반환 함수
  const getColorClasses = (color) => {
    const colorMap = {
      primary: { bg: 'bg-blue-100', text: 'text-blue-600', solid: 'bg-blue-600' },
      secondary: { bg: 'bg-purple-100', text: 'text-purple-600', solid: 'bg-purple-600' },
      success: { bg: 'bg-green-100', text: 'text-green-600', solid: 'bg-green-600' },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-600', solid: 'bg-yellow-600' },
      error: { bg: 'bg-red-100', text: 'text-red-600', solid: 'bg-red-600' }
    }
    return colorMap[color] || colorMap.primary
  }

  // 난이도별 스타일 반환 함수
  const getDifficultyStyle = (difficulty) => {
    const styleMap = {
      '초급': 'bg-green-100 text-green-700',
      '중급': 'bg-yellow-100 text-yellow-700',
      '고급': 'bg-red-100 text-red-700'
    }
    return styleMap[difficulty] || 'bg-gray-100 text-gray-700'
  }

  // 점수별 색상 반환 함수
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  // 순위별 색상 반환 함수
  const getRankColor = (rank) => {
    const colorMap = {
      1: 'text-yellow-600',
      2: 'text-gray-500',
      3: 'text-orange-600'
    }
    return colorMap[rank] || 'text-gray-400'
  }

  // 로딩 상태
  if (loading || authLoading || gamificationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="대시보드를 불러오는 중..." />
      </div>
    )
  }

  const activeSubscriptions = getSubscriptionStatus()
  const hasAnySubscription = activeSubscriptions.length > 0
  const levelProgress = getCurrentLevelProgress()
  const leagueInfo = getLeagueInfo()
  const streakBonus = getStreakBonus()
  const nextMilestone = getDaysUntilStreakMilestone()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to={ROUTES.HOME} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-blue-600">SpitKorean</span>
              </Link>
              <span className="text-gray-400">|</span>
              <TUI>대시보드</TUI>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 알림 */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="w-5 h-5" />
                {welcomeMessage && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {/* 설정 */}
              <Link to={ROUTES.PROFILE.SETTINGS}>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </Link>
              
              {/* 프로필 */}
              <Link to={ROUTES.PROFILE.BASE}>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {getUserDisplayName()}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 환영 메시지 및 알림 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <T>안녕하세요, {getUserDisplayName()}님! 👋</T>
              </h1>
              <TBlock 
                as="p" 
                className="text-gray-600"
                context="general"
              >
                {isOnStreak() 
                  ? `🔥 ${streakDays}일 연속 학습 중! ${streakBonus > 1 ? `XP ${streakBonus}배 보너스 적용!` : ''}`
                  : '오늘도 한국어 학습을 시작해보세요!'
                }
              </TBlock>
            </div>
            
            {/* 레벨 진행률 */}
            <div className="hidden md:block">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl font-bold text-blue-600">
                    Lv.{currentLevel}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{totalXP.toLocaleString()} XP</span>
                      <span>{getXPToNextLevel()} XP <T>남음</T></span>
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${levelProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 웰컴 메시지 알림 */}
          {welcomeMessage && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">{welcomeMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* 연속 학습 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  <TUI>연속 학습</TUI>
                </p>
                <p className="text-3xl font-bold text-gray-900">{streakDays}일</p>
                {nextMilestone && (
                  <p className="text-xs text-gray-500 mt-1">
                    <T>{nextMilestone}일까지 {nextMilestone - streakDays}일</T>
                  </p>
                )}
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <T>{streakBonus > 1 ? `XP ${streakBonus}배 보너스!` : '연속 학습 유지!'}</T>
              </div>
            </div>
          </div>

          {/* 총 XP */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  <TUI>총 XP</TUI>
                </p>
                <p className="text-3xl font-bold text-gray-900">{totalXP.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <T>레벨 {currentLevel}</T>
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Award className="w-4 h-4 mr-1" />
                <T>{leagueInfo.name} 리그</T>
              </div>
            </div>
          </div>

          {/* 완료한 레슨 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  <TUI>이번 주 학습</TUI>
                </p>
                <p className="text-3xl font-bold text-gray-900">{todayStats.weeklyProgress}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <T>목표: {todayStats.weeklyGoal}개</T>
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(todayStats.weeklyProgress / todayStats.weeklyGoal) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 순위 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  <TUI>리그 순위</TUI>
                </p>
                <p className="text-3xl font-bold text-gray-900">#{userRank || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <T>{leagueInfo.name} 리그</T>
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to={ROUTES.COMMON.LEADERBOARD}>
                <div className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  <TUI>전체 순위 보기</TUI>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* 왼쪽: 메인 컨텐츠 */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 구독 중인 상품들 */}
            {hasAnySubscription ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    <TUI>내 학습 코스</TUI>
                  </h2>
                  <Link to={ROUTES.SUBSCRIPTION.PLANS}>
                    <Button variant="outline" size="sm" leftIcon={<Plus />} textKey="코스 추가하기" />
                  </Link>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {PRODUCT_LIST.filter(product => 
                    hasActiveSubscription(product.id)
                  ).map((product) => {
                    const colors = getColorClasses(product.color)
                    
                    return (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`${colors.bg} p-2 rounded-lg`}>
                              {renderIcon(product.icon, `${colors.text} w-5 h-5`)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                <T>{product.nameKr}</T>
                              </h3>
                              <p className="text-sm text-gray-500">
                                <T>{product.tag}</T>
                              </p>
                            </div>
                          </div>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <TUI>활성</TUI>
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>
                              <TUI>이번 주 진도</TUI>
                            </span>
                            <span>75%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`${colors.solid} h-2 rounded-full`} style={{ width: '75%' }}></div>
                          </div>
                        </div>
                        
                        <Link to={product.route}>
                          <Button variant="outline" size="sm" fullWidth rightIcon={<Play />} textKey="학습 계속하기" />
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* 구독 상품이 없는 경우 */
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    <T>학습을 시작해보세요!</T>
                  </h2>
                  <TBlock 
                    as="p" 
                    className="text-gray-600"
                    context="general"
                  >
                    SpitKorean의 4가지 학습 코스 중에서 선택하여 한국어 학습을 시작하세요.
                  </TBlock>
                </div>
                
                <Link to={ROUTES.SUBSCRIPTION.PLANS}>
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight />} textKey="학습 코스 선택하기" />
                </Link>
              </div>
            )}

            {/* 추천 학습 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                <TUI>오늘의 추천 학습</TUI>
              </h2>
              
              <div className="space-y-4">
                {[
                  {
                    type: 'talk',
                    title: '일상 대화 연습',
                    description: '카페에서 주문하기 상황 대화',
                    duration: '15분',
                    difficulty: '초급',
                    icon: 'MessageCircle',
                    color: 'primary',
                    xpReward: 10
                  },
                  {
                    type: 'test',
                    title: 'TOPIK 모의고사',
                    description: '듣기 영역 10문제',
                    duration: '20분',
                    difficulty: '중급',
                    icon: 'BookOpen',
                    color: 'success',
                    xpReward: 20
                  },
                  {
                    type: 'journey',
                    title: '발음 교정 연습',
                    description: '받침 발음 집중 훈련',
                    duration: '10분',
                    difficulty: '초급',
                    icon: 'Map',
                    color: 'warning',
                    xpReward: 12
                  }
                ].map((lesson, index) => {
                  const isSubscribed = hasActiveSubscription(lesson.type)
                  const colors = getColorClasses(lesson.color)
                  const difficultyStyle = getDifficultyStyle(lesson.difficulty)
                  const bonusXP = Math.floor(lesson.xpReward * streakBonus)
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`${colors.bg} p-3 rounded-lg`}>
                          {renderIcon(lesson.icon, `${colors.text} w-5 h-5`)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            <T>{lesson.title}</T>
                          </h3>
                          <p className="text-sm text-gray-500">
                            <T>{lesson.description}</T>
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {lesson.duration}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${difficultyStyle}`}>
                              <T>{lesson.difficulty}</T>
                            </span>
                            {isSubscribed && (
                              <span className="text-xs text-blue-600 flex items-center">
                                <Star className="w-3 h-3 mr-1" />
                                +{bonusXP} XP
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isSubscribed ? (
                          <Button variant="primary" size="sm" rightIcon={<Play />} textKey="시작하기" />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Lock className="w-4 h-4 text-gray-400" />
                            <Link to={ROUTES.SUBSCRIPTION.PLANS}>
                              <Button variant="outline" size="sm" textKey="구독하기" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                <TUI>최근 활동</TUI>
              </h2>
              
              <div className="space-y-4">
                {[
                  { type: 'lesson', title: 'Talk: 카페 주문하기', time: '2시간 전', score: 85, xp: 10 },
                  { type: 'test', title: 'TOPIK 문법 연습', time: '어제', score: 92, xp: 20 },
                  { type: 'journey', title: '발음 연습: ㄱ,ㄲ,ㅋ', time: '2일 전', score: 78, xp: 12 },
                  { type: 'drama', title: '드라마: 사랑의 불시착', time: '3일 전', score: 88, xp: 15 }
                ].map((activity, index) => {
                  const scoreColor = getScoreColor(activity.score)
                  
                  return (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          <T>{activity.title}</T>
                        </h4>
                        <p className="text-sm text-gray-500">
                          <T>{activity.time}</T>
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className={`text-sm font-medium ${scoreColor}`}>
                            {activity.score}점
                          </div>
                          <div className="text-xs text-blue-600">
                            +{activity.xp} XP
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* 더 보기 링크 */}
              <div className="mt-6 text-center">
                <Link to={ROUTES.PROFILE.BASE + '/activity'}>
                  <Button variant="ghost" size="sm" textKey="전체 활동 보기" />
                </Link>
              </div>
            </div>
          </div>

          {/* 오른쪽: 사이드바 */}
          <div className="space-y-6">
            
            {/* 리그 순위 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  <T>{leagueInfo.name} 리그</T>
                </h3>
                <Trophy className={`w-5 h-5 ${leagueInfo.color || 'text-yellow-500'}`} />
              </div>
              
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((player, index) => {
                  const rank = index + 1
                  const rankColor = getRankColor(rank)
                  const isCurrentUser = player.userId === user?.id
                  const containerClass = isCurrentUser 
                    ? 'bg-blue-50 border border-blue-200 flex items-center justify-between p-2 rounded-lg'
                    : 'flex items-center justify-between p-2 rounded-lg hover:bg-gray-50'
                  const nameClass = isCurrentUser
                    ? 'text-sm font-semibold text-blue-900'
                    : 'text-sm text-gray-900'
                  
                  return (
                    <div key={player.userId || rank} className={containerClass}>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium ${rankColor}`}>
                          #{rank}
                        </span>
                        <span className={nameClass}>
                          {isCurrentUser ? getUserDisplayName() : (player.name || `사용자${rank}`)}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs text-blue-600">(나)</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">{player.weeklyXP || (1500 - rank * 100)} XP</span>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link to={ROUTES.COMMON.LEADERBOARD}>
                  <Button variant="outline" size="sm" fullWidth textKey="전체 순위 보기" />
                </Link>
              </div>
            </div>

            {/* 이번 주 목표 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                <TUI>이번 주 목표</TUI>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span><TUI>대화 연습</TUI></span>
                    <span>3/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span><TUI>문제 풀이</TUI></span>
                    <span>12/20</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span><TUI>발음 연습</TUI></span>
                    <span>1/3</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 성취 배지 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  <TUI>최근 획득 배지</TUI>
                </h3>
                <Link to={ROUTES.COMMON.ACHIEVEMENTS}>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: '7_day_streak', name: '7일 연속', icon: 'Flame', color: 'warning' },
                  { id: 'first_perfect', name: '첫 100점', icon: 'Star', color: 'warning' },
                  { id: 'talk_master', name: '대화왕', icon: 'MessageCircle', color: 'primary' },
                  { id: 'grammar_expert', name: '문법마스터', icon: 'BookOpen', color: 'success' },
                  { id: 'pronunciation_master', name: '발음완벽', icon: 'Map', color: 'warning' },
                  { id: 'xp_1000', name: 'XP 1000', icon: 'Zap', color: 'error' }
                ].map((badge, index) => {
                  const colors = getColorClasses(badge.color)
                  const earned = hasAchievement(badge.id)
                  
                  return (
                    <div key={index} className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        earned ? colors.bg : 'bg-gray-100'
                      }`}>
                        {badge.icon === 'Flame' && <Flame className={`w-6 h-6 ${earned ? colors.text : 'text-gray-400'}`} />}
                        {badge.icon === 'Star' && <Star className={`w-6 h-6 ${earned ? colors.text : 'text-gray-400'}`} />}
                        {badge.icon === 'MessageCircle' && <MessageCircle className={`w-6 h-6 ${earned ? colors.text : 'text-gray-400'}`} />}
                        {badge.icon === 'BookOpen' && <BookOpen className={`w-6 h-6 ${earned ? colors.text : 'text-gray-400'}`} />}
                        {badge.icon === 'Map' && <Map className={`w-6 h-6 ${earned ? colors.text : 'text-gray-400'}`} />}
                        {badge.icon === 'Zap' && <Zap className={`w-6 h-6 ${earned ? colors.text : 'text-gray-400'}`} />}
                      </div>
                      <p className={`text-xs ${earned ? 'text-gray-600' : 'text-gray-400'}`}>
                        <T>{badge.name}</T>
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                <TUI>빠른 시작</TUI>
              </h3>
              
              <div className="space-y-3">
                <Link to={ROUTES.TALK.BASE}>
                  <Button variant="outline" size="sm" fullWidth leftIcon={<MessageCircle />} textKey="AI와 대화하기" />
                </Link>
                <Link to={ROUTES.TEST.BASE}>
                  <Button variant="outline" size="sm" fullWidth leftIcon={<BookOpen />} textKey="문제 풀기" />
                </Link>
                <Link to={ROUTES.SUBSCRIPTION.PLANS}>
                  <Button variant="primary" size="sm" fullWidth leftIcon={<Plus />} textKey="새 코스 추가" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard