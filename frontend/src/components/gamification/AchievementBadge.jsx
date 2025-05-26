import React, { useState } from 'react'
import { Award, Lock, Star, Trophy, Crown, Medal, Target, Zap } from 'lucide-react'
import { clsx } from 'clsx'
import { useGamification } from '@hooks/useGamification'
import { ACHIEVEMENT_IDS } from '@api/gamification'
import { Modal } from '@components/common/Modal'

/**
 * 배지 컴포넌트
 */
const AchievementBadge = ({
  achievement,
  size = 'md',
  variant = 'default',
  unlocked = false,
  showTooltip = true,
  showProgress = false,
  progress = 0,
  className,
  onClick,
  ...props
}) => {
  const [showModal, setShowModal] = useState(false)
  
  // size별 스타일 정의
  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg',
    xl: 'w-24 h-24 text-xl'
  }
  
  // variant별 스타일 정의
  const variants = {
    default: unlocked ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-gray-100 border-gray-300 text-gray-400',
    gold: unlocked ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-400',
    silver: unlocked ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-400',
    bronze: unlocked ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-400',
    diamond: unlocked ? 'bg-gradient-to-br from-blue-400 to-purple-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-400',
    fire: unlocked ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-400',
    ice: unlocked ? 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'
  }
  
  // 배지 아이콘 가져오기
  const getBadgeIcon = () => {
    if (!achievement) return <Award />
    
    // 기본 아이콘 매핑
    const iconMap = {
      [ACHIEVEMENT_IDS.STREAK_7_DAYS]: '🔥',
      [ACHIEVEMENT_IDS.STREAK_30_DAYS]: '🔥🔥',
      [ACHIEVEMENT_IDS.STREAK_100_DAYS]: '🔥🔥🔥',
      [ACHIEVEMENT_IDS.GRAMMAR_EXPERT]: '📚',
      [ACHIEVEMENT_IDS.PRONUNCIATION_MASTER]: '🎤',
      [ACHIEVEMENT_IDS.VOCABULARY_HERO]: '💬',
      [ACHIEVEMENT_IDS.TEST_ACE]: '🎯',
      [ACHIEVEMENT_IDS.TOPIK_MASTER]: '👑',
      [ACHIEVEMENT_IDS.SOCIAL_BUTTERFLY]: '🦋',
      [ACHIEVEMENT_IDS.MENTOR]: '🎓',
      [ACHIEVEMENT_IDS.CONSISTENT_LEARNER]: '📅',
      [ACHIEVEMENT_IDS.SPEED_LEARNER]: '⚡',
      [ACHIEVEMENT_IDS.PERFECTIONIST]: '💎',
      [ACHIEVEMENT_IDS.TALK_MASTER]: '💬',
      [ACHIEVEMENT_IDS.DRAMA_BUILDER]: '🎭',
      [ACHIEVEMENT_IDS.TEST_CHAMPION]: '🏆',
      [ACHIEVEMENT_IDS.JOURNEY_EXPLORER]: '🗺️'
    }
    
    return iconMap[achievement.id] || achievement.icon || '🏅'
  }
  
  // 배지 등급별 테두리 효과
  const getBorderEffect = () => {
    if (!unlocked) return ''
    
    switch (variant) {
      case 'gold': return 'ring-2 ring-yellow-400 ring-opacity-50'
      case 'silver': return 'ring-2 ring-gray-400 ring-opacity-50'
      case 'bronze': return 'ring-2 ring-orange-400 ring-opacity-50'
      case 'diamond': return 'ring-2 ring-blue-400 ring-opacity-50 animate-pulse'
      case 'fire': return 'ring-2 ring-red-400 ring-opacity-50'
      case 'ice': return 'ring-2 ring-blue-400 ring-opacity-50'
      default: return 'ring-2 ring-yellow-400 ring-opacity-30'
    }
  }
  
  const handleClick = () => {
    onClick?.()
    if (achievement) {
      setShowModal(true)
    }
  }
  
  return (
    <>
      <div
        className={clsx(
          'relative rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105',
          sizes[size],
          variants[variant],
          getBorderEffect(),
          !unlocked && 'opacity-60',
          className
        )}
        onClick={handleClick}
        title={showTooltip && achievement ? achievement.name : undefined}
        {...props}
      >
        {/* 배지 아이콘 */}
        <div className="flex items-center justify-center">
          {typeof getBadgeIcon() === 'string' ? (
            <span className={clsx(
              size === 'xs' ? 'text-sm' :
              size === 'sm' ? 'text-lg' :
              size === 'md' ? 'text-2xl' :
              size === 'lg' ? 'text-3xl' : 'text-4xl'
            )}>
              {getBadgeIcon()}
            </span>
          ) : (
            <div className={clsx(
              size === 'xs' ? 'w-4 h-4' :
              size === 'sm' ? 'w-6 h-6' :
              size === 'md' ? 'w-8 h-8' :
              size === 'lg' ? 'w-10 h-10' : 'w-12 h-12'
            )}>
              {getBadgeIcon()}
            </div>
          )}
        </div>
        
        {/* 잠금 표시 */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-20 rounded-full">
            <Lock className={clsx(
              size === 'xs' ? 'w-3 h-3' :
              size === 'sm' ? 'w-4 h-4' :
              size === 'md' ? 'w-5 h-5' :
              size === 'lg' ? 'w-6 h-6' : 'w-7 h-7',
              'text-gray-500'
            )} />
          </div>
        )}
        
        {/* 진행률 표시 */}
        {showProgress && !unlocked && progress > 0 && (
          <div className="absolute -bottom-1 left-0 right-0">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}
        
        {/* 새로 획득한 배지 표시 */}
        {unlocked && achievement?.isNew && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        )}
      </div>
      
      {/* 배지 상세 모달 */}
      {achievement && (
        <AchievementModal
          achievement={achievement}
          unlocked={unlocked}
          progress={progress}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

// 배지 상세 모달
const AchievementModal = ({ achievement, unlocked, progress, isOpen, onClose }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      case 'expert': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="배지 정보"
      size="md"
    >
      <div className="text-center">
        {/* 배지 */}
        <div className="mb-6">
          <AchievementBadge
            achievement={achievement}
            unlocked={unlocked}
            size="xl"
            variant={achievement.variant || 'gold'}
            showTooltip={false}
            className="mx-auto"
          />
        </div>
        
        {/* 배지 정보 */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{achievement.name}</h3>
            <p className="text-gray-600 mt-1">{achievement.description}</p>
          </div>
          
          {/* 달성 조건 */}
          {achievement.requirements && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">달성 조건</h4>
              <p className="text-sm text-gray-600">{achievement.requirements}</p>
            </div>
          )}
          
          {/* 진행률 */}
          {!unlocked && progress > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">진행률</h4>
              <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-sm text-blue-700">{Math.round(progress)}% 완료</p>
            </div>
          )}
          
          {/* 난이도 */}
          {achievement.difficulty && (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-gray-500">난이도:</span>
              <span className={clsx(
                'px-2 py-1 rounded-full text-xs font-medium',
                getDifficultyColor(achievement.difficulty)
              )}>
                {achievement.difficulty.toUpperCase()}
              </span>
            </div>
          )}
          
          {/* 획득일 */}
          {unlocked && achievement.unlockedAt && (
            <div className="text-sm text-gray-500">
              획득일: {new Date(achievement.unlockedAt).toLocaleDateString('ko-KR')}
            </div>
          )}
          
          {/* 보상 */}
          {achievement.reward && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">보상</h4>
              <p className="text-sm text-yellow-700">{achievement.reward}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

// 미리 정의된 배지 변형들
export const GoldBadge = (props) => <AchievementBadge variant="gold" {...props} />
export const SilverBadge = (props) => <AchievementBadge variant="silver" {...props} />
export const BronzeBadge = (props) => <AchievementBadge variant="bronze" {...props} />
export const DiamondBadge = (props) => <AchievementBadge variant="diamond" {...props} />
export const FireBadge = (props) => <AchievementBadge variant="fire" {...props} />
export const IceBadge = (props) => <AchievementBadge variant="ice" {...props} />

// 배지 그리드 컴포넌트
export const AchievementGrid = ({ 
  achievements = [], 
  unlockedAchievements = [],
  columns = 4,
  showProgress = true,
  className 
}) => {
  const { hasAchievement } = useGamification()
  
  return (
    <div className={clsx(
      'grid gap-4',
      columns === 3 ? 'grid-cols-3' :
      columns === 4 ? 'grid-cols-4' :
      columns === 5 ? 'grid-cols-5' :
      columns === 6 ? 'grid-cols-6' : 'grid-cols-4',
      className
    )}>
      {achievements.map((achievement) => {
        const isUnlocked = hasAchievement(achievement.id)
        
        return (
          <div key={achievement.id} className="flex flex-col items-center space-y-2">
            <AchievementBadge
              achievement={achievement}
              unlocked={isUnlocked}
              showProgress={showProgress}
              progress={achievement.progress || 0}
              variant={achievement.variant || 'default'}
              size="lg"
            />
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                {achievement.name}
              </div>
              {!isUnlocked && showProgress && achievement.progress > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(achievement.progress)}% 달성
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 최근 획득한 배지 표시
export const RecentAchievements = ({ className, limit = 3 }) => {
  const { achievements } = useGamification()
  
  const recentAchievements = achievements
    .filter(achievement => achievement.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
    .slice(0, limit)
  
  if (recentAchievements.length === 0) {
    return null
  }
  
  return (
    <div className={clsx(
      'bg-white rounded-lg border border-gray-200 p-4',
      className
    )}>
      <h3 className="font-medium text-gray-900 mb-3">최근 획득한 배지</h3>
      
      <div className="space-y-3">
        {recentAchievements.map((achievement) => (
          <div key={achievement.id} className="flex items-center space-x-3">
            <AchievementBadge
              achievement={achievement}
              unlocked={true}
              size="sm"
              variant={achievement.variant || 'gold'}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {achievement.name}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(achievement.unlockedAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 배지 카테고리별 표시
export const AchievementCategories = ({ className }) => {
  const { achievements } = useGamification()
  
  const categories = {
    learning: { name: '학습', icon: '📚', achievements: [] },
    streak: { name: '연속 학습', icon: '🔥', achievements: [] },
    skill: { name: '실력', icon: '💪', achievements: [] },
    social: { name: '소셜', icon: '👥', achievements: [] },
    special: { name: '특별', icon: '⭐', achievements: [] }
  }
  
  // 배지를 카테고리별로 분류
  achievements.forEach(achievement => {
    if (achievement.id.includes('streak')) {
      categories.streak.achievements.push(achievement)
    } else if (achievement.id.includes('social') || achievement.id.includes('mentor')) {
      categories.social.achievements.push(achievement)
    } else if (achievement.id.includes('expert') || achievement.id.includes('master')) {
      categories.skill.achievements.push(achievement)
    } else if (achievement.id.includes('special') || achievement.id.includes('diamond')) {
      categories.special.achievements.push(achievement)
    } else {
      categories.learning.achievements.push(achievement)
    }
  })
  
  return (
    <div className={clsx('space-y-6', className)}>
      {Object.entries(categories).map(([categoryKey, category]) => {
        if (category.achievements.length === 0) return null
        
        return (
          <div key={categoryKey}>
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-4">
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <span className="text-sm font-normal text-gray-500">
                ({category.achievements.length})
              </span>
            </h3>
            
            <AchievementGrid
              achievements={category.achievements}
              columns={4}
              showProgress={true}
            />
          </div>
        )
      })}
    </div>
  )
}

// 배지 진행률 요약
export const AchievementProgress = ({ className }) => {
  const { achievements } = useGamification()
  
  const totalAchievements = achievements.length
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const progressPercent = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0
  
  return (
    <div className={clsx(
      'bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">배지 수집 진행률</h3>
        <Trophy className="w-6 h-6" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>{unlockedCount} / {totalAchievements} 배지 획득</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <div className="text-center text-sm opacity-90">
          {progressPercent === 100 ? (
            "🏆 모든 배지를 수집했습니다!"
          ) : progressPercent >= 75 ? (
            "거의 다 모았어요! 조금만 더 힘내세요!"
          ) : progressPercent >= 50 ? (
            "절반을 넘겼네요! 계속 도전해보세요!"
          ) : progressPercent >= 25 ? (
            "좋은 시작이에요! 더 많은 배지에 도전해보세요!"
          ) : (
            "배지 수집을 시작해보세요!"
          )}
        </div>
      </div>
    </div>
  )
}

// 상품별 배지 표시
export const ProductAchievements = ({ product, className }) => {
  const { achievements } = useGamification()
  
  const productAchievements = achievements.filter(achievement => 
    achievement.id.toLowerCase().includes(product.toLowerCase())
  )
  
  const productInfo = {
    talk: { name: 'Talk Like You Mean It', icon: '💬', color: 'blue' },
    drama: { name: 'Drama Builder', icon: '🎭', color: 'purple' },
    test: { name: 'Test & Study', icon: '🎯', color: 'yellow' },
    journey: { name: 'Korean Journey', icon: '🗺️', color: 'green' }
  }
  
  const info = productInfo[product] || { name: product, icon: '🏅', color: 'gray' }
  
  return (
    <div className={clsx(
      'bg-white border border-gray-200 rounded-lg p-4',
      className
    )}>
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg">{info.icon}</span>
        <h3 className="font-semibold text-gray-900">{info.name}</h3>
        <span className="text-sm text-gray-500">
          ({productAchievements.length} 배지)
        </span>
      </div>
      
      {productAchievements.length > 0 ? (
        <AchievementGrid
          achievements={productAchievements}
          columns={3}
          showProgress={true}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">아직 이 상품의 배지가 없습니다</p>
        </div>
      )}
    </div>
  )
}

// 인라인 배지 표시 (작은 공간용)
export const InlineAchievementBadge = ({ achievement, size = 'xs', className, ...props }) => (
  <AchievementBadge
    achievement={achievement}
    unlocked={true}
    size={size}
    showTooltip={true}
    className={clsx('inline-block', className)}
    {...props}
  />
)

// 배지 획득 애니메이션
export const AchievementUnlockAnimation = ({ achievement, onComplete, className }) => {
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
      <div className="animate-bounce">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-6 rounded-xl shadow-2xl text-center">
          <div className="mb-4">
            <AchievementBadge
              achievement={achievement}
              unlocked={true}
              size="xl"
              variant="gold"
              className="mx-auto animate-pulse"
            />
          </div>
          <h3 className="text-xl font-bold mb-2">새로운 배지 획득!</h3>
          <p className="text-lg">{achievement.name}</p>
          <div className="mt-3 text-2xl">🎉</div>
        </div>
      </div>
    </div>
  )
}

// 배지 통계 카드
export const AchievementStats = ({ className }) => {
  const { achievements } = useGamification()
  
  const stats = {
    total: achievements.length,
    unlocked: achievements.filter(a => a.unlocked).length,
    recent: achievements.filter(a => {
      if (!a.unlockedAt) return false
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(a.unlockedAt) > weekAgo
    }).length,
    rare: achievements.filter(a => a.difficulty === 'expert' && a.unlocked).length
  }
  
  return (
    <div className={clsx(
      'bg-white border border-gray-200 rounded-lg p-6',
      className
    )}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">배지 통계</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.unlocked}</div>
          <div className="text-sm text-blue-800">획득한 배지</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
          <div className="text-sm text-gray-800">전체 배지</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.recent}</div>
          <div className="text-sm text-green-800">이번 주 획득</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.rare}</div>
          <div className="text-sm text-purple-800">희귀 배지</div>
        </div>
      </div>
    </div>
  )
}

export default AchievementBadge