import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { sendChatMessage, getTalkSessions, getTalkSession, getTalkUsage } from '@/api/talk'
import toast from 'react-hot-toast'

// 비동기 액션들
export const sendMessage = createAsyncThunk(
  'talk/sendMessage',
  async ({ message, sessionId, level }, { rejectWithValue, getState }) => {
    try {
      // 사용량 체크
      const { talk } = getState()
      if (talk.usage.remaining <= 0) {
        toast.error('오늘의 대화 횟수를 모두 사용했습니다. 내일 다시 시도해주세요!')
        return rejectWithValue('일일 사용량 초과')
      }
      
      const data = {
        message,
        session_id: sessionId,
        level
      }
      
      const response = await sendChatMessage(data)
      
      if (response.status === 'success') {
        // 첫 메시지인 경우 환영 메시지
        if (!sessionId) {
          toast.success('새로운 대화가 시작되었습니다! 🎉')
        }
        
        // 감정 기반 알림 (선택적)
        const emotion = response.data.emotion
        if (emotion && emotion.confidence > 0.8) {
          switch (emotion.emotion) {
            case 'happy':
              toast('😊 긍정적인 대화네요!', { icon: '💝' })
              break
            case 'sad':
              toast('😢 힘든 이야기를 하고 계시는군요', { icon: '🤗' })
              break
            case 'surprised':
              toast('😲 놀라운 이야기네요!', { icon: '✨' })
              break
            case 'angry':
              toast('😤 화가 나셨나요? 차근차근 이야기해보세요', { icon: '🌱' })
              break
          }
        }
        
        return {
          userMessage: {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
            emotion: null
          },
          aiResponse: {
            role: 'assistant',
            content: response.data.response,
            timestamp: new Date().toISOString(),
            emotion: response.data.emotion
          },
          sessionId: response.data.session_id
        }
      }
      
      toast.error(response.message || '메시지 전송에 실패했습니다.')
      return rejectWithValue(response.message || '메시지 전송에 실패했습니다.')
    } catch (error) {
      toast.error('네트워크 연결을 확인해주세요.')
      return rejectWithValue(error.message || '메시지 전송 중 오류가 발생했습니다.')
    }
  }
)

export const loadSessions = createAsyncThunk(
  'talk/loadSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTalkSessions()
      
      if (response.status === 'success') {
        const sessionCount = response.data.sessions.length
        
        if (sessionCount === 0) {
          toast('첫 대화를 시작해보세요! 💬', { 
            icon: '🎯',
            duration: 3000 
          })
        } else {
          toast.success(`${sessionCount}개의 대화 기록을 불러왔습니다.`)
        }
        
        return response.data.sessions
      }
      
      toast.error(response.message || '대화 기록을 불러올 수 없습니다.')
      return rejectWithValue(response.message || '세션 목록 조회에 실패했습니다.')
    } catch (error) {
      toast.error('대화 기록 로딩 중 문제가 발생했습니다.')
      return rejectWithValue(error.message || '세션 목록 조회 중 오류가 발생했습니다.')
    }
  }
)

export const loadSession = createAsyncThunk(
  'talk/loadSession',
  async ({ sessionId }, { rejectWithValue }) => {
    try {
      const response = await getTalkSession(sessionId)
      
      if (response.status === 'success') {
        const messageCount = response.data.messages.length
        toast.success(`이전 대화를 불러왔습니다. (${messageCount}개 메시지)`)
        
        return response.data
      }
      
      toast.error('해당 대화를 찾을 수 없습니다.')
      return rejectWithValue(response.message || '세션 조회에 실패했습니다.')
    } catch (error) {
      toast.error('대화 불러오기에 실패했습니다.')
      return rejectWithValue(error.message || '세션 조회 중 오류가 발생했습니다.')
    }
  }
)

export const loadUsage = createAsyncThunk(
  'talk/loadUsage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTalkUsage()
      
      if (response.status === 'success') {
        const { remaining, daily_limit } = response.data
        
        // 사용량 알림
        if (remaining === 0) {
          toast.error('오늘의 대화 횟수를 모두 사용했습니다!')
        } else if (remaining <= 5) {
          toast(`⚠️ 오늘 ${remaining}번의 대화가 남았습니다.`, { 
            icon: '⏰',
            duration: 4000 
          })
        } else if (remaining === daily_limit) {
          toast(`오늘 ${daily_limit}번의 대화를 시작할 수 있습니다! 🚀`, { 
            icon: '💪',
            duration: 3000 
          })
        }
        
        return response.data
      }
      
      toast.error('사용량 정보를 불러올 수 없습니다.')
      return rejectWithValue(response.message || '사용량 조회에 실패했습니다.')
    } catch (error) {
      return rejectWithValue(error.message || '사용량 조회 중 오류가 발생했습니다.')
    }
  }
)

export const processVoiceMessage = createAsyncThunk(
  'talk/processVoiceMessage',
  async ({ audioBlob, sessionId, level }, { rejectWithValue, dispatch }) => {
    try {
      // 음성 처리 시작 알림
      toast.loading('음성을 분석하고 있습니다...', { 
        id: 'voice-processing',
        duration: Infinity 
      })
      
      // 음성 파일을 FormData로 변환
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice.webm')
      formData.append('session_id', sessionId || '')
      formData.append('level', level)
      
      // 실제 음성 처리 API 호출 (향후 구현)
      // const voiceResponse = await processVoiceAPI(formData)
      
      // 임시로 텍스트 변환 후 일반 메시지로 처리
      const transcribedText = '[음성 메시지가 처리되었습니다]'
      
      // 음성 처리 완료 알림
      toast.success('음성이 텍스트로 변환되었습니다!', { 
        id: 'voice-processing' 
      })
      
      const result = await dispatch(sendMessage({
        message: transcribedText,
        sessionId,
        level
      })).unwrap()
      
      return result
    } catch (error) {
      // 음성 처리 실패 알림
      toast.error('음성 처리에 실패했습니다. 다시 시도해주세요.', { 
        id: 'voice-processing' 
      })
      
      return rejectWithValue(error.message || '음성 메시지 처리 중 오류가 발생했습니다.')
    }
  }
)

export const deleteSession = createAsyncThunk(
  'talk/deleteSession',
  async ({ sessionId }, { rejectWithValue }) => {
    try {
      // 삭제 확인 (toast로 확인 받기)
      const confirmDelete = await new Promise((resolve) => {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span>이 대화를 정말 삭제하시겠습니까?</span>
            <div className="flex gap-2">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                onClick={() => {
                  toast.dismiss(t.id)
                  resolve(true)
                }}
              >
                삭제
              </button>
              <button
                className="bg-gray-300 px-3 py-1 rounded text-sm"
                onClick={() => {
                  toast.dismiss(t.id)
                  resolve(false)
                }}
              >
                취소
              </button>
            </div>
          </div>
        ), { duration: Infinity })
      })
      
      if (!confirmDelete) {
        return rejectWithValue('사용자가 취소했습니다.')
      }
      
      // 실제 삭제 API 호출 (향후 구현)
      // await deleteSessionAPI(sessionId)
      
      toast.success('대화가 삭제되었습니다.')
      return sessionId
    } catch (error) {
      toast.error('대화 삭제에 실패했습니다.')
      return rejectWithValue(error.message || '세션 삭제 중 오류가 발생했습니다.')
    }
  }
)

export const exportSession = createAsyncThunk(
  'talk/exportSession',
  async ({ sessionId, format = 'txt' }, { rejectWithValue, getState }) => {
    try {
      const { talk } = getState()
      const session = talk.currentSession
      
      if (!session.messages || session.messages.length === 0) {
        toast.error('내보낼 대화가 없습니다.')
        return rejectWithValue('대화 내용이 없습니다.')
      }
      
      toast.loading('대화를 내보내는 중...', { id: 'export-session' })
      
      // 대화 내용 포맷팅
      let exportContent = ''
      if (format === 'txt') {
        exportContent = session.messages
          .map(msg => `[${msg.role === 'user' ? '사용자' : 'AI'}] ${msg.content}`)
          .join('\n\n')
      } else if (format === 'json') {
        exportContent = JSON.stringify(session, null, 2)
      }
      
      // 파일 다운로드
      const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `talk_session_${sessionId || 'current'}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('대화가 성공적으로 내보내졌습니다!', { id: 'export-session' })
      
      return { sessionId, format }
    } catch (error) {
      toast.error('대화 내보내기에 실패했습니다.', { id: 'export-session' })
      return rejectWithValue(error.message || '세션 내보내기 중 오류가 발생했습니다.')
    }
  }
)

// 초기 상태
const initialState = {
  // 현재 세션
  currentSession: {
    sessionId: null,
    messages: [],
    level: 'beginner',
    createdAt: null,
    lastActivity: null
  },
  
  // 세션 관리
  sessions: [],
  selectedSessionId: null,
  
  // 사용량
  usage: {
    dailyLimit: 60,
    remaining: 60,
    resetAt: null
  },
  
  // 설정
  settings: {
    level: 'beginner',
    nativeLanguage: 'en',
    enableVoice: true,
    autoSpeak: false,
    showEmotions: true,
    enableEmotionToasts: true,  // 감정 알림 설정
    enableUsageAlerts: true     // 사용량 알림 설정
  },
  
  // UI 상태
  isMuted: false,
  isRecording: false,
  
  // 로딩 상태
  isLoading: false,
  isSendingMessage: false,
  isLoadingSessions: false,
  isLoadingSession: false,
  isLoadingUsage: false,
  isProcessingVoice: false,
  isDeletingSession: false,
  isExportingSession: false,
  
  // 에러 상태
  error: null,
  messageError: null,
  sessionError: null,
  usageError: null,
  voiceError: null,
  deleteError: null,
  exportError: null,
  
  // 감정 히스토리
  emotionHistory: [],
  
  // 통계
  stats: {
    totalMessages: 0,
    totalSessions: 0,
    dominantEmotion: null,
    koreanUsageRatio: 0,
    todayMessages: 0,
    currentStreak: 0
  }
}

// Redux Slice
const talkSlice = createSlice({
  name: 'talk',
  initialState,
  reducers: {
    // 에러 클리어
    clearErrors: (state) => {
      state.error = null
      state.messageError = null
      state.sessionError = null
      state.usageError = null
      state.voiceError = null
      state.deleteError = null
      state.exportError = null
    },
    
    // 새 세션 시작
    startNewSession: (state) => {
      state.currentSession = {
        sessionId: null,
        messages: [],
        level: state.settings.level,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      }
      state.selectedSessionId = null
      
      // 새 세션 시작 알림
      toast('새로운 대화를 시작합니다! 🎯', {
        icon: '🆕',
        duration: 2000
      })
    },
    
    // 설정 업데이트
    updateSettings: (state, action) => {
      const oldSettings = { ...state.settings }
      state.settings = { ...state.settings, ...action.payload }
      
      if (action.payload.level && action.payload.level !== oldSettings.level) {
        state.currentSession.level = action.payload.level
        
        const levelNames = {
          beginner: '초급',
          intermediate: '중급', 
          advanced: '고급'
        }
        
        toast.success(`대화 레벨이 ${levelNames[action.payload.level]}으로 변경되었습니다.`)
      }
      
      if (action.payload.nativeLanguage && action.payload.nativeLanguage !== oldSettings.nativeLanguage) {
        toast.success('언어 설정이 변경되었습니다.')
      }
      
      if (action.payload.enableVoice !== undefined && action.payload.enableVoice !== oldSettings.enableVoice) {
        toast(action.payload.enableVoice ? '음성 기능이 활성화되었습니다.' : '음성 기능이 비활성화되었습니다.', {
          icon: action.payload.enableVoice ? '🎤' : '🔇'
        })
      }
    },
    
    // UI 상태
    setMuted: (state, action) => {
      state.isMuted = action.payload
      
      toast(action.payload ? '음소거되었습니다.' : '음소거가 해제되었습니다.', {
        icon: action.payload ? '🔇' : '🔊',
        duration: 1500
      })
    },
    
    setRecording: (state, action) => {
      state.isRecording = action.payload
      
      if (action.payload) {
        toast('녹음을 시작합니다...', {
          icon: '🎤',
          duration: 1000
        })
      } else {
        toast.dismiss() // 녹음 관련 toast 제거
      }
    },
    
    // 임시 메시지 추가
    addTempMessage: (state, action) => {
      state.currentSession.messages.push(action.payload)
      state.currentSession.lastActivity = new Date().toISOString()
    },
    
    // 사용량 경고
    showUsageWarning: (state) => {
      const remaining = state.usage.remaining
      
      if (remaining <= 0) {
        toast.error('오늘의 대화 횟수를 모두 사용했습니다!', {
          duration: 5000
        })
      } else if (remaining <= 3) {
        toast(`⚠️ ${remaining}번의 대화만 남았습니다!`, {
          icon: '⏰',
          duration: 4000
        })
      }
    },
    
    // 연속 학습 축하
    celebrateStreak: (state, action) => {
      const streak = action.payload
      
      if (streak >= 7) {
        toast(`🔥 ${streak}일 연속 대화 중! 대단해요!`, {
          icon: '🎉',
          duration: 4000
        })
      } else if (streak >= 3) {
        toast(`💪 ${streak}일 연속 대화 중!`, {
          duration: 3000
        })
      }
    }
  },
  
  extraReducers: (builder) => {
    // 메시지 전송
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isSendingMessage = true
        state.messageError = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSendingMessage = false
        
        const { userMessage, aiResponse, sessionId } = action.payload
        
        // 세션 ID 업데이트
        if (!state.currentSession.sessionId) {
          state.currentSession.sessionId = sessionId
        }
        
        // 메시지 추가
        state.currentSession.messages.push(userMessage, aiResponse)
        state.currentSession.lastActivity = new Date().toISOString()
        
        // 감정 히스토리 업데이트
        if (aiResponse.emotion) {
          state.emotionHistory.push({
            emotion: aiResponse.emotion.emotion,
            confidence: aiResponse.emotion.confidence,
            timestamp: aiResponse.timestamp
          })
          
          if (state.emotionHistory.length > 20) {
            state.emotionHistory = state.emotionHistory.slice(-20)
          }
        }
        
        // 사용량 업데이트
        if (state.usage.remaining > 0) {
          state.usage.remaining -= 1
        }
        
        // 통계 업데이트
        const userMessages = state.currentSession.messages.filter(m => m.role === 'user')
        state.stats.totalMessages = userMessages.length
        state.stats.todayMessages = userMessages.length
        
        state.messageError = null
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSendingMessage = false
        state.messageError = action.payload
      })
    
    // 세션 목록 로드
    builder
      .addCase(loadSessions.pending, (state) => {
        state.isLoadingSessions = true
        state.sessionError = null
      })
      .addCase(loadSessions.fulfilled, (state, action) => {
        state.isLoadingSessions = false
        state.sessions = action.payload
        state.stats.totalSessions = action.payload.length
        state.sessionError = null
      })
      .addCase(loadSessions.rejected, (state, action) => {
        state.isLoadingSessions = false
        state.sessionError = action.payload
      })
    
    // 특정 세션 로드
    builder
      .addCase(loadSession.pending, (state) => {
        state.isLoadingSession = true
        state.sessionError = null
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.isLoadingSession = false
        state.currentSession = {
          sessionId: action.payload.session_id,
          messages: action.payload.messages,
          level: action.payload.level,
          createdAt: action.payload.created_at,
          lastActivity: action.payload.updated_at
        }
        state.selectedSessionId = action.payload.session_id
        
        // 감정 히스토리 재구성
        state.emotionHistory = action.payload.messages
          .filter(m => m.emotion)
          .map(m => ({
            emotion: m.emotion.emotion,
            confidence: m.emotion.confidence,
            timestamp: m.timestamp
          }))
          .slice(-20)
        
        state.sessionError = null
      })
      .addCase(loadSession.rejected, (state, action) => {
        state.isLoadingSession = false
        state.sessionError = action.payload
      })
    
    // 사용량 로드
    builder
      .addCase(loadUsage.pending, (state) => {
        state.isLoadingUsage = true
        state.usageError = null
      })
      .addCase(loadUsage.fulfilled, (state, action) => {
        state.isLoadingUsage = false
        state.usage = {
          dailyLimit: action.payload.daily_limit,
          remaining: action.payload.remaining,
          resetAt: action.payload.reset_at
        }
        state.usageError = null
      })
      .addCase(loadUsage.rejected, (state, action) => {
        state.isLoadingUsage = false
        state.usageError = action.payload
      })
    
    // 음성 메시지 처리
    builder
      .addCase(processVoiceMessage.pending, (state) => {
        state.isProcessingVoice = true
        state.voiceError = null
      })
      .addCase(processVoiceMessage.fulfilled, (state, action) => {
        state.isProcessingVoice = false
        state.voiceError = null
      })
      .addCase(processVoiceMessage.rejected, (state, action) => {
        state.isProcessingVoice = false
        state.voiceError = action.payload
      })
    
    // 세션 삭제
    builder
      .addCase(deleteSession.pending, (state) => {
        state.isDeletingSession = true
        state.deleteError = null
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.isDeletingSession = false
        // 세션 목록에서 제거
        state.sessions = state.sessions.filter(s => s.sessionId !== action.payload)
        // 현재 세션이 삭제된 경우 초기화
        if (state.currentSession.sessionId === action.payload) {
          state.currentSession = {
            sessionId: null,
            messages: [],
            level: state.settings.level,
            createdAt: null,
            lastActivity: null
          }
        }
        state.deleteError = null
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.isDeletingSession = false
        state.deleteError = action.payload
      })
    
    // 세션 내보내기
    builder
      .addCase(exportSession.pending, (state) => {
        state.isExportingSession = true
        state.exportError = null
      })
      .addCase(exportSession.fulfilled, (state) => {
        state.isExportingSession = false
        state.exportError = null
      })
      .addCase(exportSession.rejected, (state, action) => {
        state.isExportingSession = false
        state.exportError = action.payload
      })
  },
})

// 액션 내보내기
export const {
  clearErrors,
  startNewSession,
  updateSettings,
  setMuted,
  setRecording,
  addTempMessage,
  showUsageWarning,
  celebrateStreak
} = talkSlice.actions

// 셀렉터들
export const selectTalk = (state) => state.talk
export const selectCurrentSession = (state) => state.talk.currentSession
export const selectMessages = (state) => state.talk.currentSession.messages
export const selectSessions = (state) => state.talk.sessions
export const selectUsage = (state) => state.talk.usage
export const selectSettings = (state) => state.talk.settings
export const selectStats = (state) => state.talk.stats
export const selectEmotionHistory = (state) => state.talk.emotionHistory
export const selectIsLoading = (state) => 
  state.talk.isSendingMessage || 
  state.talk.isProcessingVoice || 
  state.talk.isLoadingSession
export const selectHasUsageLeft = (state) => state.talk.usage.remaining > 0
export const selectCanSendMessage = (state) => 
  !selectIsLoading(state) && selectHasUsageLeft(state)
export const selectCurrentEmotion = (state) => {
  const emotions = state.talk.emotionHistory
  return emotions.length > 0 ? emotions[emotions.length - 1] : null
}
export const selectDominantEmotion = (state) => {
  const emotions = state.talk.emotionHistory
  if (emotions.length === 0) return null
  
  const emotionCounts = emotions.reduce((acc, item) => {
    acc[item.emotion] = (acc[item.emotion] || 0) + 1
    return acc
  }, {})
  
  return Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || null
}

// 리듀서 내보내기
export default talkSlice.reducer