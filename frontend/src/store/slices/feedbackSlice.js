// frontend/src/store/slices/feedbackSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import openaiService from '@/services/openai'
import googleTranslateService from '@/services/googleTranslate'
import storage from '@/utils/storage'
import { SUPPORTED_LANGUAGES } from '@/shared/constants/languages'
import toast from 'react-hot-toast'

/**
 * 피드백 상태 관리 슬라이스
 * OpenAI 기반 학습 피드백 관리 + Google Translate 통합
 */

// 피드백 타입별 아이콘 매핑
const FEEDBACK_ICONS = {
  chat: '💬',
  grammar: '📝',
  test: '📊',
  pronunciation: '🎤',
  recommendations: '💡',
  cultural: '🌏',
  learning_style: '📚'
}

// 피드백 타입별 이름 매핑
const FEEDBACK_TYPE_NAMES = {
  chat: '대화 피드백',
  grammar: '문법 분석',
  test: '테스트 해설',
  pronunciation: '발음 분석',
  recommendations: '학습 추천',
  cultural: '문화적 설명',
  learning_style: '학습 스타일 분석'
}

// 비동기 액션: 대화 피드백 생성 (Talk Like You Mean It)
export const generateChatFeedback = createAsyncThunk(
  'feedback/generateChatFeedback',
  async ({ userMessage, aiResponse, userLevel, nativeLanguage, emotionData }, { rejectWithValue }) => {
    try {
      toast.loading('대화 피드백을 생성하는 중...', { 
        id: 'chat-feedback',
        duration: Infinity 
      })

      const feedback = await openaiService.generateChatFeedback(
        userMessage,
        aiResponse,
        userLevel,
        nativeLanguage,
        emotionData
      )

      // 모국어로 번역 (한국어가 아닌 경우)
      let translatedFeedback = feedback
      if (nativeLanguage !== 'ko' && SUPPORTED_LANGUAGES[nativeLanguage]) {
        try {
          translatedFeedback = await googleTranslateService.translateText(
            feedback,
            nativeLanguage,
            'ko'
          )
        } catch (translateError) {
          console.warn('피드백 번역 실패:', translateError)
          // 번역 실패 시 원문 사용
        }
      }

      const result = {
        id: `chat_${Date.now()}`,
        type: 'chat',
        userMessage,
        aiResponse,
        userLevel,
        nativeLanguage,
        feedback: translatedFeedback,
        originalFeedback: feedback, // 원본도 보관
        timestamp: Date.now(),
        product: 'talk'
      }

      // 스토리지에 저장
      storage.learning.setLearningProgress('talk_feedback', {
        lastFeedback: result,
        feedbackCount: (storage.learning.getLearningProgress('talk_feedback').feedbackCount || 0) + 1
      })

      toast.success(`${FEEDBACK_ICONS.chat} 대화 피드백이 생성되었습니다!`, { 
        id: 'chat-feedback',
        duration: 3000 
      })

      return result
    } catch (error) {
      toast.error('대화 피드백 생성에 실패했습니다.', { 
        id: 'chat-feedback' 
      })

      return rejectWithValue({
        message: error.message || '대화 피드백 생성에 실패했습니다.',
        userMessage,
        timestamp: Date.now()
      })
    }
  }
)

// 비동기 액션: 문법 분석 (Drama Builder)
export const analyzeGrammar = createAsyncThunk(
  'feedback/analyzeGrammar',
  async ({ userSentence, correctSentence, level, nativeLanguage }, { rejectWithValue }) => {
    try {
      toast.loading('문법을 분석하는 중...', { 
        id: 'grammar-analysis',
        duration: Infinity 
      })

      const analysis = await openaiService.analyzeGrammar(
        userSentence,
        correctSentence,
        level,
        nativeLanguage
      )

      // 모국어로 번역
      let translatedAnalysis = analysis
      if (nativeLanguage !== 'ko' && SUPPORTED_LANGUAGES[nativeLanguage]) {
        try {
          translatedAnalysis = await googleTranslateService.translateText(
            analysis,
            nativeLanguage,
            'ko'
          )
        } catch (translateError) {
          console.warn('문법 분석 번역 실패:', translateError)
        }
      }

      const result = {
        id: `grammar_${Date.now()}`,
        type: 'grammar',
        userSentence,
        correctSentence,
        level,
        nativeLanguage,
        analysis: translatedAnalysis,
        originalAnalysis: analysis,
        timestamp: Date.now(),
        product: 'drama'
      }

      // 스토리지에 저장
      storage.learning.setLearningProgress('drama_feedback', {
        lastAnalysis: result,
        analysisCount: (storage.learning.getLearningProgress('drama_feedback').analysisCount || 0) + 1
      })

      toast.success(`${FEEDBACK_ICONS.grammar} 문법 분석이 완료되었습니다!`, { 
        id: 'grammar-analysis',
        duration: 3000 
      })

      return result
    } catch (error) {
      toast.error('문법 분석에 실패했습니다.', { 
        id: 'grammar-analysis' 
      })

      return rejectWithValue({
        message: error.message || '문법 분석에 실패했습니다.',
        userSentence,
        timestamp: Date.now()
      })
    }
  }
)

// 비동기 액션: 테스트 해설 생성 (Test & Study)
export const generateTestExplanation = createAsyncThunk(
  'feedback/generateTestExplanation',
  async ({ question, userAnswer, correctAnswer, nativeLanguage }, { rejectWithValue }) => {
    try {
      toast.loading('테스트 해설을 생성하는 중...', { 
        id: 'test-explanation',
        duration: Infinity 
      })

      const explanation = await openaiService.generateTestExplanation(
        question,
        userAnswer,
        correctAnswer,
        nativeLanguage
      )

      // 모국어로 번역
      let translatedExplanation = explanation
      if (nativeLanguage !== 'ko' && SUPPORTED_LANGUAGES[nativeLanguage]) {
        try {
          translatedExplanation = await googleTranslateService.translateText(
            explanation,
            nativeLanguage,
            'ko'
          )
        } catch (translateError) {
          console.warn('테스트 해설 번역 실패:', translateError)
        }
      }

      const result = {
        id: `test_${Date.now()}`,
        type: 'test',
        question,
        userAnswer,
        correctAnswer,
        nativeLanguage,
        explanation: translatedExplanation,
        originalExplanation: explanation,
        timestamp: Date.now(),
        product: 'test'
      }

      // 스토리지에 저장
      storage.learning.setLearningProgress('test_feedback', {
        lastExplanation: result,
        explanationCount: (storage.learning.getLearningProgress('test_feedback').explanationCount || 0) + 1
      })

      toast.success(`${FEEDBACK_ICONS.test} 테스트 해설이 생성되었습니다!`, { 
        id: 'test-explanation',
        duration: 3000 
      })

      return result
    } catch (error) {
      toast.error('테스트 해설 생성에 실패했습니다.', { 
        id: 'test-explanation' 
      })

      return rejectWithValue({
        message: error.message || '테스트 해설 생성에 실패했습니다.',
        question,
        timestamp: Date.now()
      })
    }
  }
)

// 비동기 액션: 발음 분석 (Korean Journey)
export const analyzePronunciation = createAsyncThunk(
  'feedback/analyzePronunciation',
  async ({ originalText, transcribedText, pronunciationScore, level, nativeLanguage }, { rejectWithValue }) => {
    try {
      toast.loading('발음을 분석하는 중...', { 
        id: 'pronunciation-analysis',
        duration: Infinity 
      })

      const analysis = await openaiService.analyzePronunciation(
        originalText,
        transcribedText,
        pronunciationScore,
        level,
        nativeLanguage
      )

      // 모국어로 번역
      let translatedAnalysis = analysis
      if (nativeLanguage !== 'ko' && SUPPORTED_LANGUAGES[nativeLanguage]) {
        try {
          translatedAnalysis = await googleTranslateService.translateText(
            analysis,
            nativeLanguage,
            'ko'
          )
        } catch (translateError) {
          console.warn('발음 분석 번역 실패:', translateError)
        }
      }

      const result = {
        id: `pronunciation_${Date.now()}`,
        type: 'pronunciation',
        originalText,
        transcribedText,
        pronunciationScore,
        level,
        nativeLanguage,
        analysis: translatedAnalysis,
        originalAnalysis: analysis,
        timestamp: Date.now(),
        product: 'journey'
      }

      // 스토리지에 저장
      storage.learning.setLearningProgress('journey_feedback', {
        lastPronunciation: result,
        pronunciationCount: (storage.learning.getLearningProgress('journey_feedback').pronunciationCount || 0) + 1
      })

      // 발음 점수에 따른 다른 알림
      if (pronunciationScore >= 90) {
        toast.success(`${FEEDBACK_ICONS.pronunciation} 완벽한 발음입니다! (${pronunciationScore}점)`, { 
          id: 'pronunciation-analysis',
          duration: 4000 
        })
      } else if (pronunciationScore >= 70) {
        toast.success(`${FEEDBACK_ICONS.pronunciation} 좋은 발음입니다! (${pronunciationScore}점)`, { 
          id: 'pronunciation-analysis',
          duration: 3000 
        })
      } else {
        toast(`${FEEDBACK_ICONS.pronunciation} 발음 분석 완료 (${pronunciationScore}점)`, { 
          id: 'pronunciation-analysis',
          duration: 3000 
        })
      }

      return result
    } catch (error) {
      toast.error('발음 분석에 실패했습니다.', { 
        id: 'pronunciation-analysis' 
      })

      return rejectWithValue({
        message: error.message || '발음 분석에 실패했습니다.',
        originalText,
        timestamp: Date.now()
      })
    }
  }
)

// 비동기 액션: 학습 추천 생성
export const generateLearningRecommendations = createAsyncThunk(
  'feedback/generateLearningRecommendations',
  async ({ userProgress, targetProduct, nativeLanguage }, { rejectWithValue }) => {
    try {
      toast.loading('맞춤 학습 추천을 생성하는 중...', { 
        id: 'learning-recommendations',
        duration: Infinity 
      })

      const recommendations = await openaiService.generateLearningRecommendations(
        userProgress,
        targetProduct,
        nativeLanguage
      )

      // 모국어로 번역
      let translatedRecommendations = recommendations
      if (nativeLanguage !== 'ko' && SUPPORTED_LANGUAGES[nativeLanguage]) {
        try {
          translatedRecommendations = await googleTranslateService.translateText(
            recommendations,
            nativeLanguage,
            'ko'
          )
        } catch (translateError) {
          console.warn('학습 추천 번역 실패:', translateError)
        }
      }

      const result = {
        id: `recommendations_${Date.now()}`,
        type: 'recommendations',
        targetProduct,
        nativeLanguage,
        userProgress,
        recommendations: translatedRecommendations,
        originalRecommendations: recommendations,
        timestamp: Date.now(),
        product: targetProduct
      }

      // 스토리지에 저장
      storage.learning.setLearningProgress('recommendations', {
        lastRecommendations: result,
        recommendationCount: (storage.learning.getLearningProgress('recommendations').recommendationCount || 0) + 1
      })

      toast.success(`${FEEDBACK_ICONS.recommendations} 맞춤 학습 추천이 준비되었습니다!`, { 
        id: 'learning-recommendations',
        duration: 3000 
      })

      return result
    } catch (error) {
      toast.error('학습 추천 생성에 실패했습니다.', { 
        id: 'learning-recommendations' 
      })

      return rejectWithValue({
        message: error.message || '학습 추천 생성에 실패했습니다.',
        targetProduct,
        timestamp: Date.now()
      })
    }
  }
)

// 비동기 액션: 문화적 설명 생성
export const generateCulturalExplanation = createAsyncThunk(
  'feedback/generateCulturalExplanation',
  async ({ content, context, nativeLanguage }, { rejectWithValue }) => {
    try {
      toast.loading('문화적 배경을 설명하는 중...', { 
        id: 'cultural-explanation',
        duration: Infinity 
      })

      const explanation = await openaiService.generateCulturalExplanation(
        content,
        context,
        nativeLanguage
      )

      // 모국어로 번역
      let translatedExplanation = explanation
      if (nativeLanguage !== 'ko' && SUPPORTED_LANGUAGES[nativeLanguage]) {
        try {
          translatedExplanation = await googleTranslateService.translateText(
            explanation,
            nativeLanguage,
            'ko'
          )
        } catch (translateError) {
          console.warn('문화적 설명 번역 실패:', translateError)
        }
      }

      const result = {
        id: `cultural_${Date.now()}`,
        type: 'cultural',
        content,
        context,
        nativeLanguage,
        explanation: translatedExplanation,
        originalExplanation: explanation,
        timestamp: Date.now(),
        product: 'common'
      }

      // 스토리지에 저장
      storage.learning.setLearningProgress('cultural_feedback', {
        lastCultural: result,
        culturalCount: (storage.learning.getLearningProgress('cultural_feedback').culturalCount || 0) + 1
      })

      toast.success(`${FEEDBACK_ICONS.cultural} 문화적 설명이 준비되었습니다!`, { 
        id: 'cultural-explanation',
        duration: 3000 
      })

      return result
    } catch (error) {
      toast.error('문화적 설명 생성에 실패했습니다.', { 
        id: 'cultural-explanation' 
      })

      return rejectWithValue({
        message: error.message || '문화적 설명 생성에 실패했습니다.',
        content,
        timestamp: Date.now()
      })
    }
  }
)

// 비동기 액션: 학습 스타일 분석
export const analyzeLearningStyle = createAsyncThunk(
  'feedback/analyzeLearningStyle',
  async ({ learningHistory, nativeLanguage }, { rejectWithValue }) => {
    try {
      toast.loading('학습 스타일을 분석하는 중...', { 
        id: 'learning-style-analysis',
        duration: Infinity 
      })

      const analysis = await openaiService.analyzeLearningStyle(
        learningHistory,
        nativeLanguage
      )

      // 모국어로 번역
      let translatedAnalysis = analysis
      if (nativeLanguage !== 'ko' && SUPPORTED_LANGUAGES[nativeLanguage]) {
        try {
          translatedAnalysis = await googleTranslateService.translateText(
            analysis,
            nativeLanguage,
            'ko'
          )
        } catch (translateError) {
          console.warn('학습 스타일 분석 번역 실패:', translateError)
        }
      }

      const result = {
        id: `learning_style_${Date.now()}`,
        type: 'learning_style',
        learningHistory,
        nativeLanguage,
        analysis: translatedAnalysis,
        originalAnalysis: analysis,
        timestamp: Date.now(),
        product: 'common'
      }

      // 스토리지에 저장
      storage.learning.setLearningProgress('learning_style', {
        lastAnalysis: result,
        styleAnalysisCount: (storage.learning.getLearningProgress('learning_style').styleAnalysisCount || 0) + 1
      })

      toast.success(`${FEEDBACK_ICONS.learning_style} 학습 스타일 분석이 완료되었습니다!`, { 
        id: 'learning-style-analysis',
        duration: 3000 
      })

      return result
    } catch (error) {
      toast.error('학습 스타일 분석에 실패했습니다.', { 
        id: 'learning-style-analysis' 
      })

      return rejectWithValue({
        message: error.message || '학습 스타일 분석에 실패했습니다.',
        timestamp: Date.now()
      })
    }
  }
)

// 비동기 액션: 피드백 평가
export const rateFeedback = createAsyncThunk(
  'feedback/rateFeedback',
  async ({ feedbackId, rating, comment }, { rejectWithValue }) => {
    try {
      const success = await openaiService.rateFeedback(feedbackId, rating, comment)

      if (success) {
        const ratingText = rating >= 4 ? '매우 만족' : rating >= 3 ? '만족' : rating >= 2 ? '보통' : '개선 필요'
        
        toast.success(`피드백 평가 완료: ${ratingText} (${rating}/5)`, {
          duration: 2000
        })

        return {
          feedbackId,
          rating,
          comment,
          timestamp: Date.now()
        }
      } else {
        throw new Error('피드백 평가에 실패했습니다.')
      }
    } catch (error) {
      toast.error('피드백 평가 중 오류가 발생했습니다.')

      return rejectWithValue({
        message: error.message || '피드백 평가에 실패했습니다.',
        feedbackId
      })
    }
  }
)

// 비동기 액션: 피드백 번역
export const translateFeedback = createAsyncThunk(
  'feedback/translateFeedback',
  async ({ feedbackId, targetLanguage }, { rejectWithValue, getState }) => {
    try {
      const { feedback } = getState()
      const targetFeedback = feedback.feedbacks.find(f => f.id === feedbackId)
      
      if (!targetFeedback) {
        throw new Error('피드백을 찾을 수 없습니다.')
      }

      if (!SUPPORTED_LANGUAGES[targetLanguage]) {
        throw new Error('지원하지 않는 언어입니다.')
      }

      toast.loading('피드백을 번역하는 중...', { 
        id: 'translate-feedback',
        duration: Infinity 
      })

      // 원본 텍스트 사용 (번역되지 않은 버전)
      const originalText = targetFeedback.originalFeedback || 
                          targetFeedback.originalAnalysis || 
                          targetFeedback.originalExplanation || 
                          targetFeedback.originalRecommendations || 
                          targetFeedback.feedback ||
                          targetFeedback.analysis ||
                          targetFeedback.explanation ||
                          targetFeedback.recommendations

      const translatedText = await googleTranslateService.translateText(
        originalText,
        targetLanguage,
        'ko'
      )

      const languageInfo = SUPPORTED_LANGUAGES[targetLanguage]
      toast.success(`${languageInfo?.flag || ''} ${languageInfo?.name || targetLanguage}로 번역 완료!`, { 
        id: 'translate-feedback',
        duration: 2000 
      })

      return {
        feedbackId,
        targetLanguage,
        translatedText,
        timestamp: Date.now()
      }
    } catch (error) {
      toast.error('피드백 번역에 실패했습니다.', { 
        id: 'translate-feedback' 
      })

      return rejectWithValue({
        message: error.message || '피드백 번역에 실패했습니다.',
        feedbackId
      })
    }
  }
)

// 비동기 액션: 피드백 내보내기
export const exportFeedbacks = createAsyncThunk(
  'feedback/exportFeedbacks',
  async ({ feedbackIds, format = 'json' }, { rejectWithValue, getState }) => {
    try {
      const { feedback } = getState()
      
      const feedbacksToExport = feedbackIds.length > 0 
        ? feedback.feedbacks.filter(f => feedbackIds.includes(f.id))
        : feedback.feedbacks

      if (feedbacksToExport.length === 0) {
        toast.error('내보낼 피드백이 없습니다.')
        return rejectWithValue('내보낼 피드백이 없습니다.')
      }

      toast.loading(`${feedbacksToExport.length}개 피드백을 내보내는 중...`, { 
        id: 'export-feedbacks',
        duration: Infinity 
      })

      let exportContent = ''
      let fileName = ''

      if (format === 'json') {
        exportContent = JSON.stringify(feedbacksToExport, null, 2)
        fileName = `spitkorean_feedbacks_${Date.now()}.json`
      } else if (format === 'txt') {
        exportContent = feedbacksToExport.map(f => {
          const typeName = FEEDBACK_TYPE_NAMES[f.type] || f.type
          const icon = FEEDBACK_ICONS[f.type] || '📄'
          
          return `${icon} ${typeName}\n` +
                 `일시: ${new Date(f.timestamp).toLocaleString()}\n` +
                 `내용: ${f.feedback || f.analysis || f.explanation || f.recommendations}\n` +
                 '=' .repeat(50) + '\n'
        }).join('\n')
        fileName = `spitkorean_feedbacks_${Date.now()}.txt`
      }

      // 파일 다운로드
      const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)

      toast.success(`${feedbacksToExport.length}개 피드백이 성공적으로 내보내졌습니다!`, { 
        id: 'export-feedbacks',
        duration: 3000 
      })

      return {
        exportedCount: feedbacksToExport.length,
        format,
        fileName
      }
    } catch (error) {
      toast.error('피드백 내보내기에 실패했습니다.', { 
        id: 'export-feedbacks' 
      })

      return rejectWithValue(error.message || '피드백 내보내기에 실패했습니다.')
    }
  }
)

// 초기 상태
const initialState = {
  // 피드백 데이터
  feedbacks: [], // 모든 피드백 목록
  currentFeedback: null, // 현재 선택된 피드백
  
  // 카테고리별 피드백
  chatFeedbacks: [], // 대화 피드백
  grammarAnalyses: [], // 문법 분석
  testExplanations: [], // 테스트 해설
  pronunciationAnalyses: [], // 발음 분석
  learningRecommendations: [], // 학습 추천
  culturalExplanations: [], // 문화적 설명
  learningStyleAnalyses: [], // 학습 스타일 분석
  
  // 피드백 평가
  feedbackRatings: {}, // { feedbackId: { rating, comment, timestamp } }
  
  // 번역된 피드백
  translatedFeedbacks: {}, // { feedbackId: { [language]: translatedText } }
  
  // 로딩 상태
  loading: {
    chatFeedback: false,
    grammar: false,
    testExplanation: false,
    pronunciation: false,
    recommendations: false,
    cultural: false,
    learningStyle: false,
    rating: false,
    translate: false,
    export: false
  },
  
  // 에러 상태
  error: {
    chatFeedback: null,
    grammar: null,
    testExplanation: null,
    pronunciation: null,
    recommendations: null,
    cultural: null,
    learningStyle: null,
    rating: null,
    translate: null,
    export: null
  },

  // 설정
  settings: {
    maxFeedbacks: 100, // 최대 피드백 저장 개수
    autoSave: true, // 자동 저장
    showNotifications: true, // 피드백 알림 표시
    feedbackLanguage: 'auto', // 피드백 언어 (auto는 사용자 모국어)
    autoTranslate: false, // 자동 번역
    saveTranslations: true // 번역 결과 저장
  },

  // 통계
  stats: {
    totalFeedbacks: 0,
    averageRating: 0,
    feedbacksByProduct: {
      talk: 0,
      drama: 0,
      test: 0,
      journey: 0,
      common: 0
    },
    feedbacksByType: {
      chat: 0,
      grammar: 0,
      test: 0,
      pronunciation: 0,
      recommendations: 0,
      cultural: 0,
      learning_style: 0
    },
    translationCount: 0,
    exportCount: 0
  }
}

// 슬라이스 생성
const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    // 현재 피드백 설정
    setCurrentFeedback: (state, action) => {
      state.currentFeedback = action.payload
      
      if (action.payload) {
        const typeName = FEEDBACK_TYPE_NAMES[action.payload.type] || action.payload.type
        toast(`${FEEDBACK_ICONS[action.payload.type] || '📄'} ${typeName} 선택됨`, {
          duration: 1500
        })
      }
    },

    // 피드백 삭제
    removeFeedback: (state, action) => {
      const feedbackId = action.payload
      const feedbackToRemove = state.feedbacks.find(f => f.id === feedbackId)
      
      if (!feedbackToRemove) return
      
      // 전체 피드백 목록에서 제거
      state.feedbacks = state.feedbacks.filter(fb => fb.id !== feedbackId)
      
      // 카테고리별 목록에서도 제거
      state.chatFeedbacks = state.chatFeedbacks.filter(fb => fb.id !== feedbackId)
      state.grammarAnalyses = state.grammarAnalyses.filter(fb => fb.id !== feedbackId)
      state.testExplanations = state.testExplanations.filter(fb => fb.id !== feedbackId)
      state.pronunciationAnalyses = state.pronunciationAnalyses.filter(fb => fb.id !== feedbackId)
      state.learningRecommendations = state.learningRecommendations.filter(fb => fb.id !== feedbackId)
      state.culturalExplanations = state.culturalExplanations.filter(fb => fb.id !== feedbackId)
      state.learningStyleAnalyses = state.learningStyleAnalyses.filter(fb => fb.id !== feedbackId)
      
      // 현재 피드백이 삭제된 경우 초기화
      if (state.currentFeedback?.id === feedbackId) {
        state.currentFeedback = null
      }
      
      // 평가 정보도 제거
      delete state.feedbackRatings[feedbackId]
      
      // 번역 정보도 제거
      delete state.translatedFeedbacks[feedbackId]
      
      // 통계 업데이트
      state.stats.totalFeedbacks = state.feedbacks.length
      state.stats.feedbacksByProduct[feedbackToRemove.product]--
      state.stats.feedbacksByType[feedbackToRemove.type]--
      
      const typeName = FEEDBACK_TYPE_NAMES[feedbackToRemove.type] || feedbackToRemove.type
      toast.success(`${FEEDBACK_ICONS[feedbackToRemove.type] || '📄'} ${typeName}이(가) 삭제되었습니다.`)
    },

    // 모든 피드백 삭제
    clearAllFeedbacks: (state) => {
      const count = state.feedbacks.length
      
      state.feedbacks = []
      state.chatFeedbacks = []
      state.grammarAnalyses = []
      state.testExplanations = []
      state.pronunciationAnalyses = []
      state.learningRecommendations = []
      state.culturalExplanations = []
      state.learningStyleAnalyses = []
      state.currentFeedback = null
      state.feedbackRatings = {}
      state.translatedFeedbacks = {}
      
      // 통계 초기화
      state.stats = {
        ...state.stats,
        totalFeedbacks: 0,
        averageRating: 0,
        feedbacksByProduct: {
          talk: 0,
          drama: 0,
          test: 0,
          journey: 0,
          common: 0
        },
        feedbacksByType: {
          chat: 0,
          grammar: 0,
          test: 0,
          pronunciation: 0,
          recommendations: 0,
          cultural: 0,
          learning_style: 0
        }
      }
      
      // 스토리지에서도 제거
      storage.learning.setLearningProgress('all_feedback', {})
      
      if (count > 0) {
        toast.success(`${count}개의 모든 피드백이 삭제되었습니다.`)
      } else {
        toast('삭제할 피드백이 없습니다.', {
          icon: 'ℹ️'
        })
      }
    },

    // 특정 상품의 피드백만 삭제
    clearFeedbacksByProduct: (state, action) => {
      const product = action.payload
      const beforeCount = state.feedbacks.filter(fb => fb.product === product).length
      
      state.feedbacks = state.feedbacks.filter(fb => fb.product !== product)
      
      // 상품별 카테고리 피드백 삭제
      if (product === 'talk') {
        state.chatFeedbacks = []
      } else if (product === 'drama') {
        state.grammarAnalyses = []
      } else if (product === 'test') {
        state.testExplanations = []
      } else if (product === 'journey') {
        state.pronunciationAnalyses = []
      }
      
      // 현재 피드백이 해당 상품의 것이면 초기화
      if (state.currentFeedback?.product === product) {
        state.currentFeedback = null
      }
      
      // 통계 업데이트
      state.stats.totalFeedbacks = state.feedbacks.length
      state.stats.feedbacksByProduct[product] = 0
      
      const productNames = {
        talk: 'Talk Like You Mean It',
        drama: 'Drama Builder',
        test: 'Test & Study',
        journey: 'Korean Journey',
        common: '공통'
      }
      
      if (beforeCount > 0) {
        toast.success(`${productNames[product] || product} 피드백 ${beforeCount}개가 삭제되었습니다.`)
      }
    },

    // 설정 업데이트
    updateSettings: (state, action) => {
      const oldSettings = { ...state.settings }
      state.settings = {
        ...state.settings,
        ...action.payload
      }

      // 설정 변경 알림
      if (action.payload.autoTranslate !== undefined && action.payload.autoTranslate !== oldSettings.autoTranslate) {
        toast(action.payload.autoTranslate ? '자동 번역이 활성화되었습니다.' : '자동 번역이 비활성화되었습니다.', {
          icon: action.payload.autoTranslate ? '🌐' : '🚫'
        })
      }

      if (action.payload.showNotifications !== undefined && action.payload.showNotifications !== oldSettings.showNotifications) {
        toast(action.payload.showNotifications ? '피드백 알림이 활성화되었습니다.' : '피드백 알림이 비활성화되었습니다.', {
          icon: action.payload.showNotifications ? '🔔' : '🔕'
        })
      }
    },

    // 즐겨찾기 피드백 토글
    toggleFavoriteFeedback: (state, action) => {
      const feedbackId = action.payload
      const feedback = state.feedbacks.find(f => f.id === feedbackId)
      
      if (feedback) {
        feedback.isFavorite = !feedback.isFavorite
        
        const typeName = FEEDBACK_TYPE_NAMES[feedback.type] || feedback.type
        const action = feedback.isFavorite ? '즐겨찾기에 추가' : '즐겨찾기에서 제거'
        
        toast(`${FEEDBACK_ICONS[feedback.type] || '📄'} ${typeName}이(가) ${action}되었습니다.`)
      }
    },

    // 에러 클리어
    clearErrors: (state) => {
      state.error = {
        chatFeedback: null,
        grammar: null,
        testExplanation: null,
        pronunciation: null,
        recommendations: null,
        cultural: null,
        learningStyle: null,
        rating: null,
        translate: null,
        export: null
      }
    },

    // 특정 에러 클리어
    clearError: (state, action) => {
      const errorType = action.payload
      if (state.error[errorType]) {
        state.error[errorType] = null
      }
    },

    // 통계 수동 업데이트
    updateStats: (state) => {
      // 전체 피드백 수
      state.stats.totalFeedbacks = state.feedbacks.length
      
      // 상품별 통계
      state.stats.feedbacksByProduct = {
        talk: state.feedbacks.filter(fb => fb.product === 'talk').length,
        drama: state.feedbacks.filter(fb => fb.product === 'drama').length,
        test: state.feedbacks.filter(fb => fb.product === 'test').length,
        journey: state.feedbacks.filter(fb => fb.product === 'journey').length,
        common: state.feedbacks.filter(fb => fb.product === 'common').length
      }
      
      // 타입별 통계
      state.stats.feedbacksByType = {
        chat: state.chatFeedbacks.length,
        grammar: state.grammarAnalyses.length,
        test: state.testExplanations.length,
        pronunciation: state.pronunciationAnalyses.length,
        recommendations: state.learningRecommendations.length,
        cultural: state.culturalExplanations.length,
        learning_style: state.learningStyleAnalyses.length
      }
      
      // 평균 평점 계산
      const ratings = Object.values(state.feedbackRatings)
      if (ratings.length > 0) {
        const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0)
        state.stats.averageRating = Math.round((totalRating / ratings.length) * 100) / 100
      } else {
        state.stats.averageRating = 0
      }
    }
  },
  
  extraReducers: (builder) => {
    // 피드백 처리 공통 로직
    const handleFeedbackFulfilled = (state, action, categoryArray, loadingKey) => {
      state.loading[loadingKey] = false
      
      const feedback = action.payload
      
      // 전체 피드백 목록에 추가
      state.feedbacks.unshift(feedback)
      
      // 카테고리별 목록에 추가
      if (categoryArray && state[categoryArray]) {
        state[categoryArray].unshift(feedback)
      }
      
      // 최대 개수 제한
      if (state.feedbacks.length > state.settings.maxFeedbacks) {
        const removed = state.feedbacks.pop()
        
        // 카테고리별 목록에서도 제거
        if (categoryArray && state[categoryArray]) {
          state[categoryArray] = state[categoryArray].filter(fb => fb.id !== removed.id)
        }
      }
      
      // 현재 피드백으로 설정
      state.currentFeedback = feedback
      
      // 통계 업데이트
      state.stats.totalFeedbacks = state.feedbacks.length
      if (state.stats.feedbacksByProduct[feedback.product] !== undefined) {
        state.stats.feedbacksByProduct[feedback.product]++
      }
      if (state.stats.feedbacksByType[feedback.type] !== undefined) {
        state.stats.feedbacksByType[feedback.type]++
      }
    }

    const handleFeedbackRejected = (state, action, loadingKey, errorKey) => {
      state.loading[loadingKey] = false
      state.error[errorKey] = action.payload?.message || '피드백 생성에 실패했습니다.'
    }

    // generateChatFeedback
    builder
      .addCase(generateChatFeedback.pending, (state) => {
        state.loading.chatFeedback = true
        state.error.chatFeedback = null
      })
      .addCase(generateChatFeedback.fulfilled, (state, action) => {
        handleFeedbackFulfilled(state, action, 'chatFeedbacks', 'chatFeedback')
      })
      .addCase(generateChatFeedback.rejected, (state, action) => {
        handleFeedbackRejected(state, action, 'chatFeedback', 'chatFeedback')
      })

    // analyzeGrammar
    builder
      .addCase(analyzeGrammar.pending, (state) => {
        state.loading.grammar = true
        state.error.grammar = null
      })
      .addCase(analyzeGrammar.fulfilled, (state, action) => {
        handleFeedbackFulfilled(state, action, 'grammarAnalyses', 'grammar')
      })
      .addCase(analyzeGrammar.rejected, (state, action) => {
        handleFeedbackRejected(state, action, 'grammar', 'grammar')
      })

    // generateTestExplanation
    builder
      .addCase(generateTestExplanation.pending, (state) => {
        state.loading.testExplanation = true
        state.error.testExplanation = null
      })
      .addCase(generateTestExplanation.fulfilled, (state, action) => {
        handleFeedbackFulfilled(state, action, 'testExplanations', 'testExplanation')
      })
      .addCase(generateTestExplanation.rejected, (state, action) => {
        handleFeedbackRejected(state, action, 'testExplanation', 'testExplanation')
      })

    // analyzePronunciation
    builder
      .addCase(analyzePronunciation.pending, (state) => {
        state.loading.pronunciation = true
        state.error.pronunciation = null
      })
      .addCase(analyzePronunciation.fulfilled, (state, action) => {
        handleFeedbackFulfilled(state, action, 'pronunciationAnalyses', 'pronunciation')
      })
      .addCase(analyzePronunciation.rejected, (state, action) => {
        handleFeedbackRejected(state, action, 'pronunciation', 'pronunciation')
      })

    // generateLearningRecommendations
    builder
      .addCase(generateLearningRecommendations.pending, (state) => {
        state.loading.recommendations = true
        state.error.recommendations = null
      })
      .addCase(generateLearningRecommendations.fulfilled, (state, action) => {
        handleFeedbackFulfilled(state, action, 'learningRecommendations', 'recommendations')
      })
      .addCase(generateLearningRecommendations.rejected, (state, action) => {
        handleFeedbackRejected(state, action, 'recommendations', 'recommendations')
      })

    // generateCulturalExplanation
    builder
      .addCase(generateCulturalExplanation.pending, (state) => {
        state.loading.cultural = true
        state.error.cultural = null
      })
      .addCase(generateCulturalExplanation.fulfilled, (state, action) => {
        handleFeedbackFulfilled(state, action, 'culturalExplanations', 'cultural')
      })
      .addCase(generateCulturalExplanation.rejected, (state, action) => {
        handleFeedbackRejected(state, action, 'cultural', 'cultural')
      })

    // analyzeLearningStyle
    builder
      .addCase(analyzeLearningStyle.pending, (state) => {
        state.loading.learningStyle = true
        state.error.learningStyle = null
      })
      .addCase(analyzeLearningStyle.fulfilled, (state, action) => {
        handleFeedbackFulfilled(state, action, 'learningStyleAnalyses', 'learningStyle')
      })
      .addCase(analyzeLearningStyle.rejected, (state, action) => {
        handleFeedbackRejected(state, action, 'learningStyle', 'learningStyle')
      })

    // rateFeedback
    builder
      .addCase(rateFeedback.pending, (state) => {
        state.loading.rating = true
        state.error.rating = null
      })
      .addCase(rateFeedback.fulfilled, (state, action) => {
        state.loading.rating = false
        
        const { feedbackId, rating, comment, timestamp } = action.payload
        
        // 평가 정보 저장
        state.feedbackRatings[feedbackId] = {
          rating,
          comment,
          timestamp
        }
        
        // 평균 평점 업데이트
        const ratings = Object.values(state.feedbackRatings)
        const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0)
        state.stats.averageRating = Math.round((totalRating / ratings.length) * 100) / 100
      })
      .addCase(rateFeedback.rejected, (state, action) => {
        state.loading.rating = false
        state.error.rating = action.payload?.message || '피드백 평가에 실패했습니다.'
      })

    // translateFeedback
    builder
      .addCase(translateFeedback.pending, (state) => {
        state.loading.translate = true
        state.error.translate = null
      })
      .addCase(translateFeedback.fulfilled, (state, action) => {
        state.loading.translate = false
        
        const { feedbackId, targetLanguage, translatedText } = action.payload
        
        // 번역 결과 저장
        if (!state.translatedFeedbacks[feedbackId]) {
          state.translatedFeedbacks[feedbackId] = {}
        }
        state.translatedFeedbacks[feedbackId][targetLanguage] = translatedText
        
        // 통계 업데이트
        state.stats.translationCount++
      })
      .addCase(translateFeedback.rejected, (state, action) => {
        state.loading.translate = false
        state.error.translate = action.payload?.message || '피드백 번역에 실패했습니다.'
      })

    // exportFeedbacks
    builder
      .addCase(exportFeedbacks.pending, (state) => {
        state.loading.export = true
        state.error.export = null
      })
      .addCase(exportFeedbacks.fulfilled, (state, action) => {
        state.loading.export = false
        
        // 통계 업데이트
        state.stats.exportCount++
      })
      .addCase(exportFeedbacks.rejected, (state, action) => {
        state.loading.export = false
        state.error.export = action.payload?.message || '피드백 내보내기에 실패했습니다.'
      })
  }
})

// 액션 익스포트
export const {
  setCurrentFeedback,
  removeFeedback,
  clearAllFeedbacks,
  clearFeedbacksByProduct,
  updateSettings,
  toggleFavoriteFeedback,
  clearErrors,
  clearError,
  updateStats
} = feedbackSlice.actions

// 기본 셀렉터
export const selectAllFeedbacks = (state) => state.feedback.feedbacks
export const selectCurrentFeedback = (state) => state.feedback.currentFeedback
export const selectChatFeedbacks = (state) => state.feedback.chatFeedbacks
export const selectGrammarAnalyses = (state) => state.feedback.grammarAnalyses
export const selectTestExplanations = (state) => state.feedback.testExplanations
export const selectPronunciationAnalyses = (state) => state.feedback.pronunciationAnalyses
export const selectLearningRecommendations = (state) => state.feedback.learningRecommendations
export const selectCulturalExplanations = (state) => state.feedback.culturalExplanations
export const selectLearningStyleAnalyses = (state) => state.feedback.learningStyleAnalyses
export const selectFeedbackRatings = (state) => state.feedback.feedbackRatings
export const selectTranslatedFeedbacks = (state) => state.feedback.translatedFeedbacks
export const selectFeedbackLoading = (state) => state.feedback.loading
export const selectFeedbackErrors = (state) => state.feedback.error
export const selectFeedbackSettings = (state) => state.feedback.settings
export const selectFeedbackStats = (state) => state.feedback.stats

// 상품별 피드백 조회 셀렉터
export const selectFeedbacksByProduct = (product) => (state) => {
  return state.feedback.feedbacks.filter(fb => fb.product === product)
}

// 타입별 피드백 조회 셀렉터
export const selectFeedbacksByType = (type) => (state) => {
  return state.feedback.feedbacks.filter(fb => fb.type === type)
}

// 특정 피드백 조회 셀렉터
export const selectFeedbackById = (feedbackId) => (state) => {
  return state.feedback.feedbacks.find(fb => fb.id === feedbackId)
}

// 특정 피드백의 평가 조회 셀렉터
export const selectFeedbackRating = (feedbackId) => (state) => {
  return state.feedback.feedbackRatings[feedbackId]
}

// 특정 피드백의 번역 조회 셀렉터
export const selectFeedbackTranslation = (feedbackId, language) => (state) => {
  return state.feedback.translatedFeedbacks[feedbackId]?.[language]
}

// 최근 피드백 조회 셀렉터
export const selectRecentFeedbacks = (limit = 10) => (state) => {
  return state.feedback.feedbacks.slice(0, limit)
}

// 즐겨찾기 피드백 조회 셀렉터
export const selectFavoriteFeedbacks = (state) => {
  return state.feedback.feedbacks.filter(fb => fb.isFavorite)
}

// 평점이 높은 피드백 조회 셀렉터
export const selectHighRatedFeedbacks = (minRating = 4) => (state) => {
  return state.feedback.feedbacks.filter(fb => {
    const rating = state.feedback.feedbackRatings[fb.id]
    return rating && rating.rating >= minRating
  })
}

// 번역 가능한 피드백 조회 셀렉터
export const selectTranslatableFeedbacks = (state) => {
  return state.feedback.feedbacks.filter(fb => 
    fb.originalFeedback || fb.originalAnalysis || fb.originalExplanation || fb.originalRecommendations
  )
}

// 리듀서 익스포트
export default feedbackSlice.reducer