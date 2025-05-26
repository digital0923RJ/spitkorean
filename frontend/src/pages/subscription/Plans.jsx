import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Check, 
  Star, 
  Crown, 
  Zap, 
  MessageCircle,
  BookOpen,
  GraduationCap,
  Map,
  ArrowRight,
  Info,
  Gift,
  Percent
} from 'lucide-react';
import Button, { PrimaryButton, OutlineButton } from '@/components/common/Button';
import TranslatableText, { T } from '@/components/common/TranslatableText';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PlanComparison from '../../components/subscription/PlanComparison.jsx';
import { PRODUCTS, BUNDLE_PACKAGES } from '../../shared/constants/products';
import { SUBSCRIPTION_PLANS } from '../../shared/constants/subscriptions.js';

const Plans = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  // 상태 관리
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly, annual
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(false);

  // 상품 아이콘 매핑
  const productIcons = {
    talk: MessageCircle,
    drama: BookOpen,
    test: GraduationCap,
    journey: Map
  };

  // 상품 색상 매핑
  const productColors = {
    talk: 'blue',
    drama: 'purple', 
    test: 'green',
    journey: 'orange'
  };

  // 상품 선택/해제
  const toggleProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // 전체 선택
  const selectAllProducts = () => {
    const allProductIds = Object.keys(PRODUCTS);
    setSelectedProducts(allProductIds);
  };

  // 선택 초기화
  const clearSelection = () => {
    setSelectedProducts([]);
  };

  // 가격 계산
  const calculatePrice = () => {
    if (selectedProducts.length === 0) return { original: 0, discounted: 0, discount: 0 };

    const originalPrice = selectedProducts.reduce((total, productId) => {
      return total + PRODUCTS[productId].price;
    }, 0);

    let discountRate = 0;
    let discountedPrice = originalPrice;

    // 번들 할인 적용
    if (selectedProducts.length === 2) {
      discountRate = BUNDLE_PACKAGES.bundle_2.discount;
    } else if (selectedProducts.length === 3) {
      discountRate = BUNDLE_PACKAGES.bundle_3.discount;
    } else if (selectedProducts.length === 4) {
      discountRate = BUNDLE_PACKAGES.bundle_all.discount;
      discountedPrice = BUNDLE_PACKAGES.bundle_all.price; // 고정 가격
    }

    if (selectedProducts.length < 4) {
      discountedPrice = originalPrice * (1 - discountRate);
    }

    // 연간 결제 추가 할인
    if (billingCycle === 'annual') {
      discountedPrice *= 0.8; // 20% 추가 할인
    }

    return {
      original: originalPrice,
      discounted: discountedPrice,
      discount: discountRate,
      annualDiscount: billingCycle === 'annual' ? 0.2 : 0
    };
  };

  // 구독하기
  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (selectedProducts.length === 0) {
      alert('최소 1개 이상의 상품을 선택해주세요.');
      return;
    }

    // 결제 페이지로 이동
    const query = new URLSearchParams({
      products: selectedProducts.join(','),
      billing: billingCycle
    });
    
    navigate(`/subscription/checkout?${query}`);
  };

  // 무료 체험
  const startFreeTrial = (productId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // 무료 체험 시작 로직
    navigate(`/${productId}`);
  };

  // PlanComparison 컴포넌트용 핸들러
  const handleSelectPlan = (plan) => {
    if (plan.id === 'bundle') {
      selectAllProducts();
    } else {
      toggleProduct(plan.id);
    }
  };

  const pricing = calculatePrice();
  const hasDiscount = selectedProducts.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <T>완벽한 한국어 학습을 위한</T>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}<T>맞춤형 플랜</T>
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            <T>AI 기반 개인 맞춤 학습으로 더 빠르고 효과적인 한국어 실력 향상을 경험하세요</T>
          </p>
          
          {/* 빌링 사이클 선택 */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              <T>월간 결제</T>
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'annual' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
              <T>연간 결제</T>
            </span>
            {billingCycle === 'annual' && (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                <T>20% 할인!</T>
              </span>
            )}
          </div>
        </div>

        {/* 개별 상품 선택 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(PRODUCTS).map(([productId, product]) => {
            const Icon = productIcons[productId];
            const isSelected = selectedProducts.includes(productId);
            const color = productColors[productId];
            
            return (
              <div
                key={productId}
                className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  isSelected 
                    ? `border-${color}-500 ring-4 ring-${color}-100` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleProduct(productId)}
              >
                {/* 선택 체크 */}
                {isSelected && (
                  <div className={`absolute -top-2 -right-2 w-6 h-6 bg-${color}-500 rounded-full flex items-center justify-center`}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="p-6">
                  {/* 상품 헤더 */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 bg-${color}-100 rounded-lg`}>
                      <Icon className={`w-6 h-6 text-${color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        <T>{product.name}</T>
                      </h3>
                      <p className="text-sm text-gray-500">
                        <T>{product.category}</T>
                      </p>
                    </div>
                  </div>

                  {/* 가격 */}
                  <div className="mb-4">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ${billingCycle === 'annual' ? Math.round(product.price * 12 * 0.8) : product.price}
                      </span>
                      <span className="text-gray-500">
                        /{billingCycle === 'annual' ? <T>년</T> : <T>월</T>}
                      </span>
                    </div>
                    {billingCycle === 'annual' && (
                      <div className="text-sm text-gray-400 line-through">
                        ${product.price * 12}/<T>년</T>
                      </div>
                    )}
                  </div>

                  {/* 설명 */}
                  <p className="text-gray-600 text-sm mb-4">
                    <T>{product.description}</T>
                  </p>

                  {/* 주요 기능 */}
                  <div className="space-y-2 mb-6">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">
                          <T>{feature}</T>
                        </span>
                      </div>
                    ))}
                    <div className="text-xs text-gray-500">
                      <T>일일 {product.dailyLimit}회 사용</T>
                    </div>
                  </div>

                  {/* 무료 체험 버튼 */}
                  <OutlineButton
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      startFreeTrial(productId);
                    }}
                    className="w-full mb-2"
                    textKey="7일 무료 체험"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 선택된 상품 및 가격 정보 */}
        {selectedProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              
              {/* 선택된 상품들 */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  <T>선택된 상품 ({selectedProducts.length}개)</T>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map(productId => (
                    <span 
                      key={productId}
                      className={`inline-flex items-center space-x-2 px-3 py-1 bg-${productColors[productId]}-100 text-${productColors[productId]}-800 rounded-full text-sm`}
                    >
                      {React.createElement(productIcons[productId], { className: "w-4 h-4" })}
                      <T>{PRODUCTS[productId].name}</T>
                    </span>
                  ))}
                </div>
                
                {/* 빠른 액션 */}
                <div className="flex space-x-4 mt-3">
                  <button
                    onClick={selectAllProducts}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <T>전체 선택</T>
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    <T>선택 초기화</T>
                  </button>
                </div>
              </div>

              {/* 가격 정보 */}
              <div className="lg:text-right">
                {hasDiscount && (
                  <div className="space-y-1 mb-2">
                    <div className="text-sm text-gray-500 line-through">
                      <T>원가: ${pricing.original.toFixed(2)}/{billingCycle === 'annual' ? '년' : '월'}</T>
                    </div>
                    {pricing.discount > 0 && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <Percent className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          <T>번들 할인 {Math.round(pricing.discount * 100)}%</T>
                        </span>
                      </div>
                    )}
                    {pricing.annualDiscount > 0 && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Gift className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          <T>연간 할인 {Math.round(pricing.annualDiscount * 100)}%</T>
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-3xl font-bold text-gray-900">
                  ${pricing.discounted.toFixed(2)}
                  <span className="text-lg text-gray-500 font-normal">
                    /{billingCycle === 'annual' ? <T>년</T> : <T>월</T>}
                  </span>
                </div>
                
                {hasDiscount && (
                  <div className="text-green-600 font-medium">
                    <T>${(pricing.original - pricing.discounted).toFixed(2)} 절약!</T>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 추천 번들 패키지 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-xl p-8 text-white mb-12">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-6 h-6 text-yellow-300" />
                <span className="text-yellow-300 font-semibold">
                  <T>인기 추천</T>
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                <T>올인원 패키지</T>
              </h3>
              <p className="text-purple-100 mb-4">
                <T>4개 모든 상품을 25% 할인된 가격에 이용하세요</T>
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold">
                  ${billingCycle === 'annual' ? Math.round(BUNDLE_PACKAGES.bundle_all.price * 12 * 0.8) : BUNDLE_PACKAGES.bundle_all.price}
                  <span className="text-lg font-normal">/{billingCycle === 'annual' ? <T>년</T> : <T>월</T>}</span>
                </div>
                <div className="text-purple-200 line-through">
                  ${billingCycle === 'annual' ? Object.values(PRODUCTS).reduce((sum, p) => sum + p.price, 0) * 12 : Object.values(PRODUCTS).reduce((sum, p) => sum + p.price, 0)}/{billingCycle === 'annual' ? <T>년</T> : <T>월</T>}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <PrimaryButton
                onClick={() => {
                  selectAllProducts();
                  setTimeout(() => handleSubscribe(), 100);
                }}
                className="bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                size="lg"
              >
                <T>올인원 선택하기</T>
                <ArrowRight className="w-5 h-5 ml-2" />
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* 구독 버튼 */}
        {selectedProducts.length > 0 && (
          <div className="text-center">
            <PrimaryButton
              onClick={handleSubscribe}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg"
              size="lg"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Zap className="w-5 h-5 mr-2" />
              )}
              <T>{loading ? '처리중...' : '선택한 상품 구독하기'}</T>
            </PrimaryButton>
            
            <p className="text-gray-500 text-sm mt-4">
              <T>7일 무료 체험 • 언제든 취소 가능 • 첫 달 100% 환불 보장</T>
            </p>
          </div>
        )}

        {/* 상품 비교표 */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <OutlineButton
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center space-x-2"
            >
              <Info className="w-4 h-4" />
              <T>{showComparison ? '비교표 숨기기' : '상품 상세 비교하기'}</T>
            </OutlineButton>
          </div>

          {showComparison && (
            <PlanComparison
              plans={Object.values(SUBSCRIPTION_PLANS)}
              bundles={Object.values(BUNDLE_PACKAGES)}
              onSelectPlan={handleSelectPlan}
              highlightedPlan={selectedProducts.length === 4 ? 'bundle' : selectedProducts[0]}
              showBundles={true}
              currentSubscriptions={user?.subscriptions || []}
              showPlanCards={false}
              billingPeriod={billingCycle}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Plans;