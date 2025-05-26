import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MessageCircle, 
  Calendar, 
  Clock, 
  ArrowLeft,
  Search,
  Filter,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  ChevronRight
} from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card, { StatsCard, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { T } from '@/components/common/TranslatableText';

// Redux 액션
import { 
  loadSessions,
  clearErrors,
  selectSessions,
  selectIsLoadingSessions,
  selectSessionError,
  selectStats
} from '../../store/slices/talkSlice.js';

// 유틸리티
import { dateUtils, spitKoreanUtils } from '../../utils/format.js';

// 상수
import { ROUTES } from '../../shared/constants/routes.js';
import { getConversationLevel } from '../../shared/constants/levels';

const SessionHistory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux 상태
  const { user } = useSelector(state => state.auth);
  const sessions = useSelector(selectSessions);
  const isLoading = useSelector(selectIsLoadingSessions);
  const error = useSelector(selectSessionError);
  const stats = useSelector(selectStats);
  
  // 로컬 상태
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent, oldest, longest
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  const [selectedMessageCount, setSelectedMessageCount] = useState('all');

  // 사용자 레벨 정보
  const userLevel = user?.profile?.koreanLevel || 'beginner';
  const levelConfig = getConversationLevel(userLevel);

  // 데이터 로드
  useEffect(() => {
    dispatch(clearErrors());
    dispatch(loadSessions());
  }, [dispatch]);

  // 필터링 및 검색
  useEffect(() => {
    filterAndSortSessions();
  }, [sessions, searchTerm, selectedLevel, sortBy, selectedDateRange, selectedEmotion, selectedMessageCount]);

  const filterAndSortSessions = () => {
    if (!Array.isArray(sessions)) {
      setFilteredSessions([]);
      return;
    }

    let filtered = [...sessions];

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.sessionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dateUtils.formatKoreanDate(session.date).includes(searchTerm) ||
        session.sessionId?.slice(0, 8).includes(searchTerm)
      );
    }

    // 레벨 필터
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(session => 
        session.level === selectedLevel || userLevel === selectedLevel
      );
    }

    // 날짜 범위 필터
    if (selectedDateRange) {
      const targetDate = new Date(selectedDateRange);
      const targetDateStr = targetDate.toDateString();
      
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.toDateString() === targetDateStr;
      });
    }

    // 감정 필터 (향후 백엔드에서 감정 데이터 제공 시)
    if (selectedEmotion !== 'all') {
      // TODO: 백엔드에서 세션별 주요 감정 정보 제공 필요
    }

    // 메시지 수 필터 (향후 백엔드에서 메시지 카운트 제공 시)
    if (selectedMessageCount !== 'all') {
      // TODO: 백엔드에서 세션별 메시지 카운트 제공 필요
    }

    // 정렬
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.updated_at || b.date) - new Date(a.updated_at || a.date));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'longest':
        // TODO: 메시지 수로 정렬 (백엔드에서 메시지 카운트 제공 필요)
        filtered.sort((a, b) => new Date(b.updated_at || b.date) - new Date(a.updated_at || a.date));
        break;
      default:
        break;
    }

    setFilteredSessions(filtered);
  };

  // 세션 삭제 (향후 구현)
  const deleteSession = async (sessionId) => {
    if (window.confirm('이 대화를 삭제하시겠습니까?')) {
      // TODO: 백엔드 DELETE API 구현 필요
      console.log('Delete session:', sessionId);
    }
  };

  // 세션 상세 보기
  const viewSession = (sessionId) => {
    navigate(`/talk/session/${sessionId}`);
  };

  // 통계 계산
  const calculateStats = () => {
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return { total: 0, thisWeek: 0, thisMonth: 0, avgPerWeek: 0 };
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeekSessions = sessions.filter(s => new Date(s.date) > weekAgo);
    const thisMonthSessions = sessions.filter(s => new Date(s.date) > monthAgo);

    // 주 평균 계산
    const oldestSession = sessions[sessions.length - 1];
    const firstSessionDate = oldestSession ? new Date(oldestSession.date) : now;
    const weeksSinceFirst = Math.max(1, Math.ceil((now - firstSessionDate) / (7 * 24 * 60 * 60 * 1000)));

    return {
      total: sessions.length,
      thisWeek: thisWeekSessions.length,
      thisMonth: thisMonthSessions.length,
      avgPerWeek: Math.round(sessions.length / weeksSinceFirst)
    };
  };

  const calculatedStats = calculateStats();

  // 레벨별 색상 설정
  const getLevelColor = (level) => {
    const levelInfo = getConversationLevel(level || userLevel);
    return levelInfo?.color || 'blue';
  };

  // 세션 카드 렌더링
  const renderSessionCard = (session) => {
    const sessionLevel = session.level || userLevel;
    const levelColor = getLevelColor(sessionLevel);
    const levelInfo = getConversationLevel(sessionLevel);

    return (
      <Card
        key={session.sessionId}
        hover
        clickable
        onClick={() => viewSession(session.sessionId)}
        className="transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className={`p-3 bg-${levelColor}-100 rounded-lg`}>
              <MessageCircle className={`w-6 h-6 text-${levelColor}-600`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-gray-900">
                  <T fallback="대화 세션">대화 세션</T>
                </h3>
                <span className={`px-2 py-1 bg-${levelColor}-100 text-${levelColor}-800 text-xs rounded-full font-medium`}>
                  <T fallback={levelInfo?.name}>{levelInfo?.name}</T>
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{dateUtils.formatKoreanDate(session.date, { format: 'short' })}</span>
                </span>
                
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{dateUtils.formatRelativeTime(session.updated_at || session.date)}</span>
                </span>
                
                <span className="text-xs text-gray-400 font-mono">
                  ID: {session.sessionId?.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                viewSession(session.sessionId);
              }}
              className="flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span><T fallback="보기">보기</T></span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                deleteSession(session.sessionId);
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 헤더 카드 */}
        <Card>
          <CardHeader
            titleKey="대화 기록"
            subtitleKey="지금까지의 AI 대화를 모두 확인해보세요"
            action={
              <div className="flex items-center space-x-3">
                <Link to={ROUTES.TALK.HOME}>
                  <Button
                    variant="ghost" 
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span><T fallback="Talk 홈">Talk 홈</T></span>
                  </Button>
                </Link>
                
                <Link to={ROUTES.TALK.CHAT}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <T fallback="새 대화 시작">새 대화 시작</T>
                  </Button>
                </Link>
              </div>
            }
          />

          {/* 통계 섹션 */}
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <StatsCard
                titleKey="총 대화"
                value={calculatedStats.total}
                icon={<MessageCircle className="w-6 h-6" />}
                variant="info"
              />
              
              <StatsCard
                titleKey="이번 주"
                value={calculatedStats.thisWeek}
                icon={<Calendar className="w-6 h-6" />}
                variant="success"
              />
              
              <StatsCard
                titleKey="이번 달"
                value={calculatedStats.thisMonth}
                icon={<Clock className="w-6 h-6" />}
                variant="warning"
              />
              
              <StatsCard
                titleKey="주평균"
                value={calculatedStats.avgPerWeek}
                icon={<TrendingUp className="w-6 h-6" />}
                variant="primary"
              />
            </div>
          </CardBody>
        </Card>

        {/* 검색 및 필터 카드 */}
        <Card>
          <CardBody>
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              
              {/* 검색 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="세션 ID나 날짜로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 정렬 */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent"><T fallback="최신순">최신순</T></option>
                <option value="oldest"><T fallback="오래된순">오래된순</T></option>
                <option value="longest"><T fallback="대화량순">대화량순</T></option>
              </select>

              {/* 레벨 필터 */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all"><T fallback="모든 레벨">모든 레벨</T></option>
                <option value="beginner"><T fallback="초급">초급</T></option>
                <option value="intermediate"><T fallback="중급">중급</T></option>
                <option value="advanced"><T fallback="고급">고급</T></option>
              </select>

              {/* 필터 토글 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span><T fallback="필터">필터</T></span>
              </Button>
            </div>

            {/* 고급 필터 */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <T fallback="날짜 선택">날짜 선택</T>
                    </label>
                    <input
                      type="date"
                      value={selectedDateRange}
                      onChange={(e) => setSelectedDateRange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <T fallback="감정 필터">감정 필터</T>
                    </label>
                    <select 
                      value={selectedEmotion}
                      onChange={(e) => setSelectedEmotion(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all"><T fallback="모든 감정">모든 감정</T></option>
                      <option value="happy"><T fallback="긍정적">긍정적</T></option>
                      <option value="neutral"><T fallback="중립">중립</T></option>
                      <option value="sad"><T fallback="부정적">부정적</T></option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <T fallback="메시지 수">메시지 수</T>
                    </label>
                    <select 
                      value={selectedMessageCount}
                      onChange={(e) => setSelectedMessageCount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all"><T fallback="전체">전체</T></option>
                      <option value="short"><T fallback="짧은 대화 (1-5개)">짧은 대화 (1-5개)</T></option>
                      <option value="medium"><T fallback="보통 대화 (6-15개)">보통 대화 (6-15개)</T></option>
                      <option value="long"><T fallback="긴 대화 (16개+)">긴 대화 (16개+)</T></option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* 세션 목록 카드 */}
        <Card>
          <CardHeader
            title={`대화 목록 (${filteredSessions.length}개)`}
            titleKey={`대화 목록 (${filteredSessions.length}개)`}
          />

          <CardBody>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="text-red-800"><T fallback={error}>{error}</T></div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => dispatch(loadSessions())}
                  className="mt-2"
                >
                  <T fallback="다시 시도">다시 시도</T>
                </Button>
              </div>
            )}

            {filteredSessions.length > 0 ? (
              <div className="space-y-4">
                {filteredSessions.map(renderSessionCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  <T fallback={searchTerm || selectedLevel !== 'all' ? '검색 결과가 없습니다' : '아직 대화가 없습니다'}>
                    {searchTerm || selectedLevel !== 'all' ? '검색 결과가 없습니다' : '아직 대화가 없습니다'}
                  </T>
                </h3>
                <p className="text-gray-500 mb-4">
                  <T fallback={searchTerm || selectedLevel !== 'all' 
                    ? '검색 조건을 변경하거나 새로운 대화를 시작해보세요'
                    : '첫 번째 AI 대화를 시작해보세요!'
                  }>
                    {searchTerm || selectedLevel !== 'all' 
                      ? '검색 조건을 변경하거나 새로운 대화를 시작해보세요'
                      : '첫 번째 AI 대화를 시작해보세요!'
                    }
                  </T>
                </p>
                <Link to={ROUTES.TALK.CHAT}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <T fallback="새 대화 시작하기">새 대화 시작하기</T>
                  </Button>
                </Link>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SessionHistory;