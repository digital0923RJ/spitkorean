import api, { cachedGet, clearCache } from './index'
import { API_ENDPOINTS } from '@shared/constants/api'

// 게임화 관련 API 함수들
export const gamificationAPI = {
  // XP 업데이트
  updateXP: async ({ activity, amount, metadata = {} }) => {
    const response = await api.post('/common/streak', {
      activity,
      amount,
      metadata,
      timestamp: new Date().toISOString()
    })
    
    // 캐시 무효화
    clearCache('/common/gamification')
    clearCache('/common/league-ranking')
    
    return response.data
  },

  // 연속 학습 업데이트
  updateStreak: async () => {
    const response = await api.post('/common/streak')
    
    // 캐시 무효화
    clearCache('/common/gamification')
    
    return response.data
  },

  // 사용자 게임화 정보 조회
  getUserStats: async (useCache = true) => {
    const response = await cachedGet('/common/gamification', {
      useCache,
      ttl: 5 * 60 * 1000 // 5분 캐시
    })
    return response.data
  },

  // 리더보드 조회
  getLeaderboard: async ({ league = null, limit = 10, useCache = true }) => {
    const params = new URLSearchParams()
    if (league) params.append('league', league)
    params.append('limit', limit.toString())
    
    const url = `/common/league-ranking?${params.toString()}`
    
    const response = await cachedGet(url, {
      useCache,
      ttl: 2 * 60 * 1000 // 2분 캐시
    })
    return response.data
  },

  // 배지 획득
  unlockAchievement: async ({ achievementId, metadata = {} }) => {
    const response = await api.post('/common/achievement', {
      achievement_id: achievementId,
      metadata,
      timestamp: new Date().toISOString()
    })
    
    // 캐시 무효화
    clearCache('/common/gamification')
    
    return response.data
  },

  // 레벨업 확인
  checkLevelUp: async ({ currentXP }) => {
    const response = await api.post('/common/level-check', {
      current_xp: currentXP
    })
    
    return response.data
  },

  // 일일 목표 설정
  setDailyGoal: async ({ goalType, targetValue }) => {
    const response = await api.post('/common/daily-goal', {
      goal_type: goalType,
      target_value: targetValue
    })
    
    return response.data
  },

  // 주간 목표 설정
  setWeeklyGoal: async ({ goalType, targetValue }) => {
    const response = await api.post('/common/weekly-goal', {
      goal_type: goalType,
      target_value: targetValue
    })
    
    return response.data
  },

  // 목표 진행률 조회
  getGoalProgress: async (useCache = true) => {
    const response = await cachedGet('/common/goal-progress', {
      useCache,
      ttl: 1 * 60 * 1000 // 1분 캐시
    })
    return response.data
  },

  // 활동 기록 조회
  getActivityHistory: async ({ period = 'week', limit = 50 }) => {
    const params = new URLSearchParams({
      period,
      limit: limit.toString()
    })
    
    const response = await api.get(`/common/activity-history?${params.toString()}`)
    return response.data
  },

  // 통계 요약 조회
  getStatsSummary: async ({ period = 'month' }) => {
    const response = await api.get(`/common/stats-summary?period=${period}`)
    return response.data
  },

  // 모든 배지 목록 조회
  getAllAchievements: async (useCache = true) => {
    const response = await cachedGet('/common/achievements', {
      useCache,
      ttl: 30 * 60 * 1000 // 30분 캐시 (배지 목록은 자주 바뀌지 않음)
    })
    return response.data
  },

  // 리그 정보 조회
  getLeagueInfo: async (useCache = true) => {
    const response = await cachedGet('/common/league-info', {
      useCache,
      ttl: 60 * 60 * 1000 // 1시간 캐시
    })
    return response.data
  },

  // 친구 목록 조회
  getFriends: async () => {
    const response = await api.get('/common/friends')
    return response.data
  },

  // 친구 추가
  addFriend: async ({ friendId }) => {
    const response = await api.post('/common/friends', {
      friend_id: friendId
    })
    return response.data
  },

  // 친구 삭제
  removeFriend: async ({ friendId }) => {
    const response = await api.delete(`/common/friends/${friendId}`)
    return response.data
  },

  // 친구 순위 조회
  getFriendsRanking: async () => {
    const response = await api.get('/common/friends-ranking')
    return response.data
  }
}

// XP 활동 타입 정의
export const XP_ACTIVITIES = {
  DAILY_LOGIN: 'daily_login',
  COMPLETE_LESSON: 'complete_lesson',
  PERFECT_SCORE: 'perfect_score',
  STREAK_MILESTONE: 'streak_milestone',
  LEVEL_UP: 'level_up',
  CHALLENGE_COMPLETE: 'challenge_complete',
  GRAMMAR_MASTERY: 'grammar_mastery',
  PRONUNCIATION_PERFECT: 'pronunciation_perfect',
  SHARE_PROGRESS: 'share_progress',
  INVITE_FRIEND: 'invite_friend',
  
  // 상품별 활동
  TALK_CHAT: 'talk_chat',
  TALK_PERFECT_CONVERSATION: 'talk_perfect_conversation',
  DRAMA_SENTENCE_COMPLETE: 'drama_sentence_complete',
  DRAMA_EPISODE_COMPLETE: 'drama_episode_complete',
  TEST_QUIZ_COMPLETE: 'test_quiz_complete',
  TEST_PERFECT_SCORE: 'test_perfect_score',
  JOURNEY_READING_COMPLETE: 'journey_reading_complete',
  JOURNEY_PRONUNCIATION_PERFECT: 'journey_pronunciation_perfect'
}

// 배지 ID 정의
export const ACHIEVEMENT_IDS = {
  // 연속 학습 배지
  STREAK_7_DAYS: '7_day_streak',
  STREAK_30_DAYS: '30_day_streak',
  STREAK_100_DAYS: '100_day_streak',
  
  // 전문성 배지
  GRAMMAR_EXPERT: 'grammar_expert',
  PRONUNCIATION_MASTER: 'pronunciation_master',
  VOCABULARY_HERO: 'vocabulary_hero',
  
  // 시험 배지
  TEST_ACE: 'test_ace',
  TOPIK_MASTER: 'topik_master',
  
  // 소셜 배지
  SOCIAL_BUTTERFLY: 'social_butterfly',
  MENTOR: 'mentor',
  
  // 학습 배지
  CONSISTENT_LEARNER: 'consistent_learner',
  SPEED_LEARNER: 'speed_learner',
  PERFECTIONIST: 'perfectionist',
  
  // 상품별 배지
  TALK_MASTER: 'talk_master',
  DRAMA_BUILDER: 'drama_builder',
  TEST_CHAMPION: 'test_champion',
  JOURNEY_EXPLORER: 'journey_explorer'
}

// 리그 등급 정의
export const LEAGUES = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  DIAMOND: 'diamond'
}

// 리그별 정보
export const LEAGUE_INFO = {
  bronze: {
    name: '브론즈 리그',
    minXP: 0,
    color: '#CD7F32',
    icon: '🥉',
    benefits: ['기본 학습 기능']
  },
  silver: {
    name: '실버 리그',
    minXP: 500,
    color: '#C0C0C0',
    icon: '🥈',
    benefits: ['추가 힌트 기능', '특별 콘텐츠 접근']
  },
  gold: {
    name: '골드 리그',
    minXP: 1500,
    color: '#FFD700',
    icon: '🥇',
    benefits: ['프리미엄 피드백', '개인 맞춤 학습']
  },
  diamond: {
    name: '다이아몬드 리그',
    minXP: 3000,
    color: '#B9F2FF',
    icon: '💎',
    benefits: ['모든 기능 무제한', '전문가 상담']
  }
}

// 게임화 이벤트 관련
export const gamificationEvents = {
  // XP 획득 이벤트 발생
  emitXPGain: (data) => {
    window.dispatchEvent(new CustomEvent('gamification:xp-gained', { detail: data }))
  },

  // 연속 학습 업데이트 이벤트 발생
  emitStreakUpdate: (data) => {
    window.dispatchEvent(new CustomEvent('gamification:streak-updated', { detail: data }))
  },

  // 배지 획득 이벤트 발생
  emitAchievementUnlock: (achievement) => {
    window.dispatchEvent(new CustomEvent('gamification:achievement-unlocked', { detail: achievement }))
  },

  // 레벨업 이벤트 발생
  emitLevelUp: (data) => {
    window.dispatchEvent(new CustomEvent('gamification:level-up', { detail: data }))
  },

  // 리그 승급 이벤트 발생
  emitLeaguePromotion: (data) => {
    window.dispatchEvent(new CustomEvent('gamification:league-promotion', { detail: data }))
  },

  // 게임화 이벤트 리스너 등록
  onGamificationEvent: (callback) => {
    const handleXPGain = (event) => callback({ type: 'xp-gained', data: event.detail })
    const handleStreakUpdate = (event) => callback({ type: 'streak-updated', data: event.detail })
    const handleAchievementUnlock = (event) => callback({ type: 'achievement-unlocked', data: event.detail })
    const handleLevelUp = (event) => callback({ type: 'level-up', data: event.detail })
    const handleLeaguePromotion = (event) => callback({ type: 'league-promotion', data: event.detail })
    
    window.addEventListener('gamification:xp-gained', handleXPGain)
    window.addEventListener('gamification:streak-updated', handleStreakUpdate)
    window.addEventListener('gamification:achievement-unlocked', handleAchievementUnlock)
    window.addEventListener('gamification:level-up', handleLevelUp)
    window.addEventListener('gamification:league-promotion', handleLeaguePromotion)
    
    // 클리너 함수 반환
    return () => {
      window.removeEventListener('gamification:xp-gained', handleXPGain)
      window.removeEventListener('gamification:streak-updated', handleStreakUpdate)
      window.removeEventListener('gamification:achievement-unlocked', handleAchievementUnlock)
      window.removeEventListener('gamification:level-up', handleLevelUp)
      window.removeEventListener('gamification:league-promotion', handleLeaguePromotion)
    }
  }
}

// 유틸리티 함수들
export const gamificationUtils = {
  // XP에서 레벨 계산
  calculateLevel: (totalXP) => {
    if (totalXP < 100) return 1
    if (totalXP < 300) return 2
    if (totalXP < 600) return 3
    if (totalXP < 1000) return 4
    if (totalXP < 1500) return 5
    return Math.floor(Math.log2(totalXP / 1500)) + 6
  },

  // 다음 레벨까지 필요한 XP 계산
  getXPToNextLevel: (currentXP) => {
    const level = gamificationUtils.calculateLevel(currentXP)
    const nextLevelXP = level === 1 ? 100 : 
                      level === 2 ? 300 :
                      level === 3 ? 600 :
                      level === 4 ? 1000 :
                      level === 5 ? 1500 :
                      1500 * Math.pow(2, level - 5)
    
    return nextLevelXP - currentXP
  },

  // 리그 결정
  determineLeague: (totalXP) => {
    if (totalXP >= 3000) return LEAGUES.DIAMOND
    if (totalXP >= 1500) return LEAGUES.GOLD
    if (totalXP >= 500) return LEAGUES.SILVER
    return LEAGUES.BRONZE
  },

  // 연속 학습 마일스톤 체크
  isStreakMilestone: (days) => {
    return [7, 30, 50, 100, 200, 365].includes(days)
  },

  // 배지 조건 체크
  checkAchievementConditions: (stats, activity) => {
    const unlockable = []
    
    // 연속 학습 배지
    if (stats.streakDays === 7) {
      unlockable.push(ACHIEVEMENT_IDS.STREAK_7_DAYS)
    }
    if (stats.streakDays === 30) {
      unlockable.push(ACHIEVEMENT_IDS.STREAK_30_DAYS)
    }
    if (stats.streakDays === 100) {
      unlockable.push(ACHIEVEMENT_IDS.STREAK_100_DAYS)
    }
    
    // 전문성 배지
    if (stats.grammarMastery >= 50) {
      unlockable.push(ACHIEVEMENT_IDS.GRAMMAR_EXPERT)
    }
    if (stats.pronunciationAverage >= 95) {
      unlockable.push(ACHIEVEMENT_IDS.PRONUNCIATION_MASTER)
    }
    if (stats.vocabularyMastered >= 500) {
      unlockable.push(ACHIEVEMENT_IDS.VOCABULARY_HERO)
    }
    
    return unlockable
  },

  // XP 애니메이션 지속 시간 계산
  getXPAnimationDuration: (amount) => {
    if (amount >= 100) return 3000 // 3초
    if (amount >= 50) return 2000  // 2초
    if (amount >= 20) return 1500  // 1.5초
    return 1000 // 1초
  }
}

export default gamificationAPI