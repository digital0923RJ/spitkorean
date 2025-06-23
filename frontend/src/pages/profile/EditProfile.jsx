// src/pages/profile/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Globe, 
  BookOpen, 
  Save, 
  X, 
  Upload, 
  Camera,
  ArrowLeft,
  AlertCircle,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import Card from '../../components/common/Card';
//import { KOREAN_LEVELS, LANGUAGES } from '../../shared/constants/levels';
// 액션
import { updateUserProfile } from '../../store/slices/authSlice.js';
// 유틸리티
import { validators, formValidators } from '../../utils/validation.js';
import { ROUTES } from '../../shared/constants/routes.js';
import LanguageSelector from '../../components/common/LanguageSelector.jsx';

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Redux 상태
  const { isProfileUpdateLoading, profileUpdateError } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nativeLanguage: 'en',
    koreanLevel: 'beginner',
    interests: [],
    studyGoals: [],
    dailyStudyTime: 15
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // 유효성 검사기 초기화
  const validator = formValidators.profile();

  // 폼 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.profile?.name || '',
        email: user.email || '',
        nativeLanguage: user.profile?.nativeLanguage || 'en',
        koreanLevel: user.profile?.koreanLevel || 'beginner',
        interests: user.profile?.interests || [],
        studyGoals: user.preferences?.studyGoals || [],
        dailyStudyTime: user.preferences?.dailyStudyTime || 15
      });
    }
  }, [user]);

  // Redux 에러 상태 감시
  useEffect(() => {
    if (profileUpdateError) {
      setErrors({ general: profileUpdateError });
    }
  }, [profileUpdateError]);

  // 입력값 변경 처리
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 실시간 유효성 검사
    const isValid = validator.validateField(field, value, formData);
    if (!isValid) {
      setErrors(prev => ({
        ...prev,
        [field]: validator.getFieldError(field)
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 관심사 토글
  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  // 학습 목표 토글
  const toggleStudyGoal = (goal) => {
    setFormData(prev => ({
      ...prev,
      studyGoals: prev.studyGoals.includes(goal)
        ? prev.studyGoals.filter(g => g !== goal)
        : [...prev.studyGoals, goal]
    }));
  };

  // 프로필 이미지 업로드
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 타입 검증
      if (!validators.fileType(file, ['image/jpeg', 'image/png', 'image/webp'])) {
        setErrors(prev => ({
          ...prev,
          profileImage: '지원하지 않는 파일 형식입니다. JPG, PNG, WEBP 파일만 업로드 가능합니다.'
        }));
        return;
      }

      // 파일 크기 검증 (5MB)
      if (!validators.fileSize(file, 5)) {
        setErrors(prev => ({
          ...prev,
          profileImage: '파일 크기는 5MB 이하여야 합니다.'
        }));
        return;
      }

      // 에러 제거
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.profileImage;
        return newErrors;
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 언어 변경 처리
  const handleLanguageChange = (languageCode) => {
    handleInputChange('nativeLanguage', languageCode);
  };

  // 유효성 검사
  const validateForm = () => {
    const { isValid, errors: validationErrors } = validator.validateForm(formData);
    
    // 추가 검증 (관심사, 학습 목표는 선택사항이므로 별도 검증하지 않음)
    const additionalErrors = {};

    // 모든 에러 합치기
    const allErrors = { ...validationErrors, ...additionalErrors };
    setErrors(allErrors);
    
    return Object.keys(allErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const resultAction = await dispatch(updateUserProfile({
        profile: {
          name: formData.name,
          nativeLanguage: formData.nativeLanguage,
          koreanLevel: formData.koreanLevel,
          interests: formData.interests
        },
        preferences: {
          studyGoals: formData.studyGoals,
          dailyStudyTime: formData.dailyStudyTime
        }
      }));

      // 성공 처리
      if (updateUserProfile.fulfilled.match(resultAction)) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setErrors({}); // 에러 클리어
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      setErrors({ general: '프로필 업데이트에 실패했습니다' });
    }
  };

  // 관심사 옵션
  const interestOptions = [
    '한국 드라마', 'K-Pop', '한국 영화', '한국 요리',
    '한국 역사', '한국 문화', '비즈니스', '여행',
    '학업', 'IT/기술', '예술', '스포츠'
  ];

  // 학습 목표 옵션
  const studyGoalOptions = [
    'TOPIK 시험 준비', '일상 대화', '비즈니스 한국어',
    '한국 여행', '한국 대학 진학', '한국 취업',
    '한국 문화 이해', '취미 활동'
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            <h1 className="text-3xl font-bold text-gray-900">프로필 편집</h1>
            <p className="text-gray-600 mt-1">개인 정보와 학습 설정을 수정하세요</p>
          </div>
        </div>

        {saved && (
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            <Check className="w-4 h-4" />
            <span>저장되었습니다</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">기본 정보</h2>
          
          {/* 프로필 이미지 */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  formData.name.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">프로필 사진</h3>
              <p className="text-sm text-gray-600">JPG, PNG, WEBP 파일만 업로드 가능합니다 (최대 5MB)</p>
              {errors.profileImage && (
                <p className="text-sm text-red-600 mt-1">{errors.profileImage}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="이름"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              icon={User}
              placeholder="홍길동"
            />

            <Input
              label="이메일"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              icon={Mail}
              placeholder="example@email.com"
              disabled // 이메일은 보통 변경 불가
            />
          </div>
        </Card>

        {/* 언어 설정 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">언어 설정</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모국어
              </label>
              <LanguageSelector
                variant="default"
                showFlag={true}
                showName={true}
                showNativeName={false}
                onLanguageChange={handleLanguageChange}
                className="w-full"
              />
              {errors.nativeLanguage && (
                <p className="text-sm text-red-600 mt-1">{errors.nativeLanguage}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                한국어 레벨
              </label>
              <Dropdown
                options={KOREAN_LEVELS.map(level => ({ value: level.id, label: level.name }))}
                value={formData.koreanLevel}
                onChange={(value) => handleInputChange('koreanLevel', value)}
                placeholder="레벨을 선택하세요"
                icon={BookOpen}
                error={errors.koreanLevel}
              />
            </div>
          </div>
        </Card>

        {/* 관심사 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">관심사</h2>
          <p className="text-gray-600 mb-4">관심 있는 분야를 선택하면 맞춤형 콘텐츠를 제공받을 수 있습니다</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`p-3 rounded-lg border-2 transition-colors text-sm ${
                  formData.interests.includes(interest)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </Card>

        {/* 학습 목표 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">학습 목표</h2>
          <p className="text-gray-600 mb-4">한국어를 배우는 목적을 선택해주세요</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {studyGoalOptions.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleStudyGoal(goal)}
                className={`p-3 rounded-lg border-2 transition-colors text-sm text-left ${
                  formData.studyGoals.includes(goal)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </Card>

        {/* 학습 설정 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">학습 설정</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              일일 학습 목표 시간
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={formData.dailyStudyTime}
                onChange={(e) => handleInputChange('dailyStudyTime', parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="text-lg font-medium text-gray-900 min-w-16">
                {formData.dailyStudyTime}분
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              권장: 초급자 15분, 중급자 30분, 고급자 60분
            </p>
          </div>
        </Card>

        {/* 에러 메시지 */}
        {(errors.general || profileUpdateError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{errors.general || profileUpdateError}</span>
          </div>
        )}

        {/* 저장 버튼 */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.PROFILE.BASE)}
          >
            취소
          </Button>
          
          <Button
            type="submit"
            disabled={isProfileUpdateLoading}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isProfileUpdateLoading ? '저장 중...' : '저장하기'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;