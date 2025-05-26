// src/pages/test/QuizSession.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag,
  BookOpen,
  AlertCircle,
  Save,
  Menu,
  X
} from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// 액션
import { 
  fetchTestQuestions, 
  submitTest,
  startSession,
  endSession,
  setCurrentQuestion,
  goToNextQuestion,
  goToPreviousQuestion,
  selectAnswer,
  updateTimer,
  toggleSidebar,
  selectCurrentQuestion,
  selectAnsweredQuestions,
  selectProgressPercentage,
  selectCurrentAnswer,
  selectCanSubmit,
  selectSessionActive
} from '../../store/slices/testSlice.js';

// 컴포넌트
import QuestionCard from '../../components/test/QuestionCard.jsx';
import ProgressTracker from '../../components/test/ProgressTracker.jsx';

const QuizSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux 상태
  const { user } = useSelector(state => state.auth);
  const {
    currentSession,
    settings,
    submission,
    ui
  } = useSelector(state => state.test);
  
  // 셀렉터 사용
  const currentQuestion = useSelector(selectCurrentQuestion);
  const answeredCount = useSelector(selectAnsweredQuestions);
  const progressPercent = useSelector(selectProgressPercentage);
  const currentAnswer = useSelector(selectCurrentAnswer);
  const canSubmit = useSelector(selectCanSubmit);
  const sessionActive = useSelector(selectSessionActive);
  
  // URL 상태에서 설정 가져오기
  const { level = 3, type = 'mixed', count = 10 } = location.state || {};
  
  // 로컬 상태
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  // 컴포넌트 마운트 시 세션 시작
  useEffect(() => {
    dispatch(startSession({ 
      level, 
      type, 
      count, 
      timeLimit: 1800 // 30분
    }));
    
    loadQuestions();
    
    // 컴포넌트 언마운트 시 세션 종료
    return () => {
      if (sessionActive) {
        dispatch(endSession());
      }
    };
  }, []);

  // 타이머 관리
  useEffect(() => {
    let timer;
    
    if (sessionActive && currentSession.timeRemaining > 0) {
      timer = setInterval(() => {
        const newTime = currentSession.timeRemaining - 1;
        dispatch(updateTimer(newTime));
        
        // 시간 종료 시 자동 제출
        if (newTime <= 0) {
          handleSubmit();
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [sessionActive, currentSession.timeRemaining, dispatch]);

  // 문제 로드
  const loadQuestions = async () => {
    try {
      await dispatch(fetchTestQuestions({ level, count, type })).unwrap();
    } catch (error) {
      console.error('Questions load error:', error);
    }
  };

  // 답안 선택 핸들러
  const handleAnswerSelect = (optionIndex) => {
    if (currentQuestion) {
      dispatch(selectAnswer({
        questionId: currentQuestion.id,
        optionIndex
      }));
    }
  };

  // 문제 네비게이션
  const handlePreviousQuestion = () => {
    dispatch(goToPreviousQuestion());
  };

  const handleNextQuestion = () => {
    dispatch(goToNextQuestion());
  };

  const handleGoToQuestion = (index) => {
    dispatch(setCurrentQuestion(index));
  };

  // 답안 제출
  const handleSubmit = async () => {
    if (submission.isSubmitting) return;
    
    const unansweredQuestions = currentSession.questions.length - answeredCount;
    
    if (unansweredQuestions > 0) {
      const confirmSubmit = window.confirm(
        `${unansweredQuestions}개의 문제가 답변되지 않았습니다. 제출하시겠습니까?`
      );
      if (!confirmSubmit) return;
    }
    
    try {
      // 답안 형식 변환
      const formattedAnswers = Object.entries(currentSession.answers)
        .filter(([_, answer]) => answer !== null)
        .map(([questionId, answer]) => ({
          question_id: questionId,
          answer: answer
        }));
      
      const result = await dispatch(submitTest({
        test_id: currentSession.testId,
        answers: formattedAnswers,
        timeSpent: 1800 - currentSession.timeRemaining
      })).unwrap();
      
      // 결과 페이지로 이동
      navigate('/test/result', {
        state: {
          result,
          level,
          type,
          timeSpent: 1800 - currentSession.timeRemaining
        }
      });
      
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  // 나가기 확인
  const handleExit = () => {
    if (answeredCount > 0) {
      setExitConfirmOpen(true);
    } else {
      confirmExit();
    }
  };

  const confirmExit = () => {
    dispatch(endSession());
    navigate('/test');
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 로딩 상태
  if (ui.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 에러 상태
  if (ui.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-4">오류 발생</h2>
          <p className="text-gray-600 mb-6">{ui.error}</p>
          <Button onClick={() => navigate('/test')}>
            테스트 홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 문제가 없는 경우
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-4">문제를 불러오는 중...</h2>
        </div>
      </div>
    );
  }

  const timeRemaining = currentSession.timeRemaining;
  const isLastQuestion = currentSession.currentQuestionIndex === currentSession.questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* 상단 헤더 */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExit}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>나가기</span>
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                TOPIK {level}급 • {type === 'mixed' ? '종합' : type}
              </h1>
              <p className="text-sm text-gray-500">
                문제 {currentSession.currentQuestionIndex + 1} / {currentSession.questions.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 진행률 토글 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProgressTracker(!showProgressTracker)}
              className="lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </Button>
            
            {/* 시간 */}
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className={`text-lg font-mono ${
                timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            {/* 진행률 */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {answeredCount}/{currentSession.questions.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* 문제 영역 */}
          <div className="lg:col-span-3 space-y-6">
            {/* QuestionCard 컴포넌트 사용 */}
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentSession.currentQuestionIndex + 1}
              totalQuestions={currentSession.questions.length}
              level={level}
              selectedAnswer={currentAnswer}
              onAnswerSelect={handleAnswerSelect}
              showResult={false}
              timeRemaining={timeRemaining}
              disabled={submission.isSubmitting}
            />

            {/* 네비게이션 버튼 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentSession.currentQuestionIndex === 0}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>이전</span>
                </Button>

                <div className="flex items-center space-x-3">
                  {/* 임시 저장 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                    onClick={() => {
                      // 임시 저장 기능 (브라우저 로컬 스토리지 등 사용)
                      localStorage.setItem('quiz_progress', JSON.stringify({
                        answers: currentSession.answers,
                        currentIndex: currentSession.currentQuestionIndex,
                        timeRemaining
                      }));
                      alert('진행 상황이 저장되었습니다.');
                    }}
                  >
                    <Save className="w-4 h-4" />
                    <span>저장</span>
                  </Button>
                  
                  {/* 제출/다음 버튼 */}
                  {isLastQuestion ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={submission.isSubmitting}
                      className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                    >
                      <Flag className="w-4 h-4" />
                      <span>{submission.isSubmitting ? '제출 중...' : '제출하기'}</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      className="flex items-center space-x-2"
                    >
                      <span>다음</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className={`lg:col-span-1 space-y-6 ${
            showProgressTracker ? 'block' : 'hidden lg:block'
          }`}>
            
            {/* 문제 목록 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">문제 목록</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(toggleSidebar())}
                  className="lg:hidden"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {currentSession.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => handleGoToQuestion(index)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-all ${
                      index === currentSession.currentQuestionIndex
                        ? 'bg-orange-600 text-white'
                        : currentSession.answers[question.id] !== null
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">답변함</span>
                  <span className="font-medium">{answeredCount}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">미답변</span>
                  <span className="font-medium">{currentSession.questions.length - answeredCount}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">남은 시간</span>
                  <span className={`font-medium ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submission.isSubmitting || !canSubmit}
                className="w-full mt-6 bg-green-600 hover:bg-green-700"
              >
                {submission.isSubmitting ? '제출 중...' : '시험 종료'}
              </Button>
            </div>

            {/* 진행률 추적기 (컴팩트 모드) */}
            <ProgressTracker
              stats={{
                total_tests: 0,
                average_score: 0,
                completion_rate: progressPercent,
                streak_days: 0
              }}
              recentTests={[]}
              weaknesses={[]}
              achievements={[]}
              level={level}
              compact={true}
              showDetails={false}
            />
          </div>
        </div>
      </div>

      {/* 나가기 확인 모달 */}
      {exitConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              정말 나가시겠습니까?
            </h3>
            <p className="text-gray-600 mb-6">
              현재까지의 답변이 저장되지 않습니다. 정말 나가시겠습니까?
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setExitConfirmOpen(false)}
                className="flex-1"
              >
                계속하기
              </Button>
              <Button
                onClick={confirmExit}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                나가기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSession;