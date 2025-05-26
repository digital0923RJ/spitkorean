// frontend/src/services/openai.js
import apiClient from '../api/index.js';

/**
 * OpenAI 피드백 서비스
 * 한국어 학습 전용 AI 피드백 생성
 * 백엔드 gpt_service.py와 연동
 */
class OpenAIService {
  constructor() {
    this.retryLimit = 3;
    this.retryDelay = 1000;
  }

  /**
   * 대화 피드백 생성 (Talk Like You Mean It)
   * @param {string} userMessage - 사용자 메시지
   * @param {string} aiResponse - AI 응답
   * @param {string} userLevel - 사용자 레벨
   * @param {string} nativeLanguage - 사용자 모국어
   * @param {Object} emotionData - 감정 분석 데이터
   * @returns {Promise<Object>} 피드백 결과
   */
  async generateChatFeedback(userMessage, aiResponse, userLevel, nativeLanguage, emotionData = null) {
    const response = await this._requestWithRetry('/talk/feedback', {
      userMessage,
      aiResponse,
      userLevel,
      nativeLanguage,
      emotionData,
      type: 'conversation'
    });

    return {
      grammarFeedback: response.data.data.grammarFeedback,
      vocabularyFeedback: response.data.data.vocabularyFeedback,
      pronunciationTips: response.data.data.pronunciationTips,
      culturalNotes: response.data.data.culturalNotes,
      encouragement: response.data.data.encouragement,
      nextSteps: response.data.data.nextSteps
    };
  }

  /**
   * 문법 교정 및 설명 (Drama Builder)
   * @param {string} userSentence - 사용자가 구성한 문장
   * @param {string} correctSentence - 정답 문장
   * @param {string} level - 학습 레벨
   * @param {string} nativeLanguage - 사용자 모국어
   * @returns {Promise<Object>} 문법 분석 결과
   */
  async analyzeGrammar(userSentence, correctSentence, level, nativeLanguage) {
    const response = await this._requestWithRetry('/drama/grammar-analysis', {
      userSentence,
      correctSentence,
      level,
      nativeLanguage
    });

    return {
      isCorrect: response.data.data.isCorrect,
      corrections: response.data.data.corrections,
      grammarPoints: response.data.data.grammarPoints,
      explanation: response.data.data.explanation,
      similarSentences: response.data.data.similarSentences,
      difficultyScore: response.data.data.difficultyScore
    };
  }

  /**
   * TOPIK 문제 해설 생성 (Test & Study)
   * @param {Object} question - 문제 정보
   * @param {string} userAnswer - 사용자 답변
   * @param {string} correctAnswer - 정답
   * @param {string} nativeLanguage - 사용자 모국어
   * @returns {Promise<Object>} 문제 해설
   */
  async generateTestExplanation(question, userAnswer, correctAnswer, nativeLanguage) {
    const response = await this._requestWithRetry('/test/explanation', {
      question,
      userAnswer,
      correctAnswer,
      nativeLanguage
    });

    return {
      explanation: response.data.data.explanation,
      whyWrong: response.data.data.whyWrong,
      whyCorrect: response.data.data.whyCorrect,
      studyTips: response.data.data.studyTips,
      relatedGrammar: response.data.data.relatedGrammar,
      examples: response.data.data.examples
    };
  }

  /**
   * 발음 분석 및 개선 제안 (Korean Journey)
   * @param {string} originalText - 원본 텍스트
   * @param {string} transcribedText - 음성 인식 결과
   * @param {number} pronunciationScore - 발음 점수
   * @param {string} level - 학습 레벨
   * @param {string} nativeLanguage - 사용자 모국어
   * @returns {Promise<Object>} 발음 분석 결과
   */
  async analyzePronunciation(originalText, transcribedText, pronunciationScore, level, nativeLanguage) {
    const response = await this._requestWithRetry('/journey/pronunciation-analysis', {
      originalText,
      transcribedText,
      pronunciationScore,
      level,
      nativeLanguage
    });

    return {
      overallFeedback: response.data.data.overallFeedback,
      specificErrors: response.data.data.specificErrors,
      improvementTips: response.data.data.improvementTips,
      practiceExercises: response.data.data.practiceExercises,
      phoneticsGuide: response.data.data.phoneticsGuide
    };
  }

  /**
   * 개인화된 학습 추천
   * @param {Object} userProgress - 사용자 학습 진행 데이터
   * @param {string} targetProduct - 대상 상품
   * @param {string} nativeLanguage - 사용자 모국어
   * @returns {Promise<Object>} 학습 추천사항
   */
  async generateLearningRecommendations(userProgress, targetProduct, nativeLanguage) {
    const response = await this._requestWithRetry('/common/learning-recommendations', {
      userProgress,
      targetProduct,
      nativeLanguage
    });

    return {
      recommendations: response.data.data.recommendations,
      focusAreas: response.data.data.focusAreas,
      suggestedContent: response.data.data.suggestedContent,
      studyPlan: response.data.data.studyPlan,
      motivationalMessage: response.data.data.motivationalMessage
    };
  }

  /**
   * 문화적 맥락 설명
   * @param {string} content - 설명이 필요한 콘텐츠
   * @param {string} context - 맥락 정보
   * @param {string} nativeLanguage - 사용자 모국어
   * @returns {Promise<Object>} 문화적 설명
   */
  async generateCulturalExplanation(content, context, nativeLanguage) {
    const response = await this._requestWithRetry('/common/cultural-explanation', {
      content,
      context,
      nativeLanguage
    });

    return {
      explanation: response.data.data.explanation,
      culturalBackground: response.data.data.culturalBackground,
      usage: response.data.data.usage,
      examples: response.data.data.examples,
      comparisons: response.data.data.comparisons
    };
  }

  /**
   * 학습 스타일 분석
   * @param {Object} learningHistory - 학습 이력 데이터
   * @param {string} nativeLanguage - 사용자 모국어
   * @returns {Promise<Object>} 학습 스타일 분석 결과
   */
  async analyzeLearningStyle(learningHistory, nativeLanguage) {
    const response = await this._requestWithRetry('/common/learning-style-analysis', {
      learningHistory,
      nativeLanguage
    });

    return {
      learningStyle: response.data.data.learningStyle,
      strengths: response.data.data.strengths,
      areas_for_improvement: response.data.data.areas_for_improvement,
      recommended_strategies: response.data.data.recommended_strategies,
      optimal_study_pattern: response.data.data.optimal_study_pattern
    };
  }

  /**
   * 피드백 품질 평가
   * @param {string} feedbackId - 피드백 ID
   * @param {number} rating - 평점 (1-5)
   * @param {string} comment - 코멘트
   * @returns {Promise<boolean>} 성공 여부
   */
  async rateFeedback(feedbackId, rating, comment = '') {
    try {
      await apiClient.post('/common/rate-feedback', {
        feedbackId,
        rating,
        comment
      });
      return true;
    } catch (error) {
      console.error('피드백 평가 오류:', error);
      return false;
    }
  }

  /**
   * 재시도 로직이 포함된 API 요청
   * @private
   */
  async _requestWithRetry(endpoint, data) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryLimit; attempt++) {
      try {
        return await apiClient.post(endpoint, data);
      } catch (error) {
        lastError = error;
        
        // 마지막 시도가 아닌 경우에만 재시도
        if (attempt < this.retryLimit) {
          const status = error.response?.status;
          // 429 (Rate Limit) 또는 500번대 에러인 경우에만 재시도
          if (status === 429 || (status >= 500 && status < 600)) {
            await this._delay(this.retryDelay * attempt);
            continue;
          }
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }

  /**
   * 지연 함수
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 싱글톤 인스턴스 생성
const openaiService = new OpenAIService();

export default openaiService;