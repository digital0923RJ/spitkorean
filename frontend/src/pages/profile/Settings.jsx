// src/pages/profile/Settings.jsx
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon,
  ArrowLeft,
  Globe,
  Bell,
  Shield,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Download,
  Trash2,
  AlertCircle,
  Check,
  HelpCircle,
  ExternalLink,
  Smartphone,
  Mail,
  Lock,
  Key,
  Database,
  FileText,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Buttom.jsx';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Dropdown from '../../components/common/Dropdown';
import { ROUTES } from '../../shared/constants/routes.js';
// 액션
import { updateUserProfile } from '../../store/slices/authSlice.js';
import LanguageSelector from '../../components/common/LanguageSelector.jsx';

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  
  // Redux 상태
  const { isProfileUpdateLoading, profileUpdateError } = useSelector(state => state.auth);
  
  // 설정 상태
  const [settings, setSettings] = useState({
    // 앱 설정
    theme: 'system', // 'light', 'dark', 'system'
    language: 'ko',
    soundEnabled: true,
    autoPlay: true,
    animationsEnabled: true,
    
    // 알림 설정
    pushNotifications: true,
    emailNotifications: true,
    studyReminders: true,
    achievementNotifications: true,
    weeklyReports: true,
    
    // 학습 설정
    autoAdvance: false,
    showHints: true,
    pronunciationFeedback: true,
    grammarCorrections: true,
    
    // 개인정보 설정
    profileVisibility: 'public', // 'public', 'friends', 'private'
    showProgress: true,
    showAchievements: true,
    allowDataCollection: true
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('general');

  // 설정 초기화
  useEffect(() => {
    // 실제로는 API에서 사용자 설정을 가져옴
    // const userSettings = await api.getUserSettings();
    // setSettings(userSettings);
    
    // 임시 데이터
    if (user?.preferences) {
      setSettings(prev => ({
        ...prev,
        language: user.profile?.nativeLanguage || 'ko',
        ...user.preferences
      }));
    }
  }, [user]);

  // 설정 변경 처리
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 설정 저장
  const handleSaveSettings = async () => {
    try {
      const resultAction = await dispatch(updateUserProfile({
        preferences: settings
      }));

      if (updateUserProfile.fulfilled.match(resultAction)) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('설정 저장 실패:', error);
    }
  };

  // 테마 변경
  const handleThemeChange = (theme) => {
    handleSettingChange('theme', theme);
    
    // 실제 테마 적용
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // system
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    }
  };

  // 데이터 내보내기
  const handleExportData = () => {
    // 실제로는 API 호출하여 데이터 내보내기
    console.log('데이터 내보내기 요청');
    setShowDataExportModal(false);
  };

  // 학습 진행도 초기화
  const handleResetProgress = () => {
    // 실제로는 API 호출하여 진행도 초기화
    console.log('학습 진행도 초기화');
    setShowResetModal(false);
  };

  // 계정 삭제
  const handleDeleteAccount = () => {
    // 실제로는 API 호출하여 계정 삭제
    console.log('계정 삭제 요청');
    setShowDeleteModal(false);
    logout();
  };

  // 언어 변경 처리
  const handleLanguageChange = (languageCode) => {
    handleSettingChange('language', languageCode);
  };

  // 섹션 목록
  const sections = [
    { id: 'general', label: '일반', icon: SettingsIcon },
    { id: 'notifications', label: '알림', icon: Bell },
    { id: 'learning', label: '학습', icon: Globe },
    { id: 'privacy', label: '개인정보', icon: Shield },
    { id: 'advanced', label: '고급', icon: Database }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.PROFILE.BASE)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>뒤로가기</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">설정</h1>
            <p className="text-gray-600 mt-1">앱 설정과 개인정보를 관리하세요</p>
          </div>
        </div>

        {saved && (
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            <Check className="w-4 h-4" />
            <span>설정이 저장되었습니다</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* 사이드바 네비게이션 */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-3 space-y-6">
          {/* 일반 설정 */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">일반 설정</h2>
                
                {/* 언어 설정 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      앱 언어
                    </label>
                    <LanguageSelector
                      variant="default"
                      showFlag={true}
                      showName={true}
                      showNativeName={true}
                      onLanguageChange={handleLanguageChange}
                      className="max-w-md"
                    />
                    <p className="text-sm text-gray-600 mt-1">앱의 기본 언어를 설정합니다</p>
                  </div>

                  {/* 테마 설정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      테마
                    </label>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                          settings.theme === 'light'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        <span>라이트</span>
                      </button>
                      
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                          settings.theme === 'dark'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        <span>다크</span>
                      </button>
                      
                      <button
                        onClick={() => handleThemeChange('system')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                          settings.theme === 'system'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Monitor className="w-4 h-4" />
                        <span>시스템</span>
                      </button>
                    </div>
                  </div>

                  {/* 사운드 설정 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">효과음</label>
                      <p className="text-sm text-gray-600">앱 내 효과음을 활성화합니다</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 애니메이션 설정 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">애니메이션</label>
                      <p className="text-sm text-gray-600">부드러운 애니메이션 효과를 활성화합니다</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('animationsEnabled', !settings.animationsEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.animationsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 알림 설정 */}
          {activeSection === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">알림 설정</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">푸시 알림</label>
                    <p className="text-sm text-gray-600">앱 알림을 받습니다</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">이메일 알림</label>
                    <p className="text-sm text-gray-600">이메일로 알림을 받습니다</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">학습 리마인더</label>
                    <p className="text-sm text-gray-600">학습 시간을 알려줍니다</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('studyReminders', !settings.studyReminders)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.studyReminders ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.studyReminders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">성취 알림</label>
                    <p className="text-sm text-gray-600">배지 획득 시 알림을 받습니다</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('achievementNotifications', !settings.achievementNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.achievementNotifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.achievementNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">주간 리포트</label>
                    <p className="text-sm text-gray-600">주간 학습 보고서를 받습니다</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('weeklyReports', !settings.weeklyReports)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.weeklyReports ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* 학습 설정 */}
          {activeSection === 'learning' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">학습 설정</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">자동 진행</label>
                    <p className="text-sm text-gray-600">정답 시 자동으로 다음 문제로 진행합니다</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('autoAdvance', !settings.autoAdvance)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoAdvance ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoAdvance ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">힌트 표시</label>
                    <p className="text-sm text-gray-600">어려운 문제에서 힌트를 제공합니다</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('showHints', !settings.showHints)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.showHints ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.showHints ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">발음 피드백</label>
                    <p className="text-sm text-gray-600">발음 연습 시 실시간 피드백을 제공합니다</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('pronunciationFeedback', !settings.pronunciationFeedback)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.pronunciationFeedback ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.pronunciationFeedback ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">문법 교정</label>
                    <p className="text-sm text-gray-600">문법 오류를 자동으로 교정해줍니다</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('grammarCorrections', !settings.grammarCorrections)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.grammarCorrections ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.grammarCorrections ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* 개인정보 설정 */}
          {activeSection === 'privacy' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">개인정보 설정</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    프로필 공개 범위
                  </label>
                  <Dropdown
                    options={[
                      { value: 'public', label: '전체 공개' },
                      { value: 'friends', label: '친구만' },
                      { value: 'private', label: '비공개' }
                    ]}
                    value={settings.profileVisibility}
                    onChange={(value) => handleSettingChange('profileVisibility', value)}
                    className="max-w-xs"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">학습 진행도 공개</label>
                    <p className="text-sm text-gray-600">다른 사용자가 내 진행도를 볼 수 있습니다</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('showProgress', !settings.showProgress)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.showProgress ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.showProgress ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">성취 공개</label>
                    <p className="text-sm text-gray-600">획득한 배지를 다른 사용자가 볼 수 있습니다</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('showAchievements', !settings.showAchievements)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.showAchievements ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.showAchievements ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">데이터 수집 허용</label>
                    <p className="text-sm text-gray-600">서비스 개선을 위한 익명화된 데이터 수집을 허용합니다</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('allowDataCollection', !settings.allowDataCollection)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.allowDataCollection ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.allowDataCollection ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* 고급 설정 */}
          {activeSection === 'advanced' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">데이터 관리</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Download className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">데이터 내보내기</div>
                        <div className="text-sm text-gray-600">내 학습 데이터를 다운로드합니다</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowDataExportModal(true)}
                    >
                      내보내기
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <RotateCcw className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="font-medium text-gray-900">학습 진행도 초기화</div>
                        <div className="text-sm text-gray-600">모든 학습 기록을 초기화합니다</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowResetModal(true)}
                      className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                    >
                      초기화
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center space-x-3">
                      <Trash2 className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-medium text-gray-900">계정 삭제</div>
                        <div className="text-sm text-gray-600">계정과 모든 데이터를 영구 삭제합니다</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteModal(true)}
                      className="text-red-600 border-red-600 hover:bg-red-100"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              disabled={isProfileUpdateLoading}
              className="flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>{isProfileUpdateLoading ? '저장 중...' : '설정 저장'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <Modal
        isOpen={showDataExportModal}
        onClose={() => setShowDataExportModal(false)}
        title="데이터 내보내기"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            학습 기록, 진행도, 설정 등 모든 데이터를 JSON 형식으로 내보냅니다.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDataExportModal(false)}
            >
              취소
            </Button>
            <Button onClick={handleExportData}>
              내보내기
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="학습 진행도 초기화"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-gray-900 font-medium">정말 초기화하시겠습니까?</p>
              <p className="text-gray-600 text-sm mt-1">
                모든 학습 진행도, XP, 연속 학습일이 초기화됩니다. 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowResetModal(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleResetProgress}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              초기화
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="계정 삭제"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-gray-900 font-medium">계정을 영구 삭제하시겠습니까?</p>
              <p className="text-gray-600 text-sm mt-1">
                계정과 모든 데이터가 즉시 삭제되며, 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;