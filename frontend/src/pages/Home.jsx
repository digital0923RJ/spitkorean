import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Play, 
  Star, 
  Users, 
  Award, 
  Globe, 
  Sparkles,
  MessageCircle,
  Film,
  BookOpen,
  Map,
  Check,
  ChevronRight,
  Zap,
  Crown,
  Target,
  Calendar,
  TrendingUp
} from 'lucide-react'

import Button from '@components/common/Button'
import TranslatableText, { 
  T, 
  TUI, 
  TBlock, 
  TConditional,
  TLazy 
} from '@components/common/TranslatableText'
import PlanCard from '../components/subscription/PlanCard.jsx'
import { PRODUCTS, PRODUCT_LIST, BUNDLES, calculateBundlePrice } from '@shared/constants/products'
import { useAuth } from '@hooks/useAuth'
import { useLanguage } from '@hooks/useLanguage'

/**
 * 번역 지원 홈페이지 - 모든 import 활용 버전
 */
const Home = () => {
  const { isAuthenticated } = useAuth()
  const { currentLanguage, translate } = useLanguage()
  const [selectedProducts, setSelectedProducts] = useState([])
  const [showPlanComparison, setShowPlanComparison] = useState(false)
  const [popularProduct, setPopularProduct] = useState(null)

  // 인기 상품 설정 (Talk Like You Mean It을 기본으로)
  useEffect(() => {
    setPopularProduct(PRODUCTS.TALK)
  }, [])

  // 상품 선택 핸들러
  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // 번들 가격 계산
  const bundlePrice = calculateBundlePrice(selectedProducts)

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">SpitKorean</span>
            </div>

            {/* 네비게이션 */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                <TUI>기능</TUI>
              </a>
              <a href="#products" className="text-gray-600 hover:text-gray-900 transition-colors">
                <TUI>상품</TUI>
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                <TUI>요금제</TUI>
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                <TUI>후기</TUI>
              </a>
            </nav>

            {/* CTA 버튼 */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button variant="primary" textKey="대시보드" />
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" textKey="로그인" />
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" textKey="무료 시작하기" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* 왼쪽: 메인 메시지 */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  <T>AI와 함께하는</T>
                  <br />
                  <span className="gradient-text">
                    <T>스마트 한국어</T>
                  </span>
                  <br />
                  <T>학습의 혁신</T>
                </h1>
                <TBlock 
                  as="p" 
                  className="text-xl text-gray-600 leading-relaxed"
                  context="general"
                >
                  개인 맞춤형 AI 튜터와 함께 한국어를 더 효과적으로, 더 재미있게 배워보세요. 14개 언어 지원으로 전 세계 어디서나 쉽게 시작할 수 있습니다.
                </TBlock>
              </div>

              {/* CTA 버튼 */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    fullWidth
                    rightIcon={<ArrowRight />}
                    textKey="무료로 시작하기"
                  />
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  leftIcon={<Play />}
                  textKey="데모 보기"
                  onClick={() => {
                    console.log('Play demo video')
                  }}
                />
              </div>

              {/* 통계 */}
              <div className="flex items-center space-x-8 pt-4">
                {[
                  { icon: <Users />, number: '10,000+', labelKey: '학습자' },
                  { icon: <Star />, number: '4.9/5', labelKey: '만족도' },
                  { icon: <Award />, number: '95%', labelKey: '목표 달성' }
                ].map((stat, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="text-primary-600">{stat.icon}</div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{stat.number}</div>
                      <div className="text-sm text-gray-600">
                        <T>{stat.labelKey}</T>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 현재 인기 상품 하이라이트 */}
              {popularProduct && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">
                        <T>🔥 가장 인기있는 코스</T>
                      </div>
                      <div className="text-sm text-blue-700">
                        <T>{popularProduct.nameKr}</T> - ${popularProduct.price}/월
                      </div>
                    </div>
                    <Link to={popularProduct.route} className="ml-auto">
                      <Button variant="outline" size="sm" textKey="체험하기" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 오른쪽: 히어로 이미지 */}
            <div className="relative">
              <div className="bg-gradient-to-r from-primary-100 to-secondary-100 rounded-2xl p-8 shadow-xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium"><T>AI 튜터</T></div>
                        <div className="text-sm text-gray-500"><T>온라인</T></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm">
                          <T>안녕하세요! 오늘 어떤 한국어를 배워볼까요? 😊</T>
                        </p>
                      </div>
                      <div className="bg-primary-600 text-white rounded-lg p-3 max-w-xs ml-auto">
                        <p className="text-sm">
                          <T>안녕하세요! 자기소개를 배우고 싶어요.</T>
                        </p>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm">
                          <T>좋아요! 먼저 "제 이름은 ___입니다" 연습해볼까요?</T>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 떠있는 요소들 */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium">
                    <T>14개 언어 지원</T>
                  </span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-success-600" />
                  <span className="text-sm font-medium">
                    <T>TOPIK 인증</T>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              <T>왜 SpitKorean을 선택해야 할까요?</T>
            </h2>
            <TBlock 
              as="p" 
              className="text-xl text-gray-600"
              context="general"
            >
              AI 기술과 검증된 학습 방법론이 만나 최고의 한국어 학습 경험을 제공합니다
            </TBlock>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageCircle className="w-8 h-8" />,
                titleKey: '개인 맞춤형 AI 튜터',
                descKey: '당신의 레벨과 학습 속도에 맞춰 최적화된 학습 경험을 제공합니다.',
                color: 'primary',
                productRef: PRODUCTS.TALK
              },
              {
                icon: <Globe className="w-8 h-8" />,
                titleKey: '14개 언어 지원',
                descKey: '모국어로 자연스럽게 한국어를 배울 수 있어 학습 효과가 극대화됩니다.',
                color: 'secondary'
              },
              {
                icon: <Award className="w-8 h-8" />,
                titleKey: 'TOPIK 시험 대비',
                descKey: '실제 시험 형식의 문제로 체계적인 TOPIK 준비가 가능합니다.',
                color: 'success',
                productRef: PRODUCTS.TEST
              },
              {
                icon: <Film className="w-8 h-8" />,
                titleKey: '실제 드라마 콘텐츠',
                descKey: '한국 드라마의 실제 대사로 생생한 한국어를 배울 수 있습니다.',
                color: 'warning',
                productRef: PRODUCTS.DRAMA
              },
              {
                icon: <Users className="w-8 h-8" />,
                titleKey: '게임화된 학습',
                descKey: 'XP, 리그, 연속 학습 등 재미있는 요소로 동기부여를 유지합니다.',
                color: 'error'
              },
              {
                icon: <Star className="w-8 h-8" />,
                titleKey: '체계적 학습법',
                descKey: '언어학습 전문가들이 설계한 과학적 학습 방법론을 적용했습니다.',
                color: 'primary',
                productRef: PRODUCTS.JOURNEY
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className={`text-${feature.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <T>{feature.titleKey}</T>
                </h3>
                <TBlock 
                  as="p" 
                  className="text-gray-600 mb-3"
                  context="general"
                >
                  {feature.descKey}
                </TBlock>
                {/* 관련 상품 정보 표시 */}
                {feature.productRef && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        <T>{feature.productRef.nameKr}</T>
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ${feature.productRef.price}/월
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 상품 소개 섹션 - PlanCard 사용 */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              <T>4가지 전문 학습 코스</T>
            </h2>
            <TBlock 
              as="p" 
              className="text-xl text-gray-600"
              context="general"
            >
              당신의 학습 목표에 맞는 최적의 코스를 선택하세요
            </TBlock>
          </div>

          {/* PlanCard를 사용한 상품 표시 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {PRODUCT_LIST.map((product, index) => (
              <PlanCard
                key={product.id}
                plan={product}
                isPopular={product.id === popularProduct?.id}
                onSelect={() => handleProductSelect(product.id)}
                onSubscribe={() => {
                  if (isAuthenticated) {
                    // 구독 페이지로 이동
                    window.location.href = `/subscribe/${product.id}`
                  } else {
                    // 회원가입 페이지로 이동
                    window.location.href = '/register'
                  }
                }}
                isSelected={selectedProducts.includes(product.id)}
                showComparison={showPlanComparison}
              />
            ))}
          </div>

          {/* 선택된 상품들의 번들 정보 */}
          <TConditional condition={selectedProducts.length >= 2}>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="text-center">
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  💰 <T>번들 할인 적용!</T>
                </h3>
                <div className="text-green-700 mb-4">
                  <T>선택하신 {selectedProducts.length}개 상품을 ${bundlePrice.toFixed(2)}/월에 이용하실 수 있습니다</T>
                </div>
                <div className="flex justify-center space-x-4">
                  <div className="text-sm text-green-600">
                    <T>원가: ${PRODUCT_LIST.filter(p => selectedProducts.includes(p.id)).reduce((sum, p) => sum + p.price, 0).toFixed(2)}</T>
                  </div>
                  <div className="text-sm font-bold text-green-800">
                    <T>할인가: ${bundlePrice.toFixed(2)}</T>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  className="mt-4 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if (isAuthenticated) {
                      window.location.href = `/subscribe/bundle?products=${selectedProducts.join(',')}`
                    } else {
                      window.location.href = '/register'
                    }
                  }}
                  textKey="번들로 구독하기"
                />
              </div>
            </div>
          </TConditional>

          {/* 번들 패키지 안내 */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                <Crown className="w-6 h-6 inline mr-2" />
                <T>더 저렴하게 이용하세요!</T>
              </h3>
              <TBlock 
                as="p" 
                className="text-gray-600 mb-6"
                context="general"
              >
                2개 이상 선택 시 최대 25% 할인 혜택을 받을 수 있습니다
              </TBlock>
              
              {/* 번들 옵션 표시 */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {Object.values(BUNDLES).map((bundle) => (
                  <div key={bundle.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="font-medium text-gray-900 mb-1">
                      <T>{bundle.nameKr}</T>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <T>{bundle.description}</T>
                    </div>
                    <div className="text-lg font-bold text-primary-600">
                      {bundle.discount * 100}% <T>할인</T>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center space-x-4">
                <Link to="/plans">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    rightIcon={<ChevronRight />}
                    textKey="할인 패키지 보기"
                  />
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowPlanComparison(!showPlanComparison)}
                  textKey={showPlanComparison ? "비교 숨기기" : "요금제 비교"}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 학습자 후기 섹션 */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              <T>전 세계 학습자들의 생생한 후기</T>
            </h2>
            <TBlock 
              as="p" 
              className="text-xl text-gray-600"
              context="general"
            >
              SpitKorean과 함께 한국어 꿈을 이룬 분들의 이야기를 들어보세요
            </TBlock>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: '사라 존슨',
                countryKey: '미국',
                levelKey: 'TOPIK 4급 합격',
                avatar: 'S',
                contentKey: '6개월 만에 TOPIK 4급을 합격했어요! Talk Like You Mean It 덕분에 실제 대화 실력이 많이 늘었습니다. AI 튜터가 제 발음을 정확히 교정해줘서 자신감이 생겼어요.',
                rating: 5,
                usedProduct: PRODUCTS.TALK
              },
              {
                name: '다나카 히로시',
                countryKey: '일본',
                levelKey: '비즈니스 한국어 마스터',
                avatar: '田',
                contentKey: 'Drama Builder로 한국 드라마를 보면서 자연스럽게 한국어를 익혔어요. 특히 비즈니스 상황에서 쓰이는 표현들을 많이 배울 수 있어서 회사에서 한국 동료들과 소통이 훨씬 수월해졌습니다.',
                rating: 5,
                usedProduct: PRODUCTS.DRAMA
              },
              {
                name: '마리아 가르시아',
                countryKey: '스페인',
                levelKey: '일상 대화 완벽',
                avatar: 'M',
                contentKey: 'Korean Journey로 한글부터 차근차근 배웠는데, 발음 분석 기능이 정말 도움이 되었어요. 이제 한국 친구들과 자연스럽게 대화할 수 있어서 한국 생활이 즐거워졌습니다!',
                rating: 5,
                usedProduct: PRODUCTS.JOURNEY
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">
                      <T>{testimonial.countryKey}</T> • <T>{testimonial.levelKey}</T>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <TLazy 
                  trigger="hover"
                  className="text-gray-600 italic mb-4"
                  context="general"
                >
                  "{testimonial.contentKey}"
                </TLazy>

                {/* 사용한 상품 표시 */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 bg-${testimonial.usedProduct.color}-100 rounded`}>
                      <div className={`w-2 h-2 bg-${testimonial.usedProduct.color}-600 rounded-full m-1`}></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      <T>{testimonial.usedProduct.nameKr}</T> <T>사용</T>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            <T>지금 시작하여 한국어 마스터가 되어보세요!</T>
          </h2>
          <TBlock 
            as="p" 
            className="text-xl text-primary-100 mb-8"
            context="general"
          >
            14일 무료 체험으로 SpitKorean의 모든 기능을 경험해보세요. 언제든지 취소 가능하며, 신용카드 정보 없이도 시작할 수 있습니다.
          </TBlock>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button 
                variant="secondary" 
                size="xl" 
                rightIcon={<ArrowRight />}
                className="bg-white text-primary-600 hover:bg-gray-50"
                textKey="무료로 시작하기"
              />
            </Link>
            <Link to="/plans">
              <Button 
                variant="outline" 
                size="xl"
                className="border-white text-white hover:bg-white hover:text-primary-600"
                textKey="요금제 보기"
              />
            </Link>
          </div>
          
          <div className="mt-8 text-primary-100">
            ✓ <T>14일 무료 체험</T> &nbsp;&nbsp; ✓ <T>언제든지 취소 가능</T> &nbsp;&nbsp; ✓ <T>신용카드 불필요</T>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            
            {/* 회사 정보 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">SpitKorean</span>
              </div>
              <TBlock 
                as="p" 
                className="text-gray-400"
                context="general"
              >
                AI 기반 한국어 학습의 혁신을 이끌어가는 글로벌 에듀테크 기업입니다.
              </TBlock>
              <div className="flex space-x-4">
                {/* 소셜 미디어 링크들 */}
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                </a>
              </div>
            </div>

            {/* 상품 - PRODUCT_LIST 사용 */}
            <div>
              <h3 className="text-lg font-semibold mb-4"><TUI>상품</TUI></h3>
              <ul className="space-y-2">
                {PRODUCT_LIST.map((product) => (
                  <li key={product.id}>
                    <Link to={product.route} className="text-gray-400 hover:text-white transition-colors">
                      <T>{product.nameKr}</T>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 지원 */}
            <div>
              <h3 className="text-lg font-semibold mb-4"><TUI>지원</TUI></h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors"><TUI>도움말</TUI></Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors"><TUI>문의하기</TUI></Link></li>
                <li><Link to="/community" className="text-gray-400 hover:text-white transition-colors"><TUI>커뮤니티</TUI></Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors"><TUI>블로그</TUI></Link></li>
              </ul>
            </div>

            {/* 법적 */}
            <div>
              <h3 className="text-lg font-semibold mb-4"><TUI>법적 정보</TUI></h3>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors"><TUI>이용약관</TUI></Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors"><TUI>개인정보처리방침</TUI></Link></li>
                <li><Link to="/cookies" className="text-gray-400 hover:text-white transition-colors"><TUI>쿠키 정책</TUI></Link></li>
                <li><Link to="/refund" className="text-gray-400 hover:text-white transition-colors"><TUI>환불 정책</TUI></Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400">
                © 2024 SpitKorean. All rights reserved.
              </div>
              <div className="mt-4 md:mt-0 text-gray-400">
                🇰🇷 Made with ❤️ for Korean learners worldwide
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home