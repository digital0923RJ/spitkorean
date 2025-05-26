import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gamificationAPI, gamificationEvents } from '@api/gamification'
import toast from 'react-hot-toast'

// 비동기 액션들
export const updateXP = createAsyncThunk(
  'gamification/updateXP',
  async ({ activity, amount, metadata }, { rejectWithValue, getState }) => {
    try {
      const response = await gamificationAPI.updateXP({ activity, amount, metadata })
      
      if (response.status === 'success') {
        gamificationEvents.emitXPGain(response.data)
        
        // XP 획득 토스트 표시
        if (amount > 0) {
          toast.success(`🎉 ${amount} XP 획득!`, {
            icon: '⭐',
            duration: 2000,
            style: {
              background: '#FEF3C7',
              color: '#92400E'
            }
          })
        }
        
        return response.data
      }
      
      return rejectWithValue(response.message || 'XP 업데이트에 실패했습니다.')
    } catch (error) {
      return rejectWithValue(error.message || 'XP 업데이트 중 오류가 발생했습니다.')
    }
  }
)

export const updateStreak = createAsyncThunk(
  'gamification/updateStreak',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gamificationAPI.updateStreak()
      
      if (response.status === 'success') {
        const { streak_days, is_milestone } = response.data
        
        gamificationEvents.emitStreakUpdate(response.data)
        
        // 연속 학습 토스트
        if (streak_days === 1) {
          toast.success('🔥 연속 학습 시작!', { duration: 2000 })
        } else if (is_milestone) {
          toast.success(`🏆 ${streak_days}일 연속 학습 달성!`, {
            icon: '🔥',
            duration: 3000,
            style: {
              background: '#FEE2E2',
              color: '#991B1B'
            }
          })
        } else {
          toast.success(`🔥 ${streak_days}일 연속!`, { duration: 1500 })
        }
        
        return response.data
      }
      
      return rejectWithValue(response.message || '연속 학습 업데이트에 실패했습니다.')
    } catch (error) {
      return rejectWithValue(error.message || '연속 학습 업데이트 중 오류가 발생했습니다.')
    }
  }
)

export const fetchLeaderboard = createAsyncThunk(
  'gamification/fetchLeaderboard',
  async ({ league, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await gamificationAPI.getLeaderboard({ league, limit })
      
      if (response.status === 'success') {
        return response.data
      }
      
      return rejectWithValue(response.message || '리더보드 조회에 실패했습니다.')
    } catch (error) {
      return rejectWithValue(error.message || '리더보드 조회 중 오류가 발생했습니다.')
    }
  }
)

export const fetchUserStats = createAsyncThunk(
  'gamification/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gamificationAPI.getUserStats()
      
      if (response.status === 'success') {
        return response.data
      }
      
      return rejectWithValue(response.message || '사용자 통계 조회에 실패했습니다.')
    } catch (error) {
      return rejectWithValue(error.message || '사용자 통계 조회 중 오류가 발생했습니다.')
    }
  }
)

export const unlockAchievement = createAsyncThunk(
  'gamification/unlockAchievement',
  async ({ achievementId }, { rejectWithValue }) => {
    try {
      const response = await gamificationAPI.unlockAchievement({ achievementId })
      
      if (response.status === 'success') {
        const achievement = response.data.achievement
        
        gamificationEvents.emitAchievementUnlock(achievement)
        
        // 배지 획득 토스트
        toast.success(`🏅 새로운 배지: ${achievement.name}`, {
          icon: '🎖️',
          duration: 4000,
          style: {
            background: '#D1FAE5',
            color: '#065F46'
          }
        })
        
        return response.data
      }
      
      return rejectWithValue(response.message || '배지 획득에 실패했습니다.')
    } catch (error) {
      return rejectWithValue(error.message || '배지 획득 중 오류가 발생했습니다.')
    }
  }
)

export const checkLevelUp = createAsyncThunk(
  'gamification/checkLevelUp',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState()
      const currentXP = state.gamification.totalXP
      
      const response = await gamificationAPI.checkLevelUp({ currentXP })
      
      if (response.status === 'success' && response.data.leveled_up) {
        const { new_level, new_league } = response.data
        
        gamificationEvents.emitLevelUp(response.data)
        
        // 레벨업 토스트
        toast.success(`🎊 레벨 ${new_level} 달성!`, {
          icon: '🌟',
          duration: 5000,
          style: {
            background: '#EDE9FE',
            color: '#5B21B6'
          }
        })
        
        // 리그 승급 토스트
        if (new_league) {
          toast.success(`👑 ${new_league} 리그 진출!`, {
            icon: '🏆',
            duration: 5000,
            style: {
              background: '#FEF3C7',
              color: '#92400E'
            }
          })
        }
        
        return response.data
      }
      
      return { leveled_up: false }
    } catch (error) {
      return rejectWithValue(error.message || '레벨 확인 중 오류가 발생했습니다.')
    }
  }
)

// 초기 상태
const initialState = {
  // 사용자 게임화 데이터
  totalXP: 0,
  weeklyXP: 0,
  currentLevel: 1,
  currentLeague: 'bronze',
  streakDays: 0,
  longestStreak: 0,
  
  // 배지 및 업적
  achievements: [],
  unlockedAchievements: [],
  
  // 리더보드
  leaderboard: [],
  userRank: null,
  
  // 통계
  stats: {
    totalActivities: 0,
    totalStudyTime: 0,
    averageScore: 0,
    completedLessons: 0
  },
  
  // 로딩 상태
  isLoading: false,
  isXPUpdateLoading: false,
  isStreakUpdateLoading: false,
  isLeaderboardLoading: false,
  isStatsLoading: false,
  isAchievementLoading: false,
  isLevelCheckLoading: false,
  
  // 에러 상태
  error: null,
  xpError: null,
  streakError: null,
  leaderboardError: null,
  statsError: null,
  achievementError: null,
  
  // 성공 상태
  recentXPGain: null,
  recentAchievement: null,
  recentLevelUp: null,
  
  // 기타
  lastActivityTime: null,
  dailyGoalProgress: 0,
  weeklyGoalProgress: 0,
  
  // UI 상태
  showXPAnimation: false,
  showLevelUpModal: false,
  showAchievementModal: false,
}

// Redux Slice
const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    // 에러 클리어
    clearErrors: (state) => {
      state.error = null
      state.xpError = null
      state.streakError = null
      state.leaderboardError = null
      state.statsError = null
      state.achievementError = null
    },
    
    // 성공 상태 리셋
    resetSuccessStates: (state) => {
      state.recentXPGain = null
      state.recentAchievement = null
      state.recentLevelUp = null
    },
    
    // UI 상태 업데이트
    setShowXPAnimation: (state, action) => {
      state.showXPAnimation = action.payload
    },
    
    setShowLevelUpModal: (state, action) => {
      state.showLevelUpModal = action.payload
    },
    
    setShowAchievementModal: (state, action) => {
      state.showAchievementModal = action.payload
    },
    
    // 실시간 데이터 업데이트
    updateUserRank: (state, action) => {
      state.userRank = action.payload
    },
    
    updateDailyProgress: (state, action) => {
      state.dailyGoalProgress = action.payload
    },
    
    updateWeeklyProgress: (state, action) => {
      state.weeklyGoalProgress = action.payload
    },
    
    // 활동 시간 업데이트
    setLastActivityTime: (state) => {
      state.lastActivityTime = new Date().toISOString()
    },
    
    // 임시 XP 표시 (애니메이션용)
    setTempXPGain: (state, action) => {
      state.recentXPGain = action.payload
      state.showXPAnimation = true
    }
  },
  
  extraReducers: (builder) => {
    // XP 업데이트
    builder
      .addCase(updateXP.pending, (state) => {
        state.isXPUpdateLoading = true
        state.xpError = null
      })
      .addCase(updateXP.fulfilled, (state, action) => {
        state.isXPUpdateLoading = false
        state.totalXP = action.payload.total_xp
        state.weeklyXP = action.payload.weekly_xp
        state.currentLevel = action.payload.current_level
        state.currentLeague = action.payload.current_league
        state.recentXPGain = action.payload.xp_gained
        state.lastActivityTime = new Date().toISOString()
        state.xpError = null
      })
      .addCase(updateXP.rejected, (state, action) => {
        state.isXPUpdateLoading = false
        state.xpError = action.payload
      })
    
    // 연속 학습 업데이트
    builder
      .addCase(updateStreak.pending, (state) => {
        state.isStreakUpdateLoading = true
        state.streakError = null
      })
      .addCase(updateStreak.fulfilled, (state, action) => {
        state.isStreakUpdateLoading = false
        state.streakDays = action.payload.streak_days
        state.longestStreak = action.payload.longest_streak
        state.lastActivityTime = new Date().toISOString()
        state.streakError = null
      })
      .addCase(updateStreak.rejected, (state, action) => {
        state.isStreakUpdateLoading = false
        state.streakError = action.payload
      })
    
    // 리더보드 조회
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLeaderboardLoading = true
        state.leaderboardError = null
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLeaderboardLoading = false
        state.leaderboard = action.payload.leaderboard
        state.userRank = action.payload.user_rank
        state.leaderboardError = null
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLeaderboardLoading = false
        state.leaderboardError = action.payload
      })
    
    // 사용자 통계 조회
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.isStatsLoading = true
        state.statsError = null
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.isStatsLoading = false
        state.stats = action.payload.stats
        state.dailyGoalProgress = action.payload.daily_progress
        state.weeklyGoalProgress = action.payload.weekly_progress
        state.statsError = null
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isStatsLoading = false
        state.statsError = action.payload
      })
    
    // 배지 획득
    builder
      .addCase(unlockAchievement.pending, (state) => {
        state.isAchievementLoading = true
        state.achievementError = null
      })
      .addCase(unlockAchievement.fulfilled, (state, action) => {
        state.isAchievementLoading = false
        state.unlockedAchievements.push(action.payload.achievement)
        state.recentAchievement = action.payload.achievement
        state.showAchievementModal = true
        state.achievementError = null
      })
      .addCase(unlockAchievement.rejected, (state, action) => {
        state.isAchievementLoading = false
        state.achievementError = action.payload
      })
    
    // 레벨 확인
    builder
      .addCase(checkLevelUp.pending, (state) => {
        state.isLevelCheckLoading = true
      })
      .addCase(checkLevelUp.fulfilled, (state, action) => {
        state.isLevelCheckLoading = false
        
        if (action.payload.leveled_up) {
          state.currentLevel = action.payload.new_level
          state.currentLeague = action.payload.new_league || state.currentLeague
          state.recentLevelUp = action.payload
          state.showLevelUpModal = true
        }
      })
      .addCase(checkLevelUp.rejected, (state, action) => {
        state.isLevelCheckLoading = false
      })
  },
})

// 액션 내보내기
export const {
  clearErrors,
  resetSuccessStates,
  setShowXPAnimation,
  setShowLevelUpModal,
  setShowAchievementModal,
  updateUserRank,
  updateDailyProgress,
  updateWeeklyProgress,
  setLastActivityTime,
  setTempXPGain
} = gamificationSlice.actions

// 셀렉터들
export const selectGamification = (state) => state.gamification
export const selectTotalXP = (state) => state.gamification.totalXP
export const selectCurrentLevel = (state) => state.gamification.currentLevel
export const selectCurrentLeague = (state) => state.gamification.currentLeague
export const selectStreakDays = (state) => state.gamification.streakDays
export const selectAchievements = (state) => state.gamification.unlockedAchievements
export const selectLeaderboard = (state) => state.gamification.leaderboard
export const selectUserRank = (state) => state.gamification.userRank
export const selectIsLoading = (state) => state.gamification.isLoading

// 리듀서 내보내기
export default gamificationSlice.reducer