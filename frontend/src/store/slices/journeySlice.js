// src/store/slices/journeySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getJourneyContent, 
  submitJourneyReading, 
  getJourneyProgress, 
  getJourneyUsage 
} from '../../api/journey';

// 비동기 액션 생성 (Thunk)

/**
 * 리딩 콘텐츠 조회
 */
export const fetchJourneyContent = createAsyncThunk(
  'journey/fetchContent',
  async ({ level = 'level1', type = 'reading' }, { rejectWithValue }) => {
    try {
      const response = await getJourneyContent(level, type);
      return {
        content: response.data.content,
        remaining_usage: response.data.remaining_usage,
        level,
        type
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '콘텐츠를 불러오는데 실패했습니다.'
      );
    }
  }
);

/**
 * 리딩 결과 제출
 */
export const submitReading = createAsyncThunk(
  'journey/submitReading',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await submitJourneyReading(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '결과 제출에 실패했습니다.'
      );
    }
  }
);

/**
 * 진행 상황 조회
 */
export const fetchProgress = createAsyncThunk(
  'journey/fetchProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getJourneyProgress();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '진행 상황을 불러오는데 실패했습니다.'
      );
    }
  }
);

/**
 * 사용량 조회
 */
export const fetchUsage = createAsyncThunk(
  'journey/fetchUsage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getJourneyUsage();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || '사용량 정보를 불러오는데 실패했습니다.'
      );
    }
  }
);

// 초기 상태
const initialState = {
  // 현재 콘텐츠
  currentContent: null,
  contentLevel: 'level1',
  contentType: 'reading',
  
  // 읽기 세션 상태
  session: {
    isActive: false,
    currentSentenceIndex: 0,
    completedSentences: [],
    startTime: null,
    totalSentences: 0
  },
  
  // 재생 컨트롤
  playback: {
    isPlaying: false,
    speed: 1.0,
    volume: 1.0,
    isMuted: false,
    autoAdvance: true
  },
  
  // 녹음 상태
  recording: {
    isRecording: false,
    audioBlob: null,
    duration: 0
  },
  
  // 발음 평가
  pronunciation: {
    currentScore: null,
    history: [],
    analysis: null,
    feedback: null
  },
  
  // 진행 상황
  progress: {
    history: [],
    level_stats: {},
    date_stats: [],
    total_readings: 0,
    total_sentences: 0,
    avg_pronunciation: 0
  },
  
  // 사용량 정보
  usage: {
    has_subscription: false,
    daily_limit: 20,
    remaining: 0,
    reset_at: null
  },
  
  // UI 상태
  ui: {
    showGuide: false,
    showTranslation: false,
    showJamo: false,
    showAdvancedControls: false,
    selectedCharacter: null
  },
  
  // 로딩 및 에러 상태
  loading: {
    content: false,
    submit: false,
    progress: false,
    usage: false
  },
  
  error: {
    content: null,
    submit: null,
    progress: null,
    usage: null
  }
};

// 슬라이스 생성
const journeySlice = createSlice({
  name: 'journey',
  initialState,
  reducers: {
    // 세션 관리
    startSession: (state, action) => {
      const { content } = action.payload;
      state.session = {
        isActive: true,
        currentSentenceIndex: 0,
        completedSentences: new Set(),
        startTime: Date.now(),
        totalSentences: content?.content?.sentences?.length || 0
      };
      state.pronunciation.currentScore = null;
      state.pronunciation.analysis = null;
    },
    
    endSession: (state) => {
      state.session.isActive = false;
      state.playback.isPlaying = false;
      state.recording.isRecording = false;
    },
    
    // 문장 네비게이션
    setCurrentSentence: (state, action) => {
      state.session.currentSentenceIndex = action.payload;
      state.pronunciation.currentScore = null;
      state.pronunciation.analysis = null;
    },
    
    goToNextSentence: (state) => {
      const maxIndex = state.session.totalSentences - 1;
      if (state.session.currentSentenceIndex < maxIndex) {
        state.session.currentSentenceIndex += 1;
        state.pronunciation.currentScore = null;
        state.pronunciation.analysis = null;
      }
    },
    
    goToPreviousSentence: (state) => {
      if (state.session.currentSentenceIndex > 0) {
        state.session.currentSentenceIndex -= 1;
        state.pronunciation.currentScore = null;
        state.pronunciation.analysis = null;
      }
    },
    
    markSentenceCompleted: (state, action) => {
      const index = action.payload;
      if(!state.session.completedSentences.includes(index)){
        state.session.completedSentences.push(index);
      } 
    },
    
    // 재생 컨트롤
    setPlaybackState: (state, action) => {
      state.playback.isPlaying = action.payload;
    },
    
    setPlaybackSpeed: (state, action) => {
      state.playback.speed = action.payload;
    },
    
    setVolume: (state, action) => {
      state.playback.volume = action.payload;
      state.playback.isMuted = action.payload === 0;
    },
    
    toggleMute: (state) => {
      state.playback.isMuted = !state.playback.isMuted;
    },
    
    setAutoAdvance: (state, action) => {
      state.playback.autoAdvance = action.payload;
    },
    
    // 녹음 관리
    startRecording: (state) => {
      state.recording = {
        isRecording: true,
        audioBlob: null,
        duration: 0
      };
    },
    
    stopRecording: (state, action) => {
      state.recording = {
        isRecording: false,
        audioBlob: action.payload.audioBlob,
        duration: action.payload.duration
      };
    },
    
    clearRecording: (state) => {
      state.recording = {
        isRecording: false,
        audioBlob: null,
        duration: 0
      };
    },
    
    // 발음 평가
    setPronunciationScore: (state, action) => {
      const { score, analysis, feedback } = action.payload;
      state.pronunciation.currentScore = score;
      state.pronunciation.analysis = analysis;
      state.pronunciation.feedback = feedback;
      
      // 히스토리에 추가
      state.pronunciation.history.push({
        score,
        timestamp: Date.now(),
        sentenceIndex: state.session.currentSentenceIndex
      });
      
      // 히스토리 크기 제한 (최대 10개)
      if (state.pronunciation.history.length > 10) {
        state.pronunciation.history.shift();
      }
    },
    
    clearPronunciationData: (state) => {
      state.pronunciation.currentScore = null;
      state.pronunciation.analysis = null;
      state.pronunciation.feedback = null;
    },
    
    // UI 상태 관리
    toggleGuide: (state) => {
      state.ui.showGuide = !state.ui.showGuide;
    },
    
    toggleTranslation: (state) => {
      state.ui.showTranslation = !state.ui.showTranslation;
    },
    
    toggleJamo: (state) => {
      state.ui.showJamo = !state.ui.showJamo;
    },
    
    toggleAdvancedControls: (state) => {
      state.ui.showAdvancedControls = !state.ui.showAdvancedControls;
    },
    
    setSelectedCharacter: (state, action) => {
      state.ui.selectedCharacter = action.payload;
    },
    
    // 에러 클리어
    clearContentError: (state) => {
      state.error.content = null;
    },
    
    clearSubmitError: (state) => {
      state.error.submit = null;
    },
    
    clearProgressError: (state) => {
      state.error.progress = null;
    },
    
    clearUsageError: (state) => {
      state.error.usage = null;
    },
    
    // 전체 상태 리셋
    resetJourneyState: () => initialState
  },
  
  extraReducers: (builder) => {
    // 콘텐츠 조회
    builder
      .addCase(fetchJourneyContent.pending, (state) => {
        state.loading.content = true;
        state.error.content = null;
      })
      .addCase(fetchJourneyContent.fulfilled, (state, action) => {
        state.loading.content = false;
        state.currentContent = action.payload.content;
        state.contentLevel = action.payload.level;
        state.contentType = action.payload.type;
        state.usage.remaining = action.payload.remaining_usage;
        
        // 레벨별 기본 설정 적용
        const levelConfigs = {
          level1: { speed: 0.5, showJamo: true, autoAdvance: true },
          level2: { speed: 0.8, showJamo: false, autoAdvance: true },
          level3: { speed: 1.0, showJamo: false, autoAdvance: false },
          level4: { speed: 1.2, showJamo: false, autoAdvance: false }
        };
        
        const config = levelConfigs[action.payload.level] || levelConfigs.level1;
        state.playback.speed = config.speed;
        state.playback.autoAdvance = config.autoAdvance;
        state.ui.showJamo = config.showJamo;
      })
      .addCase(fetchJourneyContent.rejected, (state, action) => {
        state.loading.content = false;
        state.error.content = action.payload;
      });
    
    // 결과 제출
    builder
      .addCase(submitReading.pending, (state) => {
        state.loading.submit = true;
        state.error.submit = null;
      })
      .addCase(submitReading.fulfilled, (state, action) => {
        state.loading.submit = false;
        
        // 제출 성공 시 세션 종료
        state.session.isActive = false;
        state.playback.isPlaying = false;
        state.recording.isRecording = false;
        
        // 사용량 업데이트
        if (state.usage.remaining > 0) {
          state.usage.remaining -= 1;
        }
      })
      .addCase(submitReading.rejected, (state, action) => {
        state.loading.submit = false;
        state.error.submit = action.payload;
      });
    
    // 진행 상황 조회
    builder
      .addCase(fetchProgress.pending, (state) => {
        state.loading.progress = true;
        state.error.progress = null;
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.loading.progress = false;
        state.progress = action.payload;
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.loading.progress = false;
        state.error.progress = action.payload;
      });
    
    // 사용량 조회
    builder
      .addCase(fetchUsage.pending, (state) => {
        state.loading.usage = true;
        state.error.usage = null;
      })
      .addCase(fetchUsage.fulfilled, (state, action) => {
        state.loading.usage = false;
        state.usage = action.payload;
      })
      .addCase(fetchUsage.rejected, (state, action) => {
        state.loading.usage = false;
        state.error.usage = action.payload;
      });
  }
});

// 액션 내보내기
export const {
  startSession,
  endSession,
  setCurrentSentence,
  goToNextSentence,
  goToPreviousSentence,
  markSentenceCompleted,
  setPlaybackState,
  setPlaybackSpeed,
  setVolume,
  toggleMute,
  setAutoAdvance,
  startRecording,
  stopRecording,
  clearRecording,
  setPronunciationScore,
  clearPronunciationData,
  toggleGuide,
  toggleTranslation,
  toggleJamo,
  toggleAdvancedControls,
  setSelectedCharacter,
  clearContentError,
  clearSubmitError,
  clearProgressError,
  clearUsageError,
  resetJourneyState
} = journeySlice.actions;

// 선택자 (Selectors)
export const selectJourneyState = (state) => state.journey;
export const selectCurrentContent = (state) => state.journey.currentContent;
export const selectSession = (state) => state.journey.session;
export const selectPlayback = (state) => state.journey.playback;
export const selectRecording = (state) => state.journey.recording;
export const selectPronunciation = (state) => state.journey.pronunciation;
export const selectProgress = (state) => state.journey.progress;
export const selectUsage = (state) => state.journey.usage;
export const selectUI = (state) => state.journey.ui;
export const selectLoading = (state) => state.journey.loading;
export const selectErrors = (state) => state.journey.error;

// 계산된 선택자
export const selectCurrentSentence = (state) => {
  const content = selectCurrentContent(state);
  const session = selectSession(state);
  return content?.content?.sentences?.[session.currentSentenceIndex] || null;
};

export const selectSessionProgress = (state) => {
  const session = selectSession(state);
  if (session.totalSentences === 0) return 0;
  return (session.completedSentences.size / session.totalSentences) * 100;
};

export const selectCanGoNext = (state) => {
  const session = selectSession(state);
  return session.currentSentenceIndex < session.totalSentences - 1;
};

export const selectCanGoPrevious = (state) => {
  const session = selectSession(state);
  return session.currentSentenceIndex > 0;
};

export const selectHasRemainingUsage = (state) => {
  const usage = selectUsage(state);
  return usage.remaining > 0;
};

export const selectIsSessionComplete = (state) => {
  const session = selectSession(state);
  return session.completedSentences.size === session.totalSentences;
};

export const selectAverageScore = (state) => {
  const history = selectPronunciation(state).history;
  if (history.length === 0) return 0;
  const sum = history.reduce((acc, item) => acc + item.score, 0);
  return Math.round(sum / history.length);
};

// 리듀서 내보내기
export default journeySlice.reducer;