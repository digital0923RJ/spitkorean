import React from 'react'
import { Star, TrendingUp, Award, Zap } from 'lucide-react'
import { clsx } from 'clsx'
import { useGamification } from '@hooks/useGamification'

/**
 * XP 표시 컴포넌트
 */
const XPDisplay = ({
  variant = 'default',
  size = 'md',
  showProgress = true,
  showLevel = true,
  showAnimation = true,
  className,
  ...props
}) => {
  const { 
    totalXP, 
    currentLevel, 
    getXPToNextLevel, 
    getCurrentLevelProgress,
    showXPAnimation,
    recentXPGain
  } = useGamification()
  
  // variant별 스타일 정의
  const variants = {
    default: 'bg-white border border-gray-200 text-gray-900',
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    warning: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white',
    error: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
    gold: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white',
    cosmic: 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white',
    minimal: 'bg-gray-50 border border-gray-100 text-gray-700'
  }
  
  // size별 스타일 정의
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
    xl: 'px-8 py-6 text-xl'
  }
  
  // 아이콘 크기
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }
  
  // 기본 클래스
  const baseClasses = 'relative overflow-hidden rounded-lg shadow-sm transition-all duration-300 hover:shadow-md'
  
  // 최종 클래스 조합
  const displayClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  )
  
  // XP 포맷팅
  const formatXP = (xp) => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`
    return xp.toLocaleString()
  }
  
  // 다음 레벨까지 남은 XP
  const xpToNext = getXPToNextLevel()
  const progressPercent = getCurrentLevelProgress()
  
  return (
    <div className={displayClasses} {...props}>
      {/* 배경 효과 */}
      {variant !== 'minimal' && variant !== 'default' && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
      )}
      
      {/* XP 애니메이션 오버레이 */}
      {showAnimation && showXPAnimation && recentXPGain && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="animate-bounce text-yellow-300 font-bold text-lg">
            +{recentXPGain.amount} XP!
          </div>
        </div>
      )}
      
      <div className="relative z-0 flex items-center space-x-3">
        {/* XP 아이콘 */}
        <div className={clsx(
          'flex-shrink-0 p-2 rounded-full',
          variant === 'default' || variant === 'minimal' ? 'bg-yellow-100' : 'bg-white/20'
        )}>
          <Star className={clsx(
            iconSizes[size],
            variant === 'default' || variant === 'minimal' ? 'text-yellow-600' : 'text-white'
          )} />
        </div>
        
        {/* XP 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className={clsx(
                'font-bold',
                size === 'xs' ? 'text-sm' :
                size === 'sm' ? 'text-base' :
                size === 'md' ? 'text-lg' :
                size === 'lg' ? 'text-xl' : 'text-2xl'
              )}>
                {formatXP(totalXP)} XP
              </span>
              
              {showLevel && (
                <span className={clsx(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  variant === 'default' || variant === 'minimal' ? 
                    'bg-blue-100 text-blue-800' : 'bg-white/20 text-white'
                )}>
                  Lv.{currentLevel}
                </span>
              )}
            </div>
            
            {/* 다음 레벨까지 */}
            {showProgress && xpToNext > 0 && (
              <span className={clsx(
                'text-xs font-medium opacity-75',
                size === 'xs' && 'hidden'
              )}>
                {formatXP(xpToNext)} to next
              </span>
            )}
          </div>
          
          {/* 진행률 바 */}
          {showProgress && (
            <div className={clsx(
              'w-full rounded-full overflow-hidden',
              size === 'xs' ? 'h-1' :
              size === 'sm' ? 'h-1.5' :
              size === 'md' ? 'h-2' :
              size === 'lg' ? 'h-2.5' : 'h-3',
              variant === 'default' || variant === 'minimal' ? 'bg-gray-200' : 'bg-white/20'
            )}>
              <div
                className={clsx(
                  'h-full transition-all duration-500 ease-out',
                  variant === 'default' || variant === 'minimal' ? 
                    'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white/60'
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 미리 정의된 XP 디스플레이 변형들
export const SimpleXPDisplay = (props) => (
  <XPDisplay variant="minimal" size="sm" showProgress={false} {...props} />
)

export const CompactXPDisplay = (props) => (
  <XPDisplay variant="default" size="xs" showLevel={false} {...props} />
)

export const GoldXPDisplay = (props) => (
  <XPDisplay variant="gold" size="lg" {...props} />
)

export const CosmicXPDisplay = (props) => (
  <XPDisplay variant="cosmic" size="xl" {...props} />
)

// 헤더용 XP 표시
export const HeaderXPDisplay = ({ className, ...props }) => (
  <XPDisplay
    variant="default"
    size="sm"
    showProgress={false}
    className={clsx('border-0 shadow-none bg-transparent', className)}
    {...props}
  />
)

// 대시보드용 XP 카드
export const DashboardXPCard = ({ className, ...props }) => {
  const { 
    totalXP, 
    currentLevel, 
    weeklyXP, 
    getStreakBonus 
  } = useGamification()
  
  const streakMultiplier = getStreakBonus()
  
  return (
    <div className={clsx(
      'bg-white rounded-xl border border-gray-200 p-6 shadow-sm',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">나의 경험치</h3>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>
      
      <XPDisplay variant="primary" size="lg" className="mb-4" {...props} />
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="font-medium text-blue-900">이번 주</div>
          <div className="text-xl font-bold text-blue-600">{weeklyXP.toLocaleString()}</div>
          <div className="text-blue-500">XP</div>
        </div>
        
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="font-medium text-yellow-900">보너스</div>
          <div className="text-xl font-bold text-yellow-600">x{streakMultiplier}</div>
          <div className="text-yellow-500">배율</div>
        </div>
      </div>
    </div>
  )
}

// 리더보드용 XP 표시
export const LeaderboardXPDisplay = ({ xp, rank, isCurrentUser = false, ...props }) => (
  <div className={clsx(
    'flex items-center space-x-3 p-3 rounded-lg transition-colors',
    isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
  )}>
    <div className={clsx(
      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
      rank === 1 ? 'bg-yellow-100 text-yellow-800' :
      rank === 2 ? 'bg-gray-100 text-gray-700' :
      rank === 3 ? 'bg-orange-100 text-orange-800' :
      'bg-gray-50 text-gray-600'
    )}>
      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
    </div>
    
    <div className="flex-1">
      <div className="flex items-center space-x-2">
        <Star className="w-4 h-4 text-yellow-500" />
        <span className="font-medium">{xp.toLocaleString()} XP</span>
      </div>
    </div>
    
    {isCurrentUser && (
      <div className="flex-shrink-0">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          나
        </span>
      </div>
    )}
  </div>
)

// 상품별 특화 XP 표시
export const TalkXPDisplay = (props) => (
  <XPDisplay variant="primary" {...props} />
)

export const DramaXPDisplay = (props) => (
  <XPDisplay variant="secondary" {...props} />
)

export const TestXPDisplay = (props) => (
  <XPDisplay variant="warning" {...props} />
)

export const JourneyXPDisplay = (props) => (
  <XPDisplay variant="success" {...props} />
)

// XP 획득 애니메이션 컴포넌트
export const XPGainAnimation = ({ amount, onComplete, className }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.()
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [onComplete])
  
  return (
    <div className={clsx(
      'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none',
      className
    )}>
      <div className="animate-bounce">
        <div className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full shadow-lg font-bold text-lg flex items-center space-x-2">
          <Star className="w-6 h-6" />
          <span>+{amount} XP!</span>
          <Zap className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

// 레벨업 축하 컴포넌트
export const LevelUpCelebration = ({ newLevel, onComplete, className }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.()
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [onComplete])
  
  return (
    <div className={clsx(
      'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none',
      className
    )}>
      <div className="animate-pulse">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl shadow-2xl font-bold text-xl flex items-center space-x-3">
          <Award className="w-8 h-8" />
          <span>레벨 {newLevel} 달성!</span>
          <div className="text-2xl">🎉</div>
        </div>
      </div>
    </div>
  )
}

// 인라인 XP 표시 (작은 공간용)
export const InlineXPDisplay = ({ xp, size = 'sm', showIcon = true, className, ...props }) => (
  <span className={clsx(
    'inline-flex items-center space-x-1',
    size === 'xs' ? 'text-xs' :
    size === 'sm' ? 'text-sm' : 'text-base',
    className
  )} {...props}>
    {showIcon && <Star className={clsx(
      size === 'xs' ? 'w-3 h-3' :
      size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
      'text-yellow-500'
    )} />}
    <span className="font-medium">{xp?.toLocaleString() || 0} XP</span>
  </span>
)

// 프로그레스 바만 있는 XP 표시
export const XPProgressBar = ({ 
  currentXP, 
  nextLevelXP, 
  className,
  size = 'md',
  showLabels = true,
  color = 'blue'
}) => {
  const progress = nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 100
  
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-400 to-yellow-500',
    red: 'from-red-500 to-red-600'
  }
  
  return (
    <div className={clsx('w-full', className)}>
      {showLabels && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{currentXP.toLocaleString()} XP</span>
          <span>{nextLevelXP.toLocaleString()} XP</span>
        </div>
      )}
      
      <div className={clsx(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        size === 'xs' ? 'h-1' :
        size === 'sm' ? 'h-2' :
        size === 'md' ? 'h-3' :
        size === 'lg' ? 'h-4' : 'h-5'
      )}>
        <div
          className={clsx(
            'h-full bg-gradient-to-r transition-all duration-700 ease-out',
            colorClasses[color]
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      {showLabels && (
        <div className="text-center text-xs text-gray-500 mt-1">
          {Math.round(progress)}% 달성
        </div>
      )}
    </div>
  )
}

export default XPDisplay