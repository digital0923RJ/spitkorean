import React from 'react'
import { Flame, Calendar, Award, Target } from 'lucide-react'
import { clsx } from 'clsx'
import { useGamification } from '@hooks/useGamification'

/**
 * 연속 학습일 표시 컴포넌트
 */
const StreakCounter = ({
  variant = 'default',
  size = 'md',
  showMilestone = true,
  showLongest = true,
  animated = true,
  className,
  ...props
}) => {
  const { 
    streakDays, 
    longestStreak, 
    isOnStreak,
    getDaysUntilStreakMilestone 
  } = useGamification()
  
  // variant별 스타일 정의
  const variants = {
    default: 'bg-white border border-gray-200 text-gray-900',
    fire: 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white',
    ice: 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white',
    success: 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white',
    minimal: 'bg-gray-50 border border-gray-100 text-gray-700',
    dark: 'bg-gray-800 border border-gray-700 text-white',
    rainbow: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white'
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
  const counterClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  )
  
  // 연속 학습 상태에 따른 불꽃 색상
  const getFlameColor = () => {
    if (streakDays === 0) return 'text-gray-400'
    if (streakDays >= 100) return 'text-red-500'
    if (streakDays >= 30) return 'text-orange-500'
    if (streakDays >= 7) return 'text-yellow-500'
    return 'text-blue-500'
  }
  
  // 마일스톤 정보
  const daysToMilestone = getDaysUntilStreakMilestone()
  
  // 연속 학습 레벨 계산
  const getStreakLevel = () => {
    if (streakDays >= 365) return 'Master'
    if (streakDays >= 100) return 'Expert'
    if (streakDays >= 30) return 'Pro'
    if (streakDays >= 7) return 'Rising'
    return 'Beginner'
  }
  
  return (
    <div className={counterClasses} {...props}>
      {/* 배경 효과 */}
      {variant !== 'minimal' && variant !== 'default' && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
      )}
      
      <div className="relative z-0 flex items-center space-x-3">
        {/* 불꽃 아이콘 (애니메이션) */}
        <div className={clsx(
          'flex-shrink-0 p-2 rounded-full',
          variant === 'default' || variant === 'minimal' ? 'bg-red-50' : 'bg-white/20'
        )}>
          <Flame className={clsx(
            iconSizes[size],
            animated && isOnStreak() && 'animate-pulse',
            variant === 'default' || variant === 'minimal' ? getFlameColor() : 'text-white'
          )} />
        </div>
        
        {/* 연속 학습 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className={clsx(
              'font-bold',
              size === 'xs' ? 'text-sm' :
              size === 'sm' ? 'text-base' :
              size === 'md' ? 'text-lg' :
              size === 'lg' ? 'text-xl' : 'text-2xl'
            )}>
              {streakDays}일
            </span>
            
            <span className={clsx(
              'text-xs font-medium opacity-75',
              size === 'xs' && 'hidden'
            )}>
              연속 학습
            </span>
            
            {/* 연속 학습 레벨 */}
            {showMilestone && (
              <span className={clsx(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                variant === 'default' || variant === 'minimal' ? 
                  'bg-orange-100 text-orange-800' : 'bg-white/20 text-white'
              )}>
                {getStreakLevel()}
              </span>
            )}
          </div>
          
          {/* 추가 정보 */}
          <div className={clsx(
            'flex items-center justify-between text-xs opacity-75',
            size === 'xs' && 'hidden'
          )}>
            {showLongest && (
              <span>최고: {longestStreak}일</span>
            )}
            
            {daysToMilestone && (
              <span>다음 마일스톤: {daysToMilestone}일 후</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 미리 정의된 연속 학습 카운터 변형들
export const FireStreakCounter = (props) => (
  <StreakCounter variant="fire" {...props} />
)

export const IceStreakCounter = (props) => (
  <StreakCounter variant="ice" {...props} />
)

export const MinimalStreakCounter = (props) => (
  <StreakCounter variant="minimal" size="sm" showLongest={false} {...props} />
)

export const CompactStreakCounter = (props) => (
  <StreakCounter variant="default" size="xs" showMilestone={false} showLongest={false} {...props} />
)

// 헤더용 연속 학습 표시
export const HeaderStreakDisplay = ({ className, ...props }) => {
  const { streakDays, isOnStreak } = useGamification()
  
  return (
    <div className={clsx(
      'flex items-center space-x-2 px-3 py-1 rounded-full',
      isOnStreak() ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600',
      className
    )} {...props}>
      <Flame className={clsx(
        'w-4 h-4',
        isOnStreak() ? 'text-orange-500' : 'text-gray-400'
      )} />
      <span className="text-sm font-medium">{streakDays}</span>
    </div>
  )
}

// 대시보드용 연속 학습 카드
export const DashboardStreakCard = ({ className, ...props }) => {
  const { 
    streakDays, 
    longestStreak, 
    getDaysUntilStreakMilestone,
    isOnStreak 
  } = useGamification()
  
  const daysToMilestone = getDaysUntilStreakMilestone()
  
  return (
    <div className={clsx(
      'bg-white rounded-xl border border-gray-200 p-6 shadow-sm',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">연속 학습</h3>
        <Calendar className="w-5 h-5 text-orange-500" />
      </div>
      
      <StreakCounter variant="fire" size="lg" className="mb-4" {...props} />
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="font-medium text-orange-900">현재</div>
          <div className="text-2xl font-bold text-orange-600">{streakDays}</div>
          <div className="text-orange-500">일</div>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="font-medium text-red-900">최고 기록</div>
          <div className="text-2xl font-bold text-red-600">{longestStreak}</div>
          <div className="text-red-500">일</div>
        </div>
      </div>
      
      {/* 다음 마일스톤 */}
      {daysToMilestone && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-900">
              다음 마일스톤까지
            </span>
            <span className="text-lg font-bold text-yellow-600">
              {daysToMilestone}일
            </span>
          </div>
          <div className="mt-2 w-full bg-yellow-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((streakDays % (streakDays + daysToMilestone)) / (streakDays + daysToMilestone)) * 100}%` 
              }}
            />
          </div>
        </div>
      )}
      
      {/* 격려 메시지 */}
      <div className="mt-4 text-center">
        {!isOnStreak() ? (
          <p className="text-sm text-gray-500">
            오늘 학습을 시작해서 연속 기록을 쌓아보세요! 🔥
          </p>
        ) : streakDays === 1 ? (
          <p className="text-sm text-green-600">
            연속 학습 시작! 내일도 계속해보세요! 💪
          </p>
        ) : streakDays < 7 ? (
          <p className="text-sm text-blue-600">
            좋은 시작이에요! 7일 마일스톤까지 {7 - streakDays}일 남았어요! 🎯
          </p>
        ) : streakDays < 30 ? (
          <p className="text-sm text-purple-600">
            훌륭해요! 30일 마일스톤까지 {30 - streakDays}일 남았어요! 🌟
          </p>
        ) : (
          <p className="text-sm text-red-600">
            놀라워요! 당신은 진정한 학습 마스터입니다! 🏆
          </p>
        )}
      </div>
    </div>
  )
}

// 연속 학습 히트맵 (주간 뷰)
export const StreakHeatmap = ({ className, days = 7 }) => {
  const { streakDays } = useGamification()
  
  return (
    <div className={clsx('flex space-x-1', className)}>
      {Array.from({ length: days }, (_, i) => {
        const dayIndex = days - 1 - i
        const isActive = dayIndex < streakDays
        
        return (
          <div
            key={i}
            className={clsx(
              'w-4 h-4 rounded-sm transition-colors',
              isActive ? 'bg-green-500' : 'bg-gray-200'
            )}
            title={`${dayIndex + 1}일 전`}
          />
        )
      })}
    </div>
  )
}

// 연속 학습 마일스톤 표시
export const StreakMilestones = ({ className }) => {
  const { streakDays } = useGamification()
  
  const milestones = [
    { days: 7, title: '7일 연속', icon: '🔥', reached: streakDays >= 7 },
    { days: 30, title: '30일 연속', icon: '🏅', reached: streakDays >= 30 },
    { days: 100, title: '100일 연속', icon: '👑', reached: streakDays >= 100 },
    { days: 365, title: '1년 연속', icon: '🏆', reached: streakDays >= 365 }
  ]
  
  return (
    <div className={clsx('space-y-3', className)}>
      <h4 className="text-sm font-medium text-gray-900 mb-3">마일스톤</h4>
      
      {milestones.map((milestone) => (
        <div
          key={milestone.days}
          className={clsx(
            'flex items-center space-x-3 p-2 rounded-lg transition-colors',
            milestone.reached ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
          )}
        >
          <span className="text-lg">{milestone.icon}</span>
          <div className="flex-1">
            <div className={clsx(
              'text-sm font-medium',
              milestone.reached ? 'text-green-900' : 'text-gray-600'
            )}>
              {milestone.title}
            </div>
            <div className={clsx(
              'text-xs',
              milestone.reached ? 'text-green-600' : 'text-gray-500'
            )}>
              {milestone.reached ? '달성!' : `${milestone.days - streakDays}일 남음`}
            </div>
          </div>
          
          {milestone.reached && (
            <Award className="w-4 h-4 text-green-500" />
          )}
        </div>
      ))}
    </div>
  )
}

// 인라인 연속 학습 표시
export const InlineStreakDisplay = ({ className, showIcon = true, ...props }) => {
  const { streakDays, isOnStreak } = useGamification()
  
  return (
    <span className={clsx(
      'inline-flex items-center space-x-1 text-sm',
      className
    )} {...props}>
      {showIcon && (
        <Flame className={clsx(
          'w-4 h-4',
          isOnStreak() ? 'text-orange-500' : 'text-gray-400'
        )} />
      )}
      <span className={clsx(
        'font-medium',
        isOnStreak() ? 'text-orange-600' : 'text-gray-600'
      )}>
        {streakDays}일 연속
      </span>
    </span>
  )
}

// 연속 학습 챌린지 위젯
export const StreakChallenge = ({ targetDays = 30, className }) => {
  const { streakDays } = useGamification()
  const progress = Math.min((streakDays / targetDays) * 100, 100)
  const daysLeft = Math.max(targetDays - streakDays, 0)
  
  return (
    <div className={clsx(
      'bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span className="font-medium">{targetDays}일 챌린지</span>
        </div>
        <span className="text-sm opacity-75">{daysLeft}일 남음</span>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>{streakDays}일</span>
          <span>{targetDays}일</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="text-center text-sm">
        {progress === 100 ? (
          <span className="font-bold">🎉 챌린지 완료!</span>
        ) : (
          <span>
            {Math.round(progress)}% 달성 - 거의 다 왔어요!
          </span>
        )}
      </div>
    </div>
  )
}

export default StreakCounter