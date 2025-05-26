import React, { useState, useEffect, useRef, useCallback } from 'react';
// Redux 액션 importuseDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack,
  RotateCcw,
  BookOpen,
  Eye,
  EyeOff,
  Lightbulb,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import SpeedControl from './SpeedControl';
import HangulDisplay from './HangulDisplay';
import PronunciationFeedback from './PronunciationFeedback';

// 읽기 패널 전용 유틸리티 함수들
const readingPanelUtils = {
  // 다음 날 자정까지의 시간 계산
  getNextMidnight: () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  },

  // 현재 시간을 ISO 문자열로 반환
  getCurrentISO: () => {
    return new Date().toISOString();
  },

  // 두 날짜 간의 시간 차이 계산 (밀리초)
  getTimeDifference: (startTime) => {
    return Date.now() - startTime;
  }
};

// 유틸리티 함수들
const dateUtils = {
  // 다음 날 자정까지의 시간 계산
  getNextMidnight: () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  },

  // 현재 시간을 ISO 문자열로 반환
  getCurrentISO: () => {
    return new Date().toISOString();
  },

  // 두 날짜 간의 시간 차이 계산 (밀리초)
  getTimeDifference: (startTime) => {
    return Date.now() - startTime;
  }
};

// 훅 import
import useVoice from '../../hooks/useVoice';
import { 
  fetchJourneyContent,
  submitReading,
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
  startRecording,
  stopRecording,
  setPronunciationScore,
  toggleGuide,
  toggleTranslation,
  selectCurrentContent,
  selectSession,
  selectPlayback,
  selectRecording,
  selectPronunciation,
  selectUI,
  selectLoading,
  selectCurrentSentence,
  selectCanGoNext,
  selectCanGoPrevious
} from '../../store/slices/journeySlice';

const ReadingPanel = ({ 
  content = null,
  level = 'level1',
  onComplete = null,
  onProgress = null,
  className = '' 
}) => {
  // Redux 상태 및 디스패치
  const dispatch = useDispatch();
  const currentContent = useSelector(selectCurrentContent);
  const session = useSelector(selectSession);
  const playback = useSelector(selectPlayback);
  const recording = useSelector(selectRecording);
  const pronunciation = useSelector(selectPronunciation);
  const ui = useSelector(selectUI);
  const loading = useSelector(selectLoading);
  const currentSentence = useSelector(selectCurrentSentence);
  const canGoNext = useSelector(selectCanGoNext);
  const canGoPrevious = useSelector(selectCanGoPrevious);

  // useVoice 훅 사용
  const {
    isRecording,
    isProcessing,
    isPlayingTTS,
    audioLevel,
    recordingDuration,
    startRecording: startVoiceRecording,
    stopRecording: stopVoiceRecording,
    playTTS,
    analyzePronunciationAudio,
    voiceSettings,
    updateVoiceSettings
  } = useVoice();

  // 로컬 상태 (Redux와 연동)
  const [startTime, setStartTime] = useState(null);
  
  // 레퍼런스
  const textRef = useRef(null);

  // 레벨별 설정
  const levelConfigs = {
    level1: {
      name: '한글 마스터',
      defaultSpeed: 0.5,
      showHangulBreakdown: true,
      autoAdvance: true,
      features: ['hangul_guide', 'basic_pronunciation']
    },
    level2: {
      name: '기초 리더',
      defaultSpeed: 0.8,
      showHangulBreakdown: false,
      autoAdvance: true,
      features: ['pronunciation_rules', 'basic_vocabulary']
    },
    level3: {
      name: '중급 리더',
      defaultSpeed: 1.0,
      showHangulBreakdown: false,
      autoAdvance: false,
      features: ['intonation', 'connected_speech']
    },
    level4: {
      name: '고급 리더',
      defaultSpeed: 1.2,
      showHangulBreakdown: false,
      autoAdvance: false,
      features: ['natural_rhythm', 'advanced_expressions']
    }
  };

  const config = levelConfigs[level] || levelConfigs.level1;

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    if (!currentContent && !loading.content) {
      // 콘텐츠가 없으면 로드
      dispatch(fetchJourneyContent({ level, type: 'reading' }));
    }
  }, [dispatch, currentContent, loading.content, level]);

  // 콘텐츠 변경 시 세션 시작
  useEffect(() => {
    if (currentContent && !session.isActive) {
      dispatch(startSession({ content: currentContent }));
      dispatch(setPlaybackSpeed(config.defaultSpeed));
      setStartTime(Date.now());
    }
  }, [dispatch, currentContent, session.isActive, config.defaultSpeed]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayback();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePreviousSentence();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNextSentence();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          if (!isRecording) handleStartRecording();
          else handleStopRecording();
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          dispatch(toggleGuide());
          break;
        case 't':
        case 'T':
          e.preventDefault();
          dispatch(toggleTranslation());
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRecording, dispatch]);

  // 현재 문장 정보
  const sentences = currentContent?.content?.sentences || [];
  const totalSentences = sentences.length;

  // TTS 음성 재생
  const handlePlayTTS = useCallback(async (text, speed = playback.speed) => {
    try {
      dispatch(setPlaybackState(true));
      
      const success = await playTTS(text, {
        speed,
        voiceGender: voiceSettings.ttsVoiceGender
      });

      if (success && config.autoAdvance && canGoNext) {
        setTimeout(() => {
          dispatch(goToNextSentence());
          dispatch(markSentenceCompleted(session.currentSentenceIndex));
        }, 1000);
      }
    } catch (err) {
      console.error('TTS error:', err);
      toast.error('음성 재생에 실패했습니다.');
    } finally {
      dispatch(setPlaybackState(false));
    }
  }, [dispatch, playTTS, playback.speed, voiceSettings.ttsVoiceGender, config.autoAdvance, canGoNext, session.currentSentenceIndex]);

  // 재생/일시정지 토글
  const togglePlayback = () => {
    if (!currentSentence) return;

    if (playback.isPlaying || isPlayingTTS) {
      dispatch(setPlaybackState(false));
    } else {
      handlePlayTTS(currentSentence.text);
    }
  };

  // 다음 문장
  const handleNextSentence = () => {
    if (canGoNext) {
      dispatch(goToNextSentence());
      dispatch(setPlaybackState(false));
      dispatch(markSentenceCompleted(session.currentSentenceIndex));
      
      // 진행 상황 리포트
      if (onProgress) {
        onProgress({
          currentIndex: session.currentSentenceIndex + 1,
          totalSentences,
          completedCount: session.completedSentences.size + 1,
          completionRate: ((session.completedSentences.size + 1) / totalSentences) * 100
        });
      }
      
      // 진행 상황 토스트
      const completionRate = Math.round(((session.completedSentences.size + 1) / totalSentences) * 100);
      if (completionRate === 25 || completionRate === 50 || completionRate === 75) {
        toast.success(`진행률 ${completionRate}% 달성! 🎯`);
      }
    }
  };

  // 이전 문장
  const handlePreviousSentence = () => {
    if (canGoPrevious) {
      dispatch(goToPreviousSentence());
      dispatch(setPlaybackState(false));
    }
  };

  // 처음부터 다시
  const resetReading = () => {
    dispatch(setCurrentSentence(0));
    dispatch(setPlaybackState(false));
    dispatch(setPronunciationScore({ score: null, analysis: null, feedback: null }));
    setStartTime(Date.now());
  };

  // 음성 녹음 시작
  const handleStartRecording = async () => {
    if (!currentSentence) return;
    
    try {
      dispatch(startRecording());
      const success = await startVoiceRecording();
      
      if (!success) {
        dispatch(stopRecording({ audioBlob: null, duration: 0 }));
        toast.error('녹음을 시작할 수 없습니다.');
      }
    } catch (error) {
      console.error('Recording start failed:', error);
      toast.error('녹음 시작에 실패했습니다.');
      dispatch(stopRecording({ audioBlob: null, duration: 0 }));
    }
  };

  // 음성 녹음 중지 및 분석
  const handleStopRecording = async () => {
    if (!isRecording || !currentSentence) return;

    try {
      const audioBlob = await stopVoiceRecording();
      dispatch(stopRecording({ audioBlob, duration: recordingDuration }));

      if (audioBlob) {
        // 발음 분석 수행
        const analysisResult = await analyzePronunciationAudio(
          audioBlob, 
          currentSentence.text, 
          level
        );

        if (analysisResult) {
          dispatch(setPronunciationScore({
            score: analysisResult.score,
            analysis: analysisResult.analysis,
            feedback: analysisResult.improvements
          }));
          
          // 성공 토스트
          if (analysisResult.score >= 80) {
            toast.success(`훌륭한 발음입니다! ${analysisResult.score}점`);
          } else if (analysisResult.score >= 60) {
            toast('좋은 발음이에요! 조금 더 연습해보세요.', { icon: '👍' });
          } else {
            toast('발음을 더 연습해보세요.', { icon: '💪' });
          }
        }
      }
    } catch (error) {
      console.error('Recording analysis failed:', error);
      toast.error('발음 분석에 실패했습니다.');
    }
  };

  // 속도 변경 처리
  const handleSpeedChange = (newSpeed) => {
    dispatch(setPlaybackSpeed(newSpeed));
    updateVoiceSettings({ ttsSpeed: newSpeed });
  };

  // 볼륨 변경 처리
  const handleVolumeChange = (newVolume) => {
    dispatch(setVolume(newVolume));
  };

  // 음소거 토글
  const handleToggleMute = () => {
    dispatch(toggleMute());
  };

  // 전체 완료
  const completeReading = async () => {
    const finalData = {
      content_id: currentContent.content_id,
      completed_sentences: totalSentences,
      reading_speed: playback.speed,
      pronunciation_score: pronunciation.currentScore || 0,
      duration: startTime ? dateUtils.getTimeDifference(startTime) : 0
    };

    try {
      await dispatch(submitReading(finalData)).unwrap();
      dispatch(endSession());
      
      toast.success('읽기를 완료했습니다! 🎉');
      
      if (onComplete) {
        onComplete(finalData);
      }
    } catch (error) {
      console.error('Reading completion failed:', error);
      toast.error('완료 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 문장별 진행률 계산
  const getProgress = () => {
    return (session.currentSentenceIndex / Math.max(1, totalSentences - 1)) * 100;
  };

  if (loading.content) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 text-center ${className}`}>
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          읽기 콘텐츠를 불러오는 중...
        </h3>
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!currentContent) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 text-center ${className}`}>
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          콘텐츠를 불러올 수 없습니다
        </h3>
        <Button 
          onClick={() => {
            dispatch(fetchJourneyContent({ level, type: 'reading' }));
            toast.loading('콘텐츠를 다시 불러오는 중...');
          }}
          className="mt-4"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      
      {/* 헤더 */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{currentContent.title}</h2>
            <p className="text-gray-600">{currentContent.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {config.name}
            </span>
            <span className="text-sm text-gray-500">
              {session.currentSentenceIndex + 1} / {totalSentences}
            </span>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* 메인 읽기 영역 */}
      <div className="p-6">
        
        {/* 현재 문장 표시 */}
        <div className="text-center mb-8">
          <div 
            ref={textRef}
            className="text-2xl md:text-3xl leading-relaxed text-gray-900 mb-4 min-h-[100px] flex items-center justify-center"
          >
            {currentSentence ? (
              config.showHangulBreakdown ? (
                <HangulDisplay 
                  text={currentSentence.text}
                  level={level}
                  showBreakdown={true}
                />
              ) : (
                <span className="tracking-wide">{currentSentence.text}</span>
              )
            ) : (
              <span className="text-gray-400">문장을 선택하세요</span>
            )}
          </div>

          {/* 번역 표시 */}
          {ui.showTranslation && currentSentence?.translation && (
            <div className="text-lg text-gray-600 italic mb-4">
              "{currentSentence.translation}"
            </div>
          )}

          {/* 발음 피드백 */}
          {pronunciation.currentScore !== null && (
            <PronunciationFeedback 
              score={pronunciation.currentScore}
              analysis={pronunciation.analysis}
              suggestions={pronunciation.feedback || []}
              originalText={currentSentence?.text || ''}
              onRetry={handleStartRecording}
              onPlayReference={() => handlePlayTTS(currentSentence?.text)}
              className="mb-4"
            />
          )}
        </div>

        {/* 컨트롤 패널 */}
        <div className="space-y-6">
          
          {/* 메인 재생 컨트롤 */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousSentence}
              disabled={!canGoPrevious}
              className="p-3"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              onClick={togglePlayback}
              disabled={!currentSentence}
              className={`p-4 ${
                playback.isPlaying || isPlayingTTS 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded-full`}
            >
              {playback.isPlaying || isPlayingTTS ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextSentence}
              disabled={!canGoNext}
              className="p-3"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* 속도 및 볼륨 컨트롤 */}
          <div className="flex items-center justify-center space-x-6">
            <SpeedControl
              speed={playback.speed}
              onSpeedChange={handleSpeedChange}
              level={level}
            />

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleMute}
                className="p-2"
              >
                {playback.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={playback.isMuted ? 0 : playback.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                disabled={playback.isMuted}
              />
            </div>
          </div>

          {/* 추가 컨트롤 */}
          <div className="flex items-center justify-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(toggleGuide())}
              className={`flex items-center space-x-2 ${ui.showGuide ? 'bg-yellow-50 border-yellow-200' : ''}`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>{ui.showGuide ? '가이드 숨기기' : '학습 가이드'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(toggleTranslation())}
              className={`flex items-center space-x-2 ${ui.showTranslation ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              {ui.showTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>번역</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={resetReading}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>처음부터</span>
            </Button>
          </div>

          {/* 음성 녹음 버튼 (레벨 2 이상) */}
          {level !== 'level1' && (
            <div className="text-center">
              <Button
                variant={isRecording ? "solid" : "outline"}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isProcessing}
                className={`flex items-center space-x-2 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : ''
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${
                  isRecording ? 'bg-white' : 'bg-red-500'
                }`} />
                <span>
                  {isProcessing 
                    ? '분석 중...' 
                    : isRecording 
                    ? '녹음 중지' 
                    : '발음 연습'
                  }
                </span>
              </Button>
              
              {/* 녹음 레벨 표시 */}
              {isRecording && (
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-100"
                      style={{ width: `${audioLevel * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round(recordingDuration / 1000)}s
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 학습 가이드 */}
        {ui.showGuide && currentContent.guide && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              학습 가이드
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* 어휘 */}
              {currentContent.guide.vocabulary?.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">주요 어휘</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    {currentContent.guide.vocabulary.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 발음 팁 */}
              {currentContent.guide.pronunciation?.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">발음 팁</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    {currentContent.guide.pronunciation.map((tip, index) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 문장 네비게이션 */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="font-medium text-gray-900 mb-4">문장 목록</h3>
          <div className="grid gap-2 max-h-40 overflow-y-auto">
            {sentences.map((sentence, index) => (
              <button
                key={index}
                onClick={() => {
                  dispatch(setCurrentSentence(index));
                  dispatch(setPlaybackState(false));
                }}
                className={`text-left p-3 rounded-lg transition-colors ${
                  index === session.currentSentenceIndex
                    ? 'bg-blue-100 border-blue-200 text-blue-900'
                    : session.completedSentences.has(index)
                    ? 'bg-green-50 border-green-200 text-green-900'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                } border`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate">{sentence.text}</span>
                  <div className="flex items-center space-x-1 ml-2">
                    {session.completedSentences.has(index) && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                    <span className="text-xs text-gray-500">{index + 1}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 완료 버튼 */}
        {session.currentSentenceIndex === totalSentences - 1 && (
          <div className="mt-6 text-center">
            <Button
              onClick={completeReading}
              disabled={loading.submit}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
            >
              {loading.submit ? '제출 중...' : '읽기 완료하기'}
            </Button>
          </div>
        )}
      </div>

      {/* 키보드 단축키 안내 */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
        <div className="text-xs text-gray-500 text-center space-x-4">
          <span>스페이스: 재생/일시정지</span>
          <span>←/→: 이전/다음 문장</span>
          <span>R: 녹음</span>
          <span>G: 가이드</span>
          <span>T: 번역</span>
        </div>
      </div>
    </div>
  );
};

export default ReadingPanel;