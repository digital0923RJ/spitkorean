// src/components/subscription/PlanComparison.jsx
import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Star,
  Users,
  Target,
  Zap,
  BookOpen,
  Crown,
  ArrowRight,
  Info,
  Calculator,
  Sparkles
} from 'lucide-react';
// 컴포넌트
import Card from '../common/Card';
import PlanCard from './PlanCard';
import Button, { PrimaryButton, OutlineButton } from '@/components/common/Button';
import TranslatableText, { T } from '@/components/common/TranslatableText';
// 상수
import { SUBSCRIPTION_PLANS } from '../../shared/constants/subscriptions';
// 유틸리티
import { formatPrice } from '../../utils/format';

const PlanComparison = ({ 
  plans = [],
  bundles = [],
  onSelectPlan,
  highlightedPlan = null,
  showBundles = true,
  currentSubscriptions = [],
  showPlanCards = false, // PlanCard 컴포넌트 사용 여부
  billingPeriod = 'monthly'
}) => {
  const [viewMode, setViewMode] = useState('features'); // 'features' | 'pricing' | 'cards'
  const [selectedBilling, setSelectedBilling] = useState(billingPeriod);

  // 전체 요금제 목록 (개별 + 번들) - SUBSCRIPTION_PLANS 우선 사용
  const individualPlans = Object.values(SUBSCRIPTION_PLANS);
  const allPlans = [
    ...individualPlans,
    ...(showBundles ? bundles : [])
  ];

  // 비교할 요금제들 (plans가 비어있으면 전체)
  const comparisonPlans = plans.length > 0 ? plans : allPlans;

  // 요금제 아이콘 매핑
  const getIcon = (planId) => {
    const iconMap = {
      talk: Users,
      drama: Star,
      test: Target,
      journey: Zap,
      bundle: Crown
    };
    return iconMap[planId] || BookOpen;
  };

  // 요금제 색상 매핑
  const getColor = (planId) => {
    const colorMap = {
      talk: 'blue',
      drama: 'purple',
      test: 'green',
      journey: 'orange',
      bundle: 'yellow'
    };
    return colorMap[planId] || 'gray';
  };

  // 가격 계산 (할인 적용)
  const calculatePrice = (plan) => {
    const basePrice = plan.price || 0;
    if (selectedBilling === 'annual') {
      return basePrice * 0.8; // 20% 연간 할인
    }
    return basePrice;
  };

  // 기능 비교 매트릭스
  const featureMatrix = [
    {
      category: '핵심 기능',
      features: [
        {
          name: 'AI 대화 학습',
          description: '실시간 한국어 대화 연습',
          plans: {
            talk: true,
            drama: false,
            test: false,
            journey: false,
            bundle: true
          }
        },
        {
          name: '드라마 문장 구성',
          description: '실제 드라마 대사로 문법 학습',
          plans: {
            talk: false,
            drama: true,
            test: false,
            journey: false,
            bundle: true
          }
        },
        {
          name: 'TOPIK 시험 대비',
          description: '1-6급 모의고사 및 문제 풀이',
          plans: {
            talk: false,
            drama: false,
            test: true,
            journey: false,
            bundle: true
          }
        },
        {
          name: '발음 및 리딩 훈련',
          description: '한글부터 고급까지 체계적 학습',
          plans: {
            talk: false,
            drama: false,
            test: false,
            journey: true,
            bundle: true
          }
        }
      ]
    },
    {
      category: '학습 지원',
      features: [
        {
          name: '감정 분석',
          description: 'AI 기반 감정 인식 및 피드백',
          plans: {
            talk: true,
            drama: false,
            test: false,
            journey: false,
            bundle: true
          }
        },
        {
          name: '발음 평가',
          description: 'Whisper AI 기반 정확한 발음 분석',
          plans: {
            talk: true,
            drama: true,
            test: false,
            journey: true,
            bundle: true
          }
        },
        {
          name: '약점 분석',
          description: '개인화된 학습 약점 분석 및 추천',
          plans: {
            talk: false,
            drama: false,
            test: true,
            journey: false,
            bundle: true
          }
        },
        {
          name: '진도 추적',
          description: '상세한 학습 진행률 및 통계',
          plans: {
            talk: true,
            drama: true,
            test: true,
            journey: true,
            bundle: true
          }
        }
      ]
    },
    {
      category: '콘텐츠',
      features: [
        {
          name: '다국어 해설',
          description: '14개 언어로 문법 설명',
          plans: {
            talk: true,
            drama: true,
            test: true,
            journey: true,
            bundle: true
          }
        },
        {
          name: '실시간 문제 생성',
          description: 'GPT-4 기반 매일 새로운 문제',
          plans: {
            talk: true,
            drama: true,
            test: true,
            journey: true,
            bundle: true
          }
        },
        {
          name: '시사 반영 콘텐츠',
          description: '최신 뉴스와 트렌드 반영',
          plans: {
            talk: true,
            drama: false,
            test: true,
            journey: false,
            bundle: true
          }
        }
      ]
    },
    {
      category: '게임화',
      features: [
        {
          name: 'XP 및 레벨 시스템',
          description: '학습 동기부여를 위한 포인트 시스템',
          plans: {
            talk: true,
            drama: true,
            test: true,
            journey: true,
            bundle: true
          }
        },
        {
          name: '연속 학습 보상',
          description: '꾸준한 학습에 대한 특별 혜택',
          plans: {
            talk: true,
            drama: true,
            test: true,
            journey: true,
            bundle: true
          }
        },
        {
          name: '소셜 리그',
          description: '다른 학습자와의 경쟁 및 순위',
          plans: {
            talk: false,
            drama: false,
            test: true,
            journey: false,
            bundle: true
          }
        }
      ]
    }
  ];

  // 구독 상태 확인
  const isSubscribed = (planId) => {
    if (planId === 'bundle') {
      return Object.keys(SUBSCRIPTION_PLANS).every(id => 
        currentSubscriptions?.includes(id.toLowerCase())
      );
    }
    return currentSubscriptions?.includes(planId);
  };

  return (
    <Card className="shadow-lg border border-gray-200" padding="none">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              <T>요금제 비교</T>
            </h2>
            <p className="text-gray-600 mt-1">
              <T>자신에게 맞는 최적의 학습 플랜을 선택하세요</T>
            </p>
          </div>
          
          {/* 보기 모드 전환 */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('features')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'features'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <T>기능 비교</T>
            </button>
            <button
              onClick={() => setViewMode('pricing')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'pricing'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <T>가격 비교</T>
            </button>
            {showPlanCards && (
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <T>카드 보기</T>
              </button>
            )}
          </div>
        </div>

        {/* 결제 주기 선택 */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedBilling === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <T>월간 결제</T>
            </button>
            <button
              onClick={() => setSelectedBilling('annual')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors relative ${
                selectedBilling === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <T>연간 결제</T>
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded-full">
                <T>20% 할인</T>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* PlanCard 컴포넌트 사용 모드 */}
          {viewMode === 'cards' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {comparisonPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isSelected={highlightedPlan === plan.id}
                    isPopular={plan.id === 'bundle' || plan.id === 'talk'}
                    isBundle={plan.id === 'bundle'}
                    onSelect={onSelectPlan}
                    onSubscribe={onSelectPlan}
                    billingPeriod={selectedBilling}
                    annualDiscount={selectedBilling === 'annual' ? 20 : 0}
                    currentSubscriptions={currentSubscriptions}
                    showComparison={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 가격 비교 모드 */}
          {viewMode === 'pricing' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {comparisonPlans.map((plan) => {
                  const Icon = getIcon(plan.id);
                  const color = getColor(plan.id);
                  const price = calculatePrice(plan);
                  const isPopular = plan.id === 'bundle' || plan.id === 'talk';
                  const subscribed = isSubscribed(plan.id);

                  return (
                    <Card 
                      key={plan.id}
                      variant={highlightedPlan === plan.id ? 'primary' : 'default'}
                      hover
                      clickable
                      onClick={() => onSelectPlan?.(plan)}
                      className={`relative transition-all ${
                        isPopular ? 'transform scale-105' : ''
                      }`}
                    >
                      {/* 인기 배지 */}
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className={`bg-${color}-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1`}>
                            <Sparkles className="w-3 h-3" />
                            <T>추천</T>
                          </div>
                        </div>
                      )}

                      <div className="text-center space-y-4">
                        {/* 아이콘 */}
                        <div className={`w-12 h-12 mx-auto rounded-full bg-${color}-100 flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 text-${color}-600`} />
                        </div>

                        {/* 이름 */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            <T>{plan.name}</T>
                          </h3>
                          <p className="text-sm text-gray-600">
                            <T>{plan.description}</T>
                          </p>
                        </div>

                        {/* 가격 */}
                        <div>
                          <div className="text-3xl font-bold text-gray-900">
                            {formatPrice(price)}
                          </div>
                          <div className="text-sm text-gray-600">
                            /<T>월</T>
                          </div>
                          {selectedBilling === 'annual' && (
                            <div className="text-xs text-green-600 mt-1">
                              <T>연간 {formatPrice(price * 12)}</T>
                            </div>
                          )}
                        </div>

                        {/* 일일 제한 */}
                        {(plan.dailyLimit || plan.daily_limit) && (
                          <div className="text-sm text-gray-600">
                            <T>일일 {plan.dailyLimit || plan.daily_limit}회 이용</T>
                          </div>
                        )}

                        {/* 버튼 */}
                        {!subscribed ? (
                          <PrimaryButton
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPlan?.(plan);
                            }}
                            className={`w-full bg-${color}-600 hover:bg-${color}-700`}
                            textKey="선택하기"
                          />
                        ) : (
                          <Card variant="success" padding="sm">
                            <div className="flex items-center justify-center space-x-2 text-green-700">
                              <Check className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                <T>구독중</T>
                              </span>
                            </div>
                          </Card>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 기능 비교 모드 */}
          {viewMode === 'features' && (
            <div>
              {/* 헤더 행 */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-6 gap-4 p-4">
                  <div className="col-span-2">
                    <h3 className="font-medium text-gray-900">
                      <T>기능</T>
                    </h3>
                  </div>
                  {comparisonPlans.slice(0, 4).map((plan) => {
                    const Icon = getIcon(plan.id);
                    const color = getColor(plan.id);
                    const subscribed = isSubscribed(plan.id);

                    return (
                      <div key={plan.id} className="text-center">
                        <div className={`w-8 h-8 mx-auto rounded-full bg-${color}-100 flex items-center justify-center mb-2`}>
                          <Icon className={`w-4 h-4 text-${color}-600`} />
                        </div>
                        <div className="font-medium text-gray-900 text-sm">
                          <T>{plan.name}</T>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {formatPrice(calculatePrice(plan))}/<T>월</T>
                        </div>
                        {subscribed && (
                          <div className="mt-1">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              <T>구독중</T>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 기능 비교 행들 */}
              {featureMatrix.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  {/* 카테고리 헤더 */}
                  <div className="bg-gray-100 border-b border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900">
                      <T>{category.category}</T>
                    </h4>
                  </div>

                  {/* 기능들 */}
                  {category.features.map((feature, featureIndex) => (
                    <div 
                      key={featureIndex}
                      className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="col-span-2">
                        <div className="font-medium text-gray-900">
                          <T>{feature.name}</T>
                        </div>
                        <div className="text-sm text-gray-600 mt-1 flex items-center space-x-1">
                          <Info className="w-3 h-3" />
                          <T>{feature.description}</T>
                        </div>
                      </div>
                      
                      {comparisonPlans.slice(0, 4).map((plan) => (
                        <div key={plan.id} className="text-center">
                          {feature.plans[plan.id] ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 푸터 */}
      <div className="p-6 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            💡 <T>모든 요금제는 30일 환불 보장 및 7일 무료 체험을 제공합니다</T>
          </div>
          
          <Button
            className="flex items-center space-x-2"
            onClick={() => onSelectPlan?.(comparisonPlans.find(p => p.id === 'bundle'))}
          >
            <Calculator className="w-4 h-4" />
            <T>요금 계산기</T>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PlanComparison;