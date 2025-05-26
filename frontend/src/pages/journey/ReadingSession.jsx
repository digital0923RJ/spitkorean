// src/pages/journey/ReadingSession.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Play, 
  Pause, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  RotateCcw,
  FastForward,
  Rewind,
  ChevronLeft,
  Settings,
  BookOpen,
  Award,
  Clock
} from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getJourneyContent, submitJourneyReading } from '../../api/journey';

// 액션
import { 
  fetchJourneyContent as loadContent,
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
  submitReading,
  selectCurrentContent,
  selectSession,
  selectPlayback,
  selectRecording,
  selectPronunciation,
  selectLoading,
  selectCurrentSentence,
  selectCanGoNext,
  selectCanGoPrevious
} from '../../store/slices/journeySlice.js';

// 컴포넌트
import ReadingPanel from '../../components/journey/ReadingPanel.jsx';
import HangulDisplay from '../../components/journey/HangulDisplay.jsx';
import PronunciationFeedback from '../../components/journey/PronunciationFeedback.jsx';

const ReadingSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux 상태
  const currentContent = useSelector(selectCurrentContent);
  const session = useSelector(selectSession);
  const playback = useSelector(selectPlayback);
  const recording = useSelector(selectRecording);
  const pronunciation = useSelector(selectPronunciation);
  const loading = useSelector(selectLoading);
  const currentSentence = useSelector(selectCurrentSentence);
  const canGoNext = useSelector(selectCanGoNext);
  const canGoPrevious = useSelector(selectCanGoPrevious);
  
  const { user } = useSelector(state => state.auth);
  
  // URL 상태에서 설정 가져오기
  const { level = 'level1', type = 'reading' } = location.state || {};
  
  // 로컬 상태 관리 (기존 상태들을 Redux로 이동하면서 최소화)
  const [showReadingPanel, setShowReadingPanel] = useState(true);
  const [error, setError] = useState(null);
  
  // 참조
  const audioRef = useRef(null);

  // 콘텐츠 로드
  useEffect(() => {
    if (!currentContent && !loading.content) {
      dispatch(loadContent({ level, type }));
    }
  }, [dispatch, currentContent, loading.content, level, type]);

  // 콘텐츠가 로드되면 세션 시작
  useEffect(() => {
    if (currentContent && !session.isActive) {
      dispatch(startSession({ content: currentContent }));
    }
  }, [dispatch, currentContent, session.isActive]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleTogglePlayback();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePreviousSentence();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNextSentence();
          break;
        case 'KeyR':
          e.preventDefault();
          handleToggleRecording();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // TTS 재생 토글
  const handleTogglePlayback = async () => {
    if (!currentSentence) return;
    
    dispatch(setPlaybackState(!playback.isPlaying));
    
    if (!playback.isPlaying) {
      // 실제로는 백엔드에서 TTS 오디오를 받아와야 함
      // 여기서는 Web Speech API 사용
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentSentence.text);
        utterance.lang = 'ko-KR';
        utterance.rate = playback.speed;
        utterance.volume = playback.isMuted ? 0 : playback.volume;
        
        utterance.onstart = () => dispatch(setPlaybackState(true));
        utterance.onend = () => {
          dispatch(setPlaybackState(false));
          // 자동으로 다음 문장으로 이동 (레벨 1, 2에서만)
          if ((level === 'level1' || level === 'level2') && canGoNext) {
            setTimeout(() => {
              dispatch(goToNextSentence());
              dispatch(markSentenceCompleted(session.currentSentenceIndex));
            }, 500);
          }
        };
        
        speechSynthesis.speak(utterance);
      }
    } else {
      // 재생 중지
      speechSynthesis.cancel();
    }
  };

  // 녹음 토글
  const handleToggleRecording = async () => {
    if (recording.isRecording) {
      // 녹음 중지 로직은 useVoice 훅에서 처리
      dispatch(stopRecording({ audioBlob: null, duration: 0 }));
    } else {
      // 녹음 시작
      dispatch(startRecording());
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // 실제 녹음 로직은 useVoice 훅에서 처리
        console.log('Recording started');
      } catch (err) {
        console.error('Recording error:', err);
        setError('녹음을 시작할 수 없습니다. 마이크 권한을 확인해주세요.');
        dispatch(stopRecording({ audioBlob: null, duration: 0 }));
      }
    }
  };

  // 이전 문장
  const handlePreviousSentence = () => {
    if (canGoPrevious) {
      dispatch(goToPreviousSentence());
      dispatch(setPlaybackState(false));
      speechSynthesis.cancel();
    }
  };

  // 다음 문장
  const handleNextSentence = () => {
    if (canGoNext) {
      dispatch(goToNextSentence());
      dispatch(markSentenceCompleted(session.currentSentenceIndex));
      dispatch(setPlaybackState(false));
      speechSynthesis.cancel();
    }
  };

  // 특정 문장으로 이동
  const goToSentence = (index) => {
    dispatch(setCurrentSentence(index));
    dispatch(setPlaybackState(false));
    speechSynthesis.cancel();
  };

  // 세션 완료
  const completeSession = async () => {
    try {
      const formData = new FormData();
      formData.append('content_id', currentContent.content_id);
      formData.append('reading_speed', playback.speed.toString());
      formData.append('completed_sentences', session.completedSentences.size.toString());
      
      if (recording.audioBlob) {
        formData.append('audio', recording.audioBlob, 'recording.wav');
      }
      
      await dispatch(submitReading(formData)).unwrap();
      dispatch(endSession());
      
      // 결과 페이지로 이동
      navigate('/journey/result', {
        state: {
          level,
          type,
          content: currentContent,
          completedSentences: session.completedSentences.size,
          totalSentences: session.totalSentences
        }
      });
      
    } catch (err) {
      console.error('Submit error:', err);
      setError('결과 제출에 실패했습니다.');
    }
  };

  // 속도 변경
  const changeSpeed = (newSpeed) => {
    dispatch(setPlaybackSpeed(newSpeed));
  };

  // 볼륨 변경
  const changeVolume = (newVolume) => {
    dispatch(setVolume(newVolume));
  };

  // 음소거 토글
  const handleToggleMute = () => {
    dispatch(toggleMute());
  };

  // 읽기 패널 완료 처리
  const handleReadingComplete = (data) => {
    completeSession();
  };

  // 읽기 패널 진행 상황 처리
  const handleReadingProgress = (progressData) => {
    console.log('Reading progress:', progressData);
  };

  if (loading.content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">리딩 콘텐츠를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <BookOpen className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-4">오류 발생</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={() => setError(null)} className="w-full">
              다시 시도
            </Button>
            <Button variant="outline" onClick={() => navigate('/journey')} className="w-full">
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = session.totalSentences > 0 
    ? (session.completedSentences.size / session.totalSentences) * 100 
    : 0;

  // ReadingPanel을 사용하는 경우
  if (showReadingPanel && currentContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        {/* 상단 헤더 */}
        <div className="bg-white shadow-sm p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/journey')}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>나가기</span>
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentContent?.title}
                </h1>
                <p className="text-sm text-gray-500">
                  문장 {session.currentSentenceIndex + 1} / {session.totalSentences}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 진행률 */}
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {session.completedSentences.size}/{session.totalSentences}
                </span>
              </div>
              
              {/* 클래식 뷰 전환 */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowReadingPanel(false)}
              >
                클래식 뷰
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          <ReadingPanel
            level={level}
            onComplete={handleReadingComplete}
            onProgress={handleReadingProgress}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  // 기존 클래식 뷰
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* 상단 헤더 */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/journey')}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>나가기</span>
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {currentContent?.title}
              </h1>
              <p className="text-sm text-gray-500">
                문장 {session.currentSentenceIndex + 1} / {session.totalSentences}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 진행률 */}
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {session.completedSentences.size}/{session.totalSentences}
              </span>
            </div>
            
            {/* 새 뷰 전환 */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowReadingPanel(true)}
            >
              새 뷰
            </Button>
            
            {/* 설정 */}
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* 메인 읽기 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              
              {/* 현재 문장 */}
              <div className="text-center mb-8">
                <div className="mb-4">
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    문장 {session.currentSentenceIndex + 1}
                  </span>
                </div>
                
                <div className="mb-6 min-h-[6em] flex items-center justify-center">
                  {level === 'level1' ? (
                    <HangulDisplay 
                      text={currentSentence?.text || ''}
                      level={level}
                      showBreakdown={true}
                      onCharacterClick={(char, index) => console.log('Character clicked:', char)}
                      className="text-2xl"
                    />
                  ) : (
                    <h2 className="text-2xl font-medium text-gray-900 leading-relaxed">
                      {currentSentence?.text || '문장을 불러오는 중...'}
                    </h2>
                  )}
                </div>
                
                {/* 발음 피드백 */}
                {pronunciation.currentScore !== null && (
                  <div className="mb-4">
                    <PronunciationFeedback 
                      score={pronunciation.currentScore}
                      analysis={pronunciation.analysis}
                      suggestions={pronunciation.feedback || []}
                      originalText={currentSentence?.text || ''}
                      onRetry={handleToggleRecording}
                      onPlayReference={handleTogglePlayback}
                      showDetailed={true}
                      className="max-w-lg mx-auto"
                    />
                  </div>
                )}
              </div>

              {/* 컨트롤 버튼 */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <Button
                  variant="outline"
                  onClick={handlePreviousSentence}
                  disabled={!canGoPrevious}
                  className="flex items-center space-x-2"
                >
                  <Rewind className="w-4 h-4" />
                  <span>이전</span>
                </Button>

                <Button
                  onClick={handleTogglePlayback}
                  disabled={!currentSentence}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                >
                  {playback.isPlaying ? (
                    <><Pause className="w-5 h-5 mr-2" />일시정지</>
                  ) : (
                    <><Play className="w-5 h-5 mr-2" />재생</>
                  )}
                </Button>

                <Button
                  onClick={handleToggleRecording}
                  disabled={!currentSentence}
                  className={`px-8 py-3 ${
                    recording.isRecording 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {recording.isRecording ? (
                    <><MicOff className="w-5 h-5 mr-2" />녹음 중지</>
                  ) : (
                    <><Mic className="w-5 h-5 mr-2" />녹음 시작</>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleNextSentence}
                  disabled={!canGoNext}
                  className="flex items-center space-x-2"
                >
                  <span>다음</span>
                  <FastForward className="w-4 h-4" />
                </Button>
              </div>

              {/* 재생 설정 */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* 속도 조절 */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">재생 속도</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">0.5x</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={playback.speed}
                      onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">2.0x</span>
                  </div>
                  <div className="text-center text-sm text-gray-600">{playback.speed}x</div>
                </div>

                {/* 볼륨 조절 */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">볼륨</label>
                  <div className="flex items-center space-x-2">
                    <button onClick={handleToggleMute}>
                      {playback.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={playback.isMuted ? 0 : playback.volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    {playback.isMuted ? '음소거' : `${Math.round(playback.volume * 100)}%`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 문장 목록 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">문장 목록</h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentContent?.content?.sentences?.map((sentence, index) => (
                  <button
                    key={index}
                    onClick={() => goToSentence(index)}
                    className={`w-full p-3 text-left rounded-lg border transition-all ${
                      index === session.currentSentenceIndex
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : session.completedSentences.has(index)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">문장 {index + 1}</span>
                      {session.completedSentences.has(index) && (
                        <Award className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {sentence.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 학습 가이드 */}
            {currentContent?.guide && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">학습 가이드</h3>
                
                <div className="space-y-4 text-sm">
                  {currentContent.guide.vocabulary?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">주요 어휘</h4>
                      <div className="space-y-1">
                        {currentContent.guide.vocabulary.slice(0, 3).map((vocab, index) => (
                          <div key={index} className="text-gray-600">{vocab}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {currentContent.guide.pronunciation?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">발음 팁</h4>
                      <div className="space-y-1">
                        {currentContent.guide.pronunciation.slice(0, 2).map((tip, index) => (
                          <div key={index} className="text-gray-600">{tip}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 완료 버튼 */}
            <Button
              onClick={completeSession}
              disabled={loading.submit || session.completedSentences.size === 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading.submit ? '제출 중...' : '학습 완료'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingSession;