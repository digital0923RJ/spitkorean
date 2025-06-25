// src/components/subscription/SubscriptionStatus.jsx
import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Calendar,
  CreditCard,
  Download,
  Pause,
  Play,
  X,
  RefreshCw,
  Crown,
  Users,
  Star,
  Target,
  Zap,
  Activity,
  FileText,
} from 'lucide-react';
// 컴포넌트
import Card from '../common/Card';
import Button, { PrimaryButton, OutlineButton } from '../common/Buttom';
import Modal from '../common/Modal';
import TranslatableText, { T } from '../common/TranslatableText';
// 유틸리티
import { formatDate, formatPrice } from '../../utils/format';
// 상수
import { SUBSCRIPTION_PLANS } from '../../shared/constants/subscriptions';
import { PRODUCTS } from '../../shared/constants/products';

const SubscriptionStatus = ({ 
  subscriptions = [],
  billingHistory = [],
  usage = {},
  onCancel,
  onPause,
  onResume,
  onUpdatePayment,
  onDownloadInvoice,
  onUpgrade,
  compact = false
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [showUsageDetails, setShowUsageDetails] = useState(false);

  // 상품 정보 가져오기 (SUBSCRIPTION_PLANS 우선 사용)
  const getProductInfo = (productId) => {
    return SUBSCRIPTION_PLANS[productId?.toUpperCase()] || PRODUCTS[productId] || { 
      name: '알 수 없는 상품', 
      description: '상품 정보를 찾을 수 없습니다' 
    };
  };

  // 아이콘 매핑
  const getProductIcon = (productId) => {
    const iconMap = {
      talk: Users,
      drama: Star,
      test: Target,
      journey: Zap,
      bundle: Crown
    };
    return iconMap[productId] || CheckCircle;
  };

  // 색상 매핑
  const getProductColor = (productId) => {
    const colorMap = {
      talk: 'blue',
      drama: 'purple',
      test: 'green',
      journey: 'orange',
      bundle: 'yellow'
    };
    return colorMap[productId] || 'gray';
  };

  // 상태별 스타일
  const getStatusStyle = (status) => {
    const styleMap = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      paused: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Pause },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle }
    };
    return styleMap[status] || styleMap.active;
  };

  // 구독 취소 확인
  const handleCancelConfirm = () => {
    if (selectedSubscription) {
      onCancel?.(selectedSubscription.id);
      setShowCancelModal(false);
      setSelectedSubscription(null);
    }
  };

  // 사용량 퍼센티지 계산
  const getUsagePercentage = (productId) => {
    const productUsage = usage[productId];
    if (!productUsage || !productUsage.limit) return 0;
    return Math.min((productUsage.used / productUsage.limit) * 100, 100);
  };

  // 사용량 색상 결정
  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  // 컴팩트 모드
  if (compact) {
    return (
      <Card padding="default">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">
            <T>구독 현황</T>
          </h3>
          <span className="text-sm text-gray-600">
            {subscriptions.filter(s => s.status === 'active').length}<T>개 활성</T>
          </span>
        </div>
        
        <div className="space-y-2">
          {subscriptions.slice(0, 3).map((subscription) => {
            const product = getProductInfo(subscription.productId);
            const Icon = getProductIcon(subscription.productId);
            const status = getStatusStyle(subscription.status);
            
            return (
              <div key={subscription.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">
                    <T>{product.name}</T>
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                  <T>
                    {subscription.status === 'active' ? '활성' :
                     subscription.status === 'paused' ? '정지' :
                     subscription.status === 'cancelled' ? '취소' : '만료'}
                  </T>
                </div>
              </div>
            );
          })}
          
          {subscriptions.length > 3 && (
            <div className="text-center text-sm text-gray-500">
              +{subscriptions.length - 3}<T>개 더...</T>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 활성 구독 */}
      <Card className="shadow-lg border border-gray-200" padding="none">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              <T>내 구독</T>
            </h2>
            <div className="flex space-x-3">
              <OutlineButton
                size="sm"
                onClick={() => setShowUsageDetails(!showUsageDetails)}
                className="flex items-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <T>사용량</T>
              </OutlineButton>
              <OutlineButton
                size="sm"
                onClick={() => setShowBillingHistory(!showBillingHistory)}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <T>결제 내역</T>
              </OutlineButton>
            </div>
          </div>
        </div>

        <div className="p-6">
          {subscriptions.length > 0 ? (
            <div className="space-y-4">
              {subscriptions.map((subscription) => {
                const product = getProductInfo(subscription.productId);
                const Icon = getProductIcon(subscription.productId);
                const color = getProductColor(subscription.productId);
                const status = getStatusStyle(subscription.status);
                const StatusIcon = status.icon;
                const usagePercentage = getUsagePercentage(subscription.productId);
                const usageColor = getUsageColor(usagePercentage);

                return (
                  <Card 
                    key={subscription.id}
                    variant="default"
                    hover
                    className="transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* 상품 아이콘 */}
                        <div className={`p-3 bg-${color}-100 rounded-lg`}>
                          <Icon className={`w-6 h-6 text-${color}-600`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              <T>{product.name}</T>
                            </h3>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text} flex items-center space-x-1`}>
                              <StatusIcon className="w-3 h-3" />
                              <T>
                                {subscription.status === 'active' ? '활성' :
                                 subscription.status === 'paused' ? '일시정지' :
                                 subscription.status === 'cancelled' ? '취소됨' : '만료'}
                              </T>
                            </div>
                            {subscription.status === 'active' && subscription.nextBillingDate && (
                              <div className="text-xs text-gray-500">
                                {new Date(subscription.nextBillingDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                                  <span className="text-orange-600 font-medium">
                                    <T>곧 결제</T>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3">
                            <T>{product.description}</T>
                          </p>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500"><T>요금:</T></span>
                              <span className="ml-2 font-medium">
                                {formatPrice(subscription.price)}/<T>월</T>
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500"><T>다음 결제:</T></span>
                              <span className="ml-2 font-medium">
                                {subscription.nextBillingDate 
                                  ? formatDate(subscription.nextBillingDate, { format: 'short' })
                                  : 'N/A'
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500"><T>이용량:</T></span>
                              <span className="ml-2 font-medium">
                                {usage[subscription.productId]?.used || 0} / {usage[subscription.productId]?.limit || '∞'}
                              </span>
                            </div>
                          </div>

                          {/* 사용량 진행바 */}
                          {usage[subscription.productId]?.limit && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span><T>이번 달 사용량</T></span>
                                <span className={`px-2 py-1 rounded-full ${usageColor}`}>
                                  {usagePercentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    usagePercentage >= 90 ? 'bg-red-500' :
                                    usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${usagePercentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 액션 버튼들 */}
                      <div className="flex items-center space-x-2">
                        {subscription.status === 'active' && (
                          <>
                            <OutlineButton
                              size="sm"
                              onClick={() => onPause?.(subscription.id)}
                              className="flex items-center space-x-1"
                            >
                              <Pause className="w-3 h-3" />
                              <T>일시정지</T>
                            </OutlineButton>
                            
                            <OutlineButton
                              size="sm"
                              onClick={() => onUpdatePayment?.(subscription.id)}
                              className="flex items-center space-x-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <T>결제수단</T>
                            </OutlineButton>
                          </>
                        )}
                        
                        {subscription.status === 'paused' && (
                          <OutlineButton
                            size="sm"
                            onClick={() => onResume?.(subscription.id)}
                            className="flex items-center space-x-1"
                          >
                            <Play className="w-3 h-3" />
                            <T>재개</T>
                          </OutlineButton>
                        )}
                        
                        {(subscription.status === 'active' || subscription.status === 'paused') && (
                          <OutlineButton
                            size="sm"
                            onClick={() => {
                              setSelectedSubscription(subscription);
                              setShowCancelModal(true);
                            }}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <X className="w-3 h-3" />
                            <T>취소</T>
                          </OutlineButton>
                        )}
                        
                        {subscription.status === 'cancelled' && subscription.canReactivate && (
                          <PrimaryButton
                            size="sm"
                            onClick={() => onUpgrade?.(subscription)}
                            className="flex items-center space-x-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <T>재구독</T>
                          </PrimaryButton>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                <T>활성 구독이 없습니다</T>
              </h3>
              <p className="text-gray-600 mb-6">
                <T>SpitKorean과 함께 한국어 학습을 시작해보세요!</T>
              </p>
              <PrimaryButton onClick={() => onUpgrade?.()}>
                <T>요금제 둘러보기</T>
              </PrimaryButton>
            </div>
          )}
        </div>
      </Card>

      {/* 사용량 상세 */}
      {showUsageDetails && (
        <Card className="shadow-lg border border-gray-200" padding="none">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                <T>사용량 상세</T>
              </h3>
              <button
                onClick={() => setShowUsageDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(usage).map(([productId, usageData]) => {
                const product = getProductInfo(productId);
                const Icon = getProductIcon(productId);
                const color = getProductColor(productId);
                const percentage = usageData.limit 
                  ? (usageData.used / usageData.limit) * 100 
                  : 0;

                return (
                  <Card key={productId} variant="info" padding="default">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 bg-${color}-100 rounded-lg`}>
                        <Icon className={`w-4 h-4 text-${color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          <T>{product?.name}</T>
                        </h4>
                        <p className="text-xs text-gray-600">
                          <T>이번 달</T>
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600"><T>사용량</T></span>
                        <span className="font-medium">
                          {usageData.used} / {usageData.limit || '∞'}
                        </span>
                      </div>
                      
                      {usageData.limit && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage >= 90 ? 'bg-red-500' :
                              percentage >= 70 ? 'bg-yellow-500' : `bg-${color}-500`
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-600">
                        {usageData.resetDate && (
                          <span>
                            <T>다음 초기화:</T> {formatDate(usageData.resetDate, { format: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* 결제 내역 */}
      {showBillingHistory && (
        <Card className="shadow-lg border border-gray-200" padding="none">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                <T>결제 내역</T>
              </h3>
              <button
                onClick={() => setShowBillingHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {billingHistory.length > 0 ? (
              <div className="space-y-4">
                {billingHistory.map((payment) => (
                  <Card 
                    key={payment.id} 
                    variant="default" 
                    padding="default"
                    className="border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          payment.status === 'paid' ? 'bg-green-100' :
                          payment.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          {payment.status === 'paid' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : payment.status === 'failed' ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                        
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatPrice(payment.amount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(payment.date)} • <T>{payment.description}</T>
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.paymentMethod}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                          payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          <T>
                            {payment.status === 'paid' ? '완료' :
                             payment.status === 'failed' ? '실패' : '대기'}
                          </T>
                        </span>
                        
                        {payment.invoiceUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDownloadInvoice?.(payment.id)}
                            className="flex items-center space-x-1"
                          >
                            <Download className="w-3 h-3" />
                            <T>영수증</T>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  <T>결제 내역이 없습니다</T>
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 취소 확인 모달 */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={<T>구독 취소</T>}
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                <T>
                  {selectedSubscription?.productId && getProductInfo(selectedSubscription.productId)?.name} 구독을 취소하시겠습니까?
                </T>
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                <T>취소 후에도 현재 결제 기간이 끝날 때까지 서비스를 계속 이용할 수 있습니다. 다음 결제일에 자동으로 갱신되지 않습니다.</T>
              </p>
              
              <Card variant="info" padding="sm">
                <div className="text-sm text-gray-700">
                  <div className="mb-2">
                    <strong><T>취소 후 유지되는 것:</T></strong>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><T>현재 기간까지 서비스 이용</T></li>
                    <li><T>학습 기록 및 진행률</T></li>
                    <li><T>계정 정보</T></li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <OutlineButton
              onClick={() => setShowCancelModal(false)}
              className="flex-1"
            >
              <T>계속 사용하기</T>
            </OutlineButton>
            <Button
              onClick={handleCancelConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <T>구독 취소</T>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionStatus;