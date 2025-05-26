import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useCallback, useRef } from 'react'
import {
  updateXP,
  updateStreak,
  fetchLeaderboard,
  fetchUserStats,
  unlockAchievement,
  checkLevelUp,
  clearErrors,
  resetSuccessStates,
  setShowXPAnimation,
  setShowLevelUpModal,
  setShowAchievementModal,
  setLastActivityTime,
  setTempXPGain,
  selectGamification,
  selectTotalXP,
  selectCurrentLevel,
  selectCurrentLeague,
  selectStreakDays,
  selectAchievements,
  selectLeaderboard,
  selectUserRank
} from '@store/slices/gamificationSlice'
import { 
  gamificationEvents, 
  XP_ACTIVITIES, 
  ACHIEVEMENT_IDS, 
  gamificationUtils 
} from '@api/gamification'

/**
 * 게임화 시스템 관련 기능을 제공하는 커스텀 훅
 */
export const useGamification = () => {
  const dispatch = useDispatch()
  const animationTimeoutRef = useRef(null)
  
  // Redux 상태 선택
  const gamification = useSelector(selectGamification)
  const totalXP = useSelector(selectTotalXP)
  const currentLevel = useSelector(selectCurrentLevel)
  const currentLeague = useSelector(selectCurrentLeague)
  const streakDays = useSelector(selectStreakDays)
  const achievements = useSelector(selectAchievements)
  const leaderboard = useSelector(selectLeaderboard)
  const userRank = useSelector(selectUserRank)
  
  // XP 추가 함수
  const addXP = useCallback(async (activity, amount = 10, metadata = {}) => {
    try {
      // 임시 XP 표시 (즉시 피드백)
      dispatch(setTempXPGain({ amount, activity }))
      
      const result = await dispatch(updateXP({ activity, amount, metadata })).unwrap()
      
      // 레벨업 체크
      if (result.total_xp !== totalXP) {
        await dispatch(checkLevelUp())
      }
      
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch, totalXP])
  
  // 연속 학습 업데이트 함수
  const updateStreakDays = useCallback(async () => {
    try {
      const result = await dispatch(updateStreak()).unwrap()
      
      // 연속 학습 마일스톤 체크
      if (gamificationUtils.isStreakMilestone(result.streak_days)) {
        await addXP(XP_ACTIVITIES.STREAK_MILESTONE, 50, {
          milestone_days: result.streak_days
        })
      }
      
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch, addXP])
  
  // 배지 획득 함수
  const unlockBadge = useCallback(async (achievementId, metadata = {}) => {
    try {
      const result = await dispatch(unlockAchievement({ achievementId, metadata })).unwrap()
      
      // 배지 획득 시 XP 보너스
      await addXP('achievement_unlock', 25, { achievement: achievementId })
      
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch, addXP])
  
  // 리더보드 조회 함수
  const refreshLeaderboard = useCallback(async (league = null, limit = 10) => {
    try {
      const result = await dispatch(fetchLeaderboard({ league, limit })).unwrap()
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])
  
  // 사용자 통계 조회 함수
  const refreshStats = useCallback(async () => {
    try {
      const result = await dispatch(fetchUserStats()).unwrap()
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])
  
  // 에러 클리어 함수
  const clearGamificationErrors = useCallback(() => {
    dispatch(clearErrors())
  }, [dispatch])
  
  // 성공 상태 리셋 함수
  const resetGamificationStates = useCallback(() => {
    dispatch(resetSuccessStates())
  }, [dispatch])
  
  // 모달 제어 함수들
  const showLevelUpModal = useCallback(() => {
    dispatch(setShowLevelUpModal(true))
  }, [dispatch])
  
  const hideLevelUpModal = useCallback(() => {
    dispatch(setShowLevelUpModal(false))
  }, [dispatch])
  
  const showAchievementModal = useCallback(() => {
    dispatch(setShowAchievementModal(true))
  }, [dispatch])
  
  const hideAchievementModal = useCallback(() => {
    dispatch(setShowAchievementModal(false))
  }, [dispatch])
  
  // XP 애니메이션 제어
  const triggerXPAnimation = useCallback((amount) => {
    dispatch(setTempXPGain({ amount }))
    dispatch(setShowXPAnimation(true))
    
    // 애니메이션 자동 종료
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    
    animationTimeoutRef.current = setTimeout(() => {
      dispatch(setShowXPAnimation(false))
    }, gamificationUtils.getXPAnimationDuration(amount))
  }, [dispatch])
  
  // 활동 기록 함수 (XP 없이 활동만 기록)
  const recordActivity = useCallback((activity, metadata = {}) => {
    dispatch(setLastActivityTime())
    
    // 백엔드에 활동 기록 (XP 없이)
    // 실제로는 별도 API 호출이 필요할 수 있음
    console.log('Activity recorded:', { activity, metadata, timestamp: new Date().toISOString() })
  }, [dispatch])
  
  // 상품별 XP 추가 함수들
  const addTalkXP = useCallback((amount = 10, metadata = {}) => {
    return addXP(XP_ACTIVITIES.TALK_CHAT, amount, metadata)
  }, [addXP])
  
  const addDramaXP = useCallback((amount = 15, metadata = {}) => {
    return addXP(XP_ACTIVITIES.DRAMA_SENTENCE_COMPLETE, amount, metadata)
  }, [addXP])
  
  const addTestXP = useCallback((amount = 20, metadata = {}) => {
    return addXP(XP_ACTIVITIES.TEST_QUIZ_COMPLETE, amount, metadata)
  }, [addXP])
  
  const addJourneyXP = useCallback((amount = 12, metadata = {}) => {
    return addXP(XP_ACTIVITIES.JOURNEY_READING_COMPLETE, amount, metadata)
  }, [addXP])
  
  // 특별 활동 XP 함수들
  const addPerfectScoreXP = useCallback((subject = 'general') => {
    return addXP(XP_ACTIVITIES.PERFECT_SCORE, 50, { subject })
  }, [addXP])
  
  const addDailyLoginXP = useCallback(() => {
    return addXP(XP_ACTIVITIES.DAILY_LOGIN, 5)
  }, [addXP])
  
  const addCompleteLessonXP = useCallback((lessonType, duration = 0) => {
    const baseXP = 10
    const timeBonus = Math.min(Math.floor(duration / 60), 20) // 분당 1XP, 최대 20XP
    return addXP(XP_ACTIVITIES.COMPLETE_LESSON, baseXP + timeBonus, { 
      lesson_type: lessonType,
      duration 
    })
  }, [addXP])
  
  // 게임화 이벤트 리스너
  useEffect(() => {
    const cleanup = gamificationEvents.onGamificationEvent((event) => {
      switch (event.type) {
        case 'xp-gained':
          console.log('XP gained:', event.data)
          if (event.data.amount > 0) {
            triggerXPAnimation(event.data.amount)
          }
          break
        case 'streak-updated':
          console.log('Streak updated:', event.data)
          break
        case 'achievement-unlocked':
          console.log('Achievement unlocked:', event.data)
          showAchievementModal()
          break
        case 'level-up':
          console.log('Level up:', event.data)
          showLevelUpModal()
          break
        case 'league-promotion':
          console.log('League promotion:', event.data)
          break
      }
    })
    
    return cleanup
  }, [triggerXPAnimation, showAchievementModal, showLevelUpModal])
  
  // 자동 데이터 갱신 (5분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshStats()
        refreshLeaderboard(currentLeague)
      }
    }, 5 * 60 * 1000) // 5분
    
    return () => clearInterval(interval)
  }, [refreshStats, refreshLeaderboard, currentLeague])
  
  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])
  
  // 유틸리티 함수들
  const getXPToNextLevel = useCallback(() => {
    return gamificationUtils.getXPToNextLevel(totalXP)
  }, [totalXP])
  
  const getCurrentLevelProgress = useCallback(() => {
    const currentLevelXP = gamificationUtils.calculateLevel(totalXP)
    const nextLevelXP = gamificationUtils.getXPToNextLevel(totalXP)
    const progress = currentLevelXP > 1 ? 
      ((totalXP - getPreviousLevelXP()) / (nextLevelXP + totalXP - getPreviousLevelXP())) * 100 : 
      (totalXP / 100) * 100
    
    return Math.min(Math.max(progress, 0), 100)
  }, [totalXP])
  
  const getPreviousLevelXP = useCallback(() => {
    const level = currentLevel
    if (level <= 1) return 0
    if (level === 2) return 100
    if (level === 3) return 300
    if (level === 4) return 600
    if (level === 5) return 1000
    return 1500 * Math.pow(2, level - 6)
  }, [currentLevel])
  
  const getLeagueInfo = useCallback(() => {
    return gamificationUtils.determineLeague(totalXP)
  }, [totalXP])
  
  const hasAchievement = useCallback((achievementId) => {
    return achievements.some(achievement => achievement.id === achievementId)
  }, [achievements])
  
  const getStreakBonus = useCallback(() => {
    if (streakDays >= 100) return 3 // 3배 XP
    if (streakDays >= 30) return 2  // 2배 XP
    if (streakDays >= 7) return 1.5 // 1.5배 XP
    return 1 // 기본 XP
  }, [streakDays])
  
  const isOnStreak = useCallback(() => {
    return streakDays > 0
  }, [streakDays])
  
  const getDaysUntilStreakMilestone = useCallback(() => {
    const milestones = [7, 30, 50, 100, 200, 365]
    const nextMilestone = milestones.find(milestone => milestone > streakDays)
    return nextMilestone ? nextMilestone - streakDays : null
  }, [streakDays])
  
  return {
    // 상태
    ...gamification,
    totalXP,
    currentLevel,
    currentLeague,
    streakDays,
    achievements,
    leaderboard,
    userRank,
    
    // 기본 액션 함수들
    addXP,
    updateStreakDays,
    unlockBadge,
    refreshLeaderboard,
    refreshStats,
    clearGamificationErrors,
    resetGamificationStates,
    recordActivity,
    
    // 상품별 XP 함수들
    addTalkXP,
    addDramaXP,
    addTestXP,
    addJourneyXP,
    
    // 특별 활동 XP 함수들
    addPerfectScoreXP,
    addDailyLoginXP,
    addCompleteLessonXP,
    
    // UI 제어 함수들
    showLevelUpModal,
    hideLevelUpModal,
    showAchievementModal,
    hideAchievementModal,
    triggerXPAnimation,
    
    // 유틸리티 함수들
    getXPToNextLevel,
    getCurrentLevelProgress,
    getLeagueInfo,
    hasAchievement,
    getStreakBonus,
    isOnStreak,
    getDaysUntilStreakMilestone
  }
}

export default useGamification