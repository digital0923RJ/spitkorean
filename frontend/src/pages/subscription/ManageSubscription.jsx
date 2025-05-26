import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  CreditCard, 
  Calendar, 
  Settings, 
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Pause,
  Play,
  Trash2,
  Edit,
  Plus,
  FileText,
  Crown
} from 'lucide-react';
// 액션
import { 
  fetchMySubscriptions,
  fetchBillingHistory,
  fetchUsageStats,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  updatePaymentMethod,
  downloadInvoice
} from '../../store/slices/subscriptionSlice.js';
// 컴포넌트
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SubscriptionStatus from '../../components/subscription/SubscriptionStatus.jsx';
import { PRODUCTS } from '../../shared/constants/products';

const ManageSubscription = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // Redux 상태
  const {
    mySubscriptions,
    billingHistory,
    usageStats,
    subscriptionsLoading,
    billingLoading,
    usageLoading,
    subscriptionsError
  } = useSelector(state => state.subscription);
  
  // 로컬 상태 관리
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(null);

  // 데이터 로드
  useEffect(() => {
    loadSubscriptionData();
  }, [dispatch]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Redux 액션을 통해 데이터 로드
      await Promise.all([
        dispatch(fetchMySubscriptions()).unwrap(),
        dispatch(fetchBillingHistory()).unwrap(),
        dispatch(fetchUsageStats()).unwrap()
      ]);
      
    } catch (err) {
      console.error('Failed to load subscription data:', err);
      setError('구독 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 구독 일시정지 핸들러
  const handlePauseSubscription = async (subscriptionId) => {
    try {
      setActionLoading(subscriptionId);
      await dispatch(pauseSubscription(subscriptionId)).unwrap();
    } catch (err) {
      setError('구독 일시정지에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  // 구독 재개 핸들러
  const handleResumeSubscription = async (subscriptionId) => {
    try {
      setActionLoading(subscriptionId);
      await dispatch(resumeSubscription(subscriptionId)).unwrap();
    } catch (err) {
      setError('구독 재개에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  // 구독 취소 핸들러
  const handleCancelSubscription = async (subscriptionId) => {
    try {
      setActionLoading(subscriptionId);
      await dispatch(cancelSubscription(subscriptionId)).unwrap();
      setShowCancelModal(null);
    } catch (err) {
      setError('구독 취소에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  // 결제 방법 업데이트 핸들러
  const handleUpdatePayment = async (subscriptionId) => {
    // PaymentForm 모달을 열거나 결제 방법 업데이트 페이지로 이동
    navigate(`/subscription/payment-method/${subscriptionId}`);
  };

  // 영수증 다운로드 핸들러
  const handleDownloadInvoice = async (invoiceId) => {
    try {
      await dispatch(downloadInvoice(invoiceId)).unwrap();
    } catch (err) {
      setError('영수증 다운로드에 실패했습니다.');
    }
  };

  // 업그레이드/구독 시작 핸들러
  const handleUpgrade = (subscription = null) => {
    if (subscription) {
      // 기존 구독 업그레이드
      navigate(`/subscription/upgrade/${subscription.id}`);
    } else {
      // 새 구독 시작
      navigate('/subscription/plans');
    }
  };

  // 상태별 아이콘
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  // 상태별 텍스트
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'paused':
        return '일시정지';
      case 'cancelled':
        return '취소됨';
      default:
        return '알수없음';
    }
  };

  // 총 월간 비용 계산
  const calculateTotalMonthlyCost = () => {
    return mySubscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => {
        const monthlyCost = sub.billing_cycle === 'annual' 
          ? sub.amount / 12 
          : sub.amount;
        return total + monthlyCost;
      }, 0);
  };

  if (loading || subscriptionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">구독 관리</h1>
              <p className="text-gray-600 mt-1">
                현재 구독 상품과 결제 내역을 관리하세요
              </p>
            </div>
            <Button
              onClick={() => navigate('/subscription/plans')}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>새 구독 추가</span>
            </Button>
          </div>

          {/* 요약 통계 */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">활성 구독</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {mySubscriptions.filter(s => s.status === 'active').length}개
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">월 결제액</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                ${calculateTotalMonthlyCost().toFixed(2)}
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">가입 기간</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {mySubscriptions.length > 0 ? 
                  Math.floor((new Date() - new Date(mySubscriptions[0].started_date)) / (1000 * 60 * 60 * 24 * 30))
                  : 0
                }개월
              </div>
            </div>
          </div>
        </div>

        {/* SubscriptionStatus 컴포넌트 사용 */}
        <SubscriptionStatus
          subscriptions={mySubscriptions}
          billingHistory={billingHistory}
          usage={usageStats}
          onCancel={handleCancelSubscription}
          onPause={handlePauseSubscription}
          onResume={handleResumeSubscription}
          onUpdatePayment={handleUpdatePayment}
          onDownloadInvoice={handleDownloadInvoice}
          onUpgrade={handleUpgrade}
          compact={false}
        />

        {/* 에러 표시 */}
        {(error || subscriptionsError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error || subscriptionsError}</span>
            </div>
          </div>
        )}

        {/* 기존 결제 내역 섹션 (SubscriptionStatus에 통합되었으므로 제거 가능) */}
        {/* 또는 더 상세한 결제 내역이 필요한 경우 별도 섹션으로 유지 */}
        
        {/* 추가 관리 옵션 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">추가 옵션</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/subscription/payment-methods')}
              className="flex items-center justify-between p-4 h-auto"
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium">결제 방법 관리</div>
                  <div className="text-sm text-gray-500">카드 정보 업데이트</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/subscription/billing-history')}
              className="flex items-center justify-between p-4 h-auto"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium">상세 결제 내역</div>
                  <div className="text-sm text-gray-500">전체 결제 기록 보기</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/subscription/notifications')}
              className="flex items-center justify-between p-4 h-auto"
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium">알림 설정</div>
                  <div className="text-sm text-gray-500">결제 및 구독 알림</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/subscription/referrals')}
              className="flex items-center justify-between p-4 h-auto"
            >
              <div className="flex items-center space-x-3">
                <Crown className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium">친구 추천</div>
                  <div className="text-sm text-gray-500">추천 혜택 받기</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 취소 확인 모달 */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  구독을 취소하시겠습니까?
                </h3>
                
                <p className="text-gray-600 mb-6">
                  구독을 취소하면 다음 결제일부터 서비스 이용이 중단됩니다. 
                  현재 결제 기간 동안은 계속 이용 가능합니다.
                </p>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelModal(null)}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  
                  <Button
                    onClick={() => handleCancelSubscription(showCancelModal)}
                    disabled={actionLoading === showCancelModal}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {actionLoading === showCancelModal ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      '구독 취소'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSubscription;