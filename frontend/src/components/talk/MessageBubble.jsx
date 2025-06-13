import React, { useState, useCallback } from 'react';
import { 
  Volume2, 
  Copy, 
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  Clock,
  BarChart3
} from 'lucide-react';

// 컴포넌트 import
import Button from '../common/Buttom';
import EmotionIndicator from './EmotionIndicator';

// 유틸리티 import
import { dateUtils, numberUtils } from '../../utils/format';

const MessageBubble = ({ 
  message, 
  isUser = false, 
  onSpeak = null,
  onCopy = null,
  onFeedback = null,
  onBookmark = null,
  showSpeakButton = true,
  isPlayingTTS = false,
  showAnalysis = true,
  className = '' 
}) => {
  // 상태 관리
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(message.isBookmarked || false);
  const [showActions, setShowActions] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(message.feedbackGiven || null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  // 메시지 복사
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      if (onCopy) {
        onCopy(message);
      }
    } catch (err) {
      console.error('Failed to copy message:', err);
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  }, [message, onCopy]);

  // TTS 재생
  const handleSpeak = useCallback(() => {
    if (onSpeak && message.content && !isPlayingTTS) {
      onSpeak(message.content);
    }
  }, [onSpeak, message.content, isPlayingTTS]);

  // 피드백 제공
  const handleFeedback = useCallback((type) => {
    setFeedbackGiven(type);
    
    if (onFeedback) {
      onFeedback(message, type);
    }
  }, [message, onFeedback]);

  // 북마크 토글
  const handleBookmark = useCallback(() => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    
    if (onBookmark) {
      onBookmark(message, newBookmarkState);
    }
  }, [isBookmarked, message, onBookmark]);

  // 메시지 분석 (한글/영어 비율, 길이 등)
  const analyzeMessage = useCallback((content) => {
    if (!content || typeof content !== 'string') return null;

    const koreanRegex = /[가-힣]/g;
    const englishRegex = /[a-zA-Z]/g;
    const numberRegex = /[0-9]/g;
    const punctuationRegex = /[.,!?;:"'()[\]{}]/g;
    
    const koreanChars = (content.match(koreanRegex) || []).length;
    const englishChars = (content.match(englishRegex) || []).length;
    const numberChars = (content.match(numberRegex) || []).length;
    const punctuationChars = (content.match(punctuationRegex) || []).length;
    
    const totalLanguageChars = koreanChars + englishChars;
    const totalChars = content.length;
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const sentences = content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    if (totalLanguageChars === 0) return null;
    
    return {
      koreanRatio: Math.round((koreanChars / totalLanguageChars) * 100),
      englishRatio: Math.round((englishChars / totalLanguageChars) * 100),
      wordCount: words.length,
      sentenceCount: sentences.length,
      charCount: totalChars,
      koreanChars,
      englishChars,
      numberChars,
      punctuationChars,
      averageWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
      readingTimeSeconds: Math.ceil(words.length / 3) // 분당 180단어 기준
    };
  }, []);

  // 레벨별 언어 비율 평가
  const evaluateLanguageRatio = useCallback((analysis, expectedLevel = 'intermediate') => {
    if (!analysis) return null;

    const { koreanRatio } = analysis;
    const targets = {
      beginner: { korean: 30, tolerance: 15 },
      intermediate: { korean: 70, tolerance: 15 },
      advanced: { korean: 95, tolerance: 10 }
    };

    const target = targets[expectedLevel] || targets.intermediate;
    const difference = Math.abs(koreanRatio - target.korean);
    
    let status = 'perfect';
    if (difference > target.tolerance * 1.5) status = 'poor';
    else if (difference > target.tolerance) status = 'fair';
    else if (difference > target.tolerance * 0.5) status = 'good';

    return {
      status,
      difference,
      target: target.korean,
      recommendation: difference > target.tolerance 
        ? `${expectedLevel} 레벨에서는 한국어 ${target.korean}% 사용을 권장합니다.`
        : '적절한 언어 비율입니다!'
    };
  }, []);

  const analysis = analyzeMessage(message.content);
  const languageEvaluation = evaluateLanguageRatio(analysis, message.expectedLevel);

  // 메시지 타입에 따른 스타일
  const getMessageStyles = () => {
    if (isUser) {
      return {
        container: 'bg-blue-500 text-white',
        header: '',
        timestamp: 'text-blue-100',
        actions: 'text-blue-100 hover:text-blue-900'
      };
    } else {
      return {
        container: 'bg-white text-gray-900 border border-gray-200',
        header: 'border-b border-gray-100',
        timestamp: 'text-gray-500',
        actions: 'text-gray-400 hover:text-gray-600'
      };
    }
  };

  const styles = getMessageStyles();

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}>
      <div 
        className={`max-w-xs lg:max-w-md xl:max-w-lg relative group ${styles.container} rounded-lg shadow-sm transition-all duration-200 hover:shadow-md`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        
        {/* 메시지 헤더 (AI 메시지만) */}
        {!isUser && (
          <div className={`flex items-center justify-between px-4 pt-3 pb-2 ${styles.header}`}>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">AI</span>
              </div>
              <span className="text-xs font-medium text-gray-700">한국어 튜터</span>
              
              {/* 메시지 시간 */}
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{dateUtils.formatKoreanDate(message.timestamp, { 
                  includeTime: true, 
                  format: 'short' 
                })}</span>
              </div>
            </div>
            
            {/* 감정 표시 */}
            <div className="flex items-center space-x-2">
              {message.emotion && (
                <EmotionIndicator 
                  emotion={message.emotion} 
                  size="sm"
                  showLabel={false}
                />
              )}
              
              {/* 분석 토글 버튼 */}
              {analysis && showAnalysis && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="메시지 분석 보기"
                >
                  <BarChart3 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* 메시지 내용 */}
        <div className={`${!isUser ? 'px-4' : 'p-4'} ${!isUser && 'pb-3'}`}>
          <div className="text-sm whitespace-pre-wrap leading-relaxed break-words">
            {message.content}
          </div>
          
          {/* 기본 분석 정보 (AI 메시지만) */}
          {!isUser && analysis && showAnalysis && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 text-gray-500">
                  <span>한국어 {analysis.koreanRatio}%</span>
                  <span>영어 {analysis.englishRatio}%</span>
                  <span>{numberUtils.formatNumber(analysis.wordCount)}단어</span>
                  <span>{analysis.sentenceCount}문장</span>
                </div>
                
                {/* 읽기 시간 */}
                <div className="text-gray-400">
                  읽기 {dateUtils.formatStudyTime(Math.ceil(analysis.readingTimeSeconds / 60))}
                </div>
              </div>
              
              {/* 언어 비율 평가 */}
              {languageEvaluation && (
                <div className={`mt-2 text-xs px-2 py-1 rounded ${
                  languageEvaluation.status === 'perfect' ? 'bg-green-50 text-green-600' :
                  languageEvaluation.status === 'good' ? 'bg-blue-50 text-blue-600' :
                  languageEvaluation.status === 'fair' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {languageEvaluation.recommendation}
                </div>
              )}
            </div>
          )}
          
          {/* 상세 분석 (토글) */}
          {!isUser && analysis && showDetailedAnalysis && (
            <div className="mt-3 pt-2 border-t border-gray-100 space-y-2">
              <div className="text-xs font-medium text-gray-700">상세 분석</div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>총 글자: {numberUtils.formatNumber(analysis.charCount)}</div>
                <div>한글: {numberUtils.formatNumber(analysis.koreanChars)}</div>
                <div>영어: {numberUtils.formatNumber(analysis.englishChars)}</div>
                <div>숫자: {numberUtils.formatNumber(analysis.numberChars)}</div>
                <div>문장당 단어: {analysis.averageWordsPerSentence}개</div>
                <div>구두점: {numberUtils.formatNumber(analysis.punctuationChars)}</div>
              </div>
              
              {/* 언어 비율 시각화 */}
              <div className="mt-2">
                <div className="flex items-center space-x-2 text-xs text-gray-600 mb-1">
                  <span>언어 비율</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full flex">
                    <div 
                      className="bg-blue-500"
                      style={{ width: `${analysis.koreanRatio}%` }}
                      title={`한국어 ${analysis.koreanRatio}%`}
                    />
                    <div 
                      className="bg-green-500"
                      style={{ width: `${analysis.englishRatio}%` }}
                      title={`영어 ${analysis.englishRatio}%`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 메시지 푸터 */}
        <div className={`flex items-center justify-between px-4 pb-3 ${!isUser ? 'pt-1' : ''}`}>
          <div className={`text-xs ${styles.timestamp}`}>
            {dateUtils.formatRelativeTime(message.timestamp)}
          </div>
          
          {/* 액션 버튼들 */}
          <div className={`flex items-center space-x-1 transition-opacity duration-200 ${
            showActions ? 'opacity-100' : 'opacity-0'
          }`}>
            
            {/* 복사 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={`p-1 hover:bg-gray-100 ${styles.actions}`}
              title="메시지 복사"
            >
              {copied ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
            
            {/* TTS 버튼 (AI 메시지만) */}
            {!isUser && onSpeak && showSpeakButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSpeak}
                disabled={isPlayingTTS}
                className={`p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 ${
                  isPlayingTTS ? 'animate-pulse' : ''
                }`}
                title={isPlayingTTS ? '재생 중...' : '음성으로 듣기'}
              >
                <Volume2 className="w-3 h-3" />
              </Button>
            )}
            
            {/* 북마크 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`p-1 hover:bg-gray-100 ${
                isBookmarked 
                  ? 'text-yellow-500' 
                  : styles.actions
              }`}
              title={isBookmarked ? '북마크 해제' : '북마크 추가'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-3 h-3" />
              ) : (
                <Bookmark className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
        
        {/* 피드백 버튼 (AI 메시지만) */}
        {!isUser && onFeedback && (
          <div className={`px-4 pb-3 transition-opacity duration-200 ${
            showActions ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">이 답변이 도움이 되었나요?</span>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('positive')}
                  className={`p-1 ${
                    feedbackGiven === 'positive' 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  }`}
                  title="도움됨"
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('negative')}
                  className={`p-1 ${
                    feedbackGiven === 'negative' 
                      ? 'text-red-600 bg-red-50' 
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title="도움 안됨"
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* 사용자 메시지 푸터 */}
        {isUser && (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between text-xs">
              <div className={`${styles.timestamp}`}>
                {dateUtils.formatKoreanDate(message.timestamp, { 
                  includeTime: true, 
                  format: 'short' 
                })}
              </div>
              
              {/* 메시지 상태 */}
              {message.status && (
                <div className="flex items-center space-x-1">
                  <span className="text-blue-100">
                    {message.status === 'sent' && '전송됨'}
                    {message.status === 'delivered' && '전달됨'}
                    {message.status === 'error' && '오류'}
                  </span>
                  
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center text-xs ${
                    message.status === 'sent' ? 'bg-blue-600' : 
                    message.status === 'delivered' ? 'bg-green-500' : 
                    message.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                  }`}>
                    {message.status === 'sent' && '✓'}
                    {message.status === 'delivered' && '✓✓'}
                    {message.status === 'error' && '!'}
                  </div>
                </div>
              )}
            </div>
            
            {/* 사용자 메시지 분석 (간단) */}
            {analysis && showAnalysis && (
              <div className="mt-2 text-xs text-blue-200">
                {analysis.wordCount}단어 • {analysis.koreanRatio}% 한국어
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;