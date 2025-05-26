// src/pages/profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Globe, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Clock,
  Edit3,
  Share2,
  Download,
  Settings,
  Crown,
  Star,
  Target,
  Zap,
  Users,
  Activity,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import SubscriptionStatus from '../../components/subscription/SubscriptionStatus';
import { PRODUCTS } from '../../shared/constants/products';
import { KOREAN_LEVELS, LANGUAGES } from '../../shared/constants/levels';
// 상수
import { ROUTES } from '../../shared/constants/routes.js';
// 유틸리티
import { dateUtils } from '../../utils/format.js';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 사용자 통계 로드
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // 실제로는 API 호출
        // const [statsData, achievementsData, subscriptionsData] = await Promise.all([
        //   api.get('/profile/stats'),
        //   api.get('/profile/achievements'),
        //   api.get('/profile/subscriptions')
        // ]);
        
        // 임시 데이터
        const mockStats = {
          totalStudyDays: 45,
          streakDays: 7,
          totalXP: 2450,
          currentLeague: 'gold',
          completedLessons: 128,
          averageScore: 85,
          studyTimeTotal: 3420, // 분
          lastActivity: new Date().toISOString()
        };
        
        const mockAchievements = [
          { id: '7_day_streak', name: '7일 연속 학습', description: '7일 연속으로 학습했어요!', icon: 'fire', earnedAt: '2024-01-15' },
          { id: 'grammar_expert', name: '문법 전문가', description: '50개 이상의 문법 포인트 마스터', icon: 'target', earnedAt: '2024-01-10' },
          { id: 'pronunciation_master', name: '발음 마스터', description: '95% 이상의 발음 정확도 달성', icon: 'mic', earnedAt: '2024-01-08' }
        ];
        
        const mockSubscriptions = [
          { id: 'sub1', productId: 'talk', status: 'active', price: 30, nextBillingDate: '2024-02-15' },
          { id: 'sub2', productId: 'test', status: 'active', price: 20, nextBillingDate: '2024-02-15' }
        ];
        
        setStats(mockStats);
        setAchievements(mockAchievements);
        setSubscriptions(mockSubscriptions);
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // 탭 구성
  const tabs = [
    { id: 'overview', label: '개요', icon: User },
    { id: 'stats', label: '통계', icon: TrendingUp },
    { id: 'achievements', label: '성취', icon: Award },
    { id: 'subscriptions', label: '구독', icon: Crown }
  ];

  // 상품 아이콘 매핑
  const getProductIcon = (productId) => {
    const iconMap = {
      talk: Users,
      drama: Star,
      test: Target,
      journey: Zap
    };
    return iconMap[productId] || BookOpen;
  };

  // 리그 정보
  const getLeagueInfo = (league) => {
    const leagues = {
      bronze: { name: '브론즈', color: 'text-amber-600', bg: 'bg-amber-100' },
      silver: { name: '실버', color: 'text-gray-600', bg: 'bg-gray-100' },
      gold: { name: '골드', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      diamond: { name: '다이아몬드', color: 'text-blue-600', bg: 'bg-blue-100' }
    };
    return leagues[league] || leagues.bronze;
  };

  const leagueInfo = getLeagueInfo(stats?.currentLeague);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 프로필</h1>
          <p className="text-gray-600 mt-1">학습 현황과 성과를 확인하세요</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.PROFILE.EDIT)}
            className="flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>편집</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.PROFILE.SETTINGS)}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>설정</span>
          </Button>
        </div>
      </div>

      {/* 사용자 기본 정보 */}
      <Card className="mb-8 p-6">
        <div className="flex items-start space-x-6">
          {/* 프로필 이미지 */}
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          
          {/* 기본 정보 */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.profile?.name || '사용자'}
              </h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${leagueInfo.bg} ${leagueInfo.color}`}>
                {leagueInfo.name} 리그
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>
                  {LANGUAGES.find(lang => lang.code === user?.profile?.nativeLanguage)?.name || '영어'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>
                  한국어 {KOREAN_LEVELS.find(level => level.id === user?.profile?.koreanLevel)?.name || '초급'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>
                  가입일: {user?.created_at ? dateUtils.formatKoreanDate(user.created_at, { format: 'short' }) : '정보 없음'}
                </span>
              </div>
            </div>
          </div>
          
          {/* 간단 통계 */}
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{stats?.totalXP || 0}</div>
            <div className="text-sm text-gray-600">총 XP</div>
            <div className="text-lg font-semibold text-green-600 mt-2">{stats?.streakDays || 0}일</div>
            <div className="text-sm text-gray-600">연속 학습</div>
          </div>
        </div>
      </Card>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      <div>
        {/* 개요 탭 */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 학습 통계 카드들 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">총 학습일</h3>
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats?.totalStudyDays || 0}일
              </div>
              <p className="text-sm text-gray-600">꾸준한 학습이 실력 향상의 비결!</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">완료한 레슨</h3>
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats?.completedLessons || 0}개
              </div>
              <p className="text-sm text-gray-600">평균 점수: {stats?.averageScore || 0}점</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">총 학습시간</h3>
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.floor((stats?.studyTimeTotal || 0) / 60)}시간
              </div>
              <p className="text-sm text-gray-600">
                {(stats?.studyTimeTotal || 0) % 60}분
              </p>
            </Card>
          </div>
        )}

        {/* 통계 탭 */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">학습 활동</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats?.totalXP || 0}</div>
                  <div className="text-sm text-gray-600">총 XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats?.streakDays || 0}</div>
                  <div className="text-sm text-gray-600">연속 학습일</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats?.averageScore || 0}%</div>
                  <div className="text-sm text-gray-600">평균 점수</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${leagueInfo.color}`}>{leagueInfo.name}</div>
                  <div className="text-sm text-gray-600">현재 리그</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">상품별 활동</h3>
              <div className="space-y-4">
                {Object.values(PRODUCTS).map((product) => {
                  const Icon = getProductIcon(product.id);
                  return (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-600">마지막 활동: 2일 전</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">85%</div>
                        <div className="text-sm text-gray-600">완료율</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* 성취 탭 */}
        {activeTab === 'achievements' && (
          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">획득한 성취</h3>
              
              {achievements.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {dateUtils.formatKoreanDate(achievement.earnedAt, { format: 'short' })} 획득
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">아직 획득한 성취가 없습니다</h4>
                  <p className="text-gray-600">학습을 계속하여 첫 번째 성취를 달성해보세요!</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* 구독 탭 */}
        {activeTab === 'subscriptions' && (
          <div>
            <SubscriptionStatus
              subscriptions={subscriptions}
              billingHistory={[]}
              usage={{}}
              onCancel={(id) => console.log('Cancel subscription:', id)}
              onPause={(id) => console.log('Pause subscription:', id)}
              onResume={(id) => console.log('Resume subscription:', id)}
              onUpdatePayment={(id) => console.log('Update payment:', id)}
              onDownloadInvoice={(id) => console.log('Download invoice:', id)}
              onUpgrade={() => navigate(ROUTES.SUBSCRIPTION.PLANS)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;