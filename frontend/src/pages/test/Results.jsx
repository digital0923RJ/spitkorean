// src/pages/test/Results.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Trophy, 
  CheckCircle, 
  XCircle, 
  Target,
  TrendingUp,
  BookOpen,
  Home,
  RotateCcw,
  Share,
  ChevronDown,
  ChevronUp,
  Award,
  Download,
  Eye
} from 'lucide-react';
import Button from '../../components/common/Button';

// 액션
import { fetchTestResults } from '../../store/slices/testSlice.js';

// 컴포넌트
import ExplanationPanel from '../../components/test/ExplanationPanel.jsx';
import Card from '../../components/common/Card.jsx';

// 유틸리티
import { numberUtils } from '../../utils/format.js';

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // 결과 데이터 (QuizSession에서 전달받음)
  const { result, level, type, timeSpent } = location.state || {};
  
  // 상태 관리
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showExplanation, setShowExplanation] = useState({});
  
  // 결과가 없으면 테스트 홈으로 리다이렉트
  useEffect(() => {
    if (!result) {
      navigate('/test');
    } else {
      // 결과 페이지 방문 시 전체 결과 목록 새로고침
      dispatch(fetchTestResults());
    }
  }, [result, navigate, dispatch]);

  if (!result) {
    return null;
  }

  // 성과 등급 계산
  const getScoreGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'emerald', message: '완벽해요!' };
    if (score >= 80) return { grade: 'A', color: 'green', message: '훌륭해요!' };
    if (score >= 70) return { grade: 'B+', color: 'blue', message: '잘했어요!' };
    if (score >= 60) return { grade: 'B', color: 'yellow', message: '괜찮아요!' };
    return { grade: 'C', color: 'red', message: '더 연습해보세요!' };
  };

  const scoreGrade = getScoreGrade(result.score);

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  };

  // 정답률 계산
  const correctRate = (result.correct_count / result.total_questions) * 100;

  // 다시 시도
  const retryTest = () => {
    navigate('/test/quiz', {
      state: { level, type, count: result.total_questions }
    });
  };

  // 결과 공유
  const shareResult = () => {
    const shareText = `TOPIK ${level}급 시험에서 ${result.score}점을 받았어요! 🎉\n정답률: ${numberUtils.formatPercentage(correctRate)}`;
    if (navigator.share) {
      navigator.share({
        title: 'SpitKorean 테스트 결과',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('결과가 클립보드에 복사되었습니다!');
    }
  };

  // 결과 다운로드
  const downloadResult = () => {
    const resultData = {
      date: new Date().toISOString(),
      level,
      type,
      score: result.score,
      correctCount: result.correct_count,
      totalQuestions: result.total_questions,
      timeSpent,
      questions: result.graded_questions,
      weaknesses: result.weaknesses
    };

    const blob = new Blob([JSON.stringify(resultData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `topik-${level}-result-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 설명 패널 토글
  const toggleExplanation = (questionIndex) => {
    setShowExplanation(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  // 문제 상세 보기
  const viewQuestionDetail = (question, index) => {
    setSelectedQuestion({ ...question, index });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 결과 헤더 */}
        <Card className="text-center shadow-lg">
          <div className={`w-20 h-20 bg-${scoreGrade.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Trophy className={`w-10 h-10 text-${scoreGrade.color}-600`} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            시험 완료!
          </h1>
          
          <p className={`text-xl text-${scoreGrade.color}-600 font-semibold mb-4`}>
            {scoreGrade.message}
          </p>
          
          <div className="grid md:grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <div className={`text-4xl font-bold text-${scoreGrade.color}-600 mb-2`}>
                {result.score.toFixed(1)}점
              </div>
              <div className="text-gray-600">최종 점수</div>
              <div className={`text-sm text-${scoreGrade.color}-600 font-medium`}>
                {scoreGrade.grade}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {result.correct_count}/{result.total_questions}
              </div>
              <div className="text-gray-600">정답 수</div>
              <div className="text-sm text-gray-500">
                {numberUtils.formatPercentage(correctRate)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {formatTime(timeSpent)}
              </div>
              <div className="text-gray-600">소요 시간</div>
              <div className="text-sm text-gray-500">
                평균 {Math.round(timeSpent / result.total_questions)}초/문제
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                +{result.xp_earned}
              </div>
              <div className="text-gray-600">경험치</div>
              <div className="text-sm text-orange-600 font-medium">
                XP 획득
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Button
              variant="outline"
              onClick={() => setShowDetailedResults(!showDetailedResults)}
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>{showDetailedResults ? '간단히 보기' : '상세 보기'}</span>
              {showDetailedResults ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={shareResult}
              className="flex items-center space-x-2"
            >
              <Share className="w-4 h-4" />
              <span>결과 공유</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadResult}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>결과 저장</span>
            </Button>
          </div>
        </Card>

        {/* 상세 결과 */}
        {showDetailedResults && (
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* 문제별 결과 */}
            <Card className="shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">문제별 결과</h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {result.graded_questions.map((question, index) => (
                  <div key={index}>
                    <Card className="border border-gray-200 hover:shadow-md transition-shadow" padding="sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {question.is_correct ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            문제 {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm px-2 py-1 rounded ${
                            question.is_correct 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {question.is_correct ? '정답' : '오답'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExplanation(index)}
                            className="p-1"
                          >
                            {showExplanation[index] ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {question.question}
                      </p>
                      
                      <div className="text-xs space-y-1">
                        <div>
                          <span className="text-gray-500">내 답변: </span>
                          <span className={question.is_correct ? 'text-green-600' : 'text-red-600'}>
                            {question.user_answer}
                          </span>
                        </div>
                        {!question.is_correct && (
                          <div>
                            <span className="text-gray-500">정답: </span>
                            <span className="text-green-600">{question.correct_answer}</span>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* ExplanationPanel 사용 */}
                    {showExplanation[index] && (
                      <div className="mt-2">
                        <ExplanationPanel
                          question={{
                            question: question.question,
                            options: [question.user_answer, question.correct_answer],
                            type: type
                          }}
                          userAnswer={0} // 인덱스 기반
                          correctAnswer={1} // 인덱스 기반
                          explanation={question.explanation}
                          isCorrect={question.is_correct}
                          level={level}
                          grammarPoints={[]} // 실제 데이터가 있다면 사용
                          relatedConcepts={[]}
                          examples={[]}
                          showUserAnswer={true}
                          expanded={true}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* 분석 및 추천 */}
            <div className="space-y-6">
              
              {/* 약점 분석 */}
              {result.weaknesses && result.weaknesses.length > 0 && (
                <Card className="shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">약점 분석</h3>
                    <Target className="w-5 h-5 text-red-600" />
                  </div>
                  
                  <div className="space-y-3">
                    {result.weaknesses.map((weakness, index) => (
                      <Card key={index} className="bg-red-50 border border-red-200" padding="sm">
                        <div className="flex items-center justify-between">
                          <span className="text-red-700 text-sm">{weakness}</span>
                          <BookOpen className="w-4 h-4 text-red-600" />
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <Card className="bg-blue-50 border border-blue-200 mt-4" padding="sm">
                    <div className="text-sm text-blue-700">
                      💡 <strong>추천:</strong> 이 영역들을 집중적으로 복습해보세요!
                    </div>
                  </Card>
                </Card>
              )}

              {/* 성취도 분석 */}
              <Card className="shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">성취도 분석</h3>
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">정답률</span>
                    <span className="font-semibold text-gray-900">
                      {numberUtils.formatPercentage(correctRate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">평균 응답 시간</span>
                    <span className="font-semibold text-gray-900">
                      {Math.round(timeSpent / result.total_questions)}초
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">성취 등급</span>
                    <span className={`font-semibold text-${scoreGrade.color}-600`}>
                      {scoreGrade.grade}
                    </span>
                  </div>
                </div>
              </Card>

              {/* 레벨 추천 */}
              <Card className="shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">다음 단계</h3>
                
                {result.score >= 80 ? (
                  <Card className="bg-green-50 border border-green-200" padding="md">
                    <div className="text-green-700">
                      <strong>🎉 축하해요!</strong><br />
                      다음 레벨에 도전해보세요!
                    </div>
                    <Button 
                      className="w-full mt-3 bg-green-600 hover:bg-green-700"
                      onClick={() => navigate('/test/quiz', {
                        state: { level: level + 1, type, count: result.total_questions }
                      })}
                      disabled={level >= 6}
                    >
                      {level >= 6 ? '최고 레벨 달성!' : `TOPIK ${level + 1}급 도전하기`}
                    </Button>
                  </Card>
                ) : (
                  <Card className="bg-orange-50 border border-orange-200" padding="md">
                    <div className="text-orange-700">
                      <strong>💪 조금 더 연습해보세요!</strong><br />
                      같은 레벨을 다시 연습하시는 것을 추천해요.
                    </div>
                    <Button 
                      className="w-full mt-3 bg-orange-600 hover:bg-orange-700"
                      onClick={retryTest}
                    >
                      다시 도전하기
                    </Button>
                  </Card>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* 하단 액션 버튼 */}
        <Card className="shadow-lg">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/test')}
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>테스트 홈</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={retryTest}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>다시 시도</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/test/statistics')}
              className="flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>통계 보기</span>
            </Button>
            
            <Button
              onClick={() => navigate('/test/quiz', {
                state: { level, type: type === 'mixed' ? 'grammar' : 'mixed', count: 10 }
              })}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <BookOpen className="w-4 h-4" />
              <span>다른 유형 도전</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* 문제 상세 모달 (선택사항) */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  문제 {selectedQuestion.index + 1} 상세보기
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedQuestion(null)}
                  className="p-2"
                >
                  ✕
                </Button>
              </div>
              
              <ExplanationPanel
                question={{
                  question: selectedQuestion.question,
                  options: [selectedQuestion.user_answer, selectedQuestion.correct_answer],
                  type: type
                }}
                userAnswer={0}
                correctAnswer={1}
                explanation={selectedQuestion.explanation}
                isCorrect={selectedQuestion.is_correct}
                level={level}
                grammarPoints={[]}
                relatedConcepts={[]}
                examples={[]}
                showUserAnswer={true}
                expanded={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;