import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Sparkles,
  MessageCircle,
  Film,
  BookOpen,
  Map,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Globe,
  Heart,
  ExternalLink,
  Download,
  Shield,
  Award,
  Users
} from 'lucide-react'

import { PRODUCT_LIST } from '@/shared/constants/products'

/**
 * 페이지 하단 푸터 컴포넌트
 */
const Footer = ({ variant = 'default', className = '' }) => {
  const currentYear = new Date().getFullYear()

  // 푸터 변형 설정
  const variants = {
    default: {
      bgColor: 'bg-gray-900',
      textColor: 'text-white',
      showAllSections: true
    },
    minimal: {
      bgColor: 'bg-white border-t border-gray-100',
      textColor: 'text-gray-600',
      showAllSections: false
    },
    dark: {
      bgColor: 'bg-black',
      textColor: 'text-gray-300',
      showAllSections: true
    }
  }

  const config = variants[variant] || variants.default

  // 상품 아이콘 렌더링
  const renderProductIcon = (iconName, className = "w-4 h-4") => {
    const icons = {
      MessageCircle: <MessageCircle className={className} />,
      Film: <Film className={className} />,
      BookOpen: <BookOpen className={className} />,
      Map: <Map className={className} />
    }
    return icons[iconName] || <MessageCircle className={className} />
  }

  // 소셜 미디어 링크
  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: 'https://facebook.com/spitkorean', label: 'Facebook' },
    { icon: <Twitter className="w-5 h-5" />, href: 'https://twitter.com/spitkorean', label: 'Twitter' },
    { icon: <Instagram className="w-5 h-5" />, href: 'https://instagram.com/spitkorean', label: 'Instagram' },
    { icon: <Youtube className="w-5 h-5" />, href: 'https://youtube.com/spitkorean', label: 'YouTube' }
  ]

  // 지원 언어
  const supportedLanguages = [
    '🇺🇸 English', '🇯🇵 日本語', '🇨🇳 中文', '🇻🇳 Tiếng Việt',
    '🇪🇸 Español', '🇫🇷 Français', '🇮🇳 हिंदी', '🇹🇭 ไทย',
    '🇩🇪 Deutsch', '🇲🇳 Монгол', '🇸🇦 العربية', '🇧🇷 Português', '🇹🇷 Türkçe'
  ]

  return (
    <footer className={`${config.bgColor} ${config.textColor} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 메인 푸터 컨텐츠 */}
        {config.showAllSections ? (
          <div className="py-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
              
              {/* 회사 정보 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 로고 */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">SpitKorean</span>
                </div>
                
                {/* 회사 설명 */}
                <p className="text-gray-400 leading-relaxed max-w-md">
                  AI 기반 한국어 학습의 혁신을 이끌어가는 글로벌 에듀테크 기업입니다. 
                  전 세계 학습자들이 더 효과적이고 재미있게 한국어를 배울 수 있도록 
                  최첨단 기술과 검증된 교육 방법론을 결합합니다.
                </p>
                
                {/* 연락처 정보 */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>support@spitkorean.com</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>+82-2-1234-5678</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>서울특별시 강남구 테헤란로 123</span>
                  </div>
                </div>
                
                {/* 소셜 미디어 */}
                <div>
                  <h4 className="font-semibold mb-3">팔로우하세요</h4>
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                        aria-label={social.label}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* 학습 코스 */}
              <div>
                <h3 className="text-lg font-semibold mb-6">학습 코스</h3>
                <ul className="space-y-3">
                  {PRODUCT_LIST.map((product) => (
                    <li key={product.id}>
                      <Link 
                        to={product.route}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
                      >
                        {renderProductIcon(product.icon, 'text-gray-500 group-hover:text-primary-400 transition-colors')}
                        <span>{product.nameKr}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link 
                      to="/plans"
                      className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors font-medium"
                    >
                      <Award className="w-4 h-4" />
                      <span>요금제 비교</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 지원 & 서비스 */}
              <div>
                <h3 className="text-lg font-semibold mb-6">지원 & 서비스</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/help" className="text-gray-400 hover:text-white transition-colors">
                      도움말 센터
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                      문의하기
                    </Link>
                  </li>
                  <li>
                    <Link to="/community" className="text-gray-400 hover:text-white transition-colors">
                      학습자 커뮤니티
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                      학습 블로그
                    </Link>
                  </li>
                  <li>
                    <Link to="/tutorials" className="text-gray-400 hover:text-white transition-colors">
                      사용법 가이드
                    </Link>
                  </li>
                  <li>
                    <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                      자주 묻는 질문
                    </Link>
                  </li>
                  <li>
                    <a 
                      href="/api-docs" 
                      className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>API 문서</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* 회사 & 법적 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-6">회사 정보</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                      회사 소개
                    </Link>
                  </li>
                  <li>
                    <Link to="/careers" className="text-gray-400 hover:text-white transition-colors">
                      채용 정보
                    </Link>
                  </li>
                  <li>
                    <Link to="/press" className="text-gray-400 hover:text-white transition-colors">
                      보도 자료
                    </Link>
                  </li>
                  <li>
                    <Link to="/partnerships" className="text-gray-400 hover:text-white transition-colors">
                      파트너십
                    </Link>
                  </li>
                  <li>
                    <Link to="/investors" className="text-gray-400 hover:text-white transition-colors">
                      투자자 정보
                    </Link>
                  </li>
                  <li className="pt-2 border-t border-gray-800">
                    <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                      이용약관
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                      개인정보처리방침
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                      쿠키 정책
                    </Link>
                  </li>
                  <li>
                    <Link to="/refund" className="text-gray-400 hover:text-white transition-colors">
                      환불 정책
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* 다국어 지원 섹션 */}
            <div className="mt-12 pt-8 border-t border-gray-800">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-center">
                  <Globe className="w-5 h-5 mr-2" />
                  14개 언어 지원
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {supportedLanguages.map((lang, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 앱 다운로드 및 인증 */}
            <div className="mt-12 pt-8 border-t border-gray-800">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                
                {/* 앱 다운로드 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">모바일 앱으로 더 편리하게</h3>
                  <div className="flex space-x-4">
                    <a 
                      href="#" 
                      className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 transition-colors px-4 py-2 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">App Store</span>
                    </a>
                    <a 
                      href="#" 
                      className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 transition-colors px-4 py-2 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Google Play</span>
                    </a>
                  </div>
                </div>

                {/* 인증 및 수상 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">인증 & 수상</h3>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="text-sm">ISO 27001 인증</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm">에듀테크 대상 2024</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span className="text-sm">10만+ 학습자</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 미니멀 버전 */
          <div className="py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">SpitKorean</span>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <Link to="/terms" className="hover:text-gray-900 transition-colors">
                  이용약관
                </Link>
                <Link to="/privacy" className="hover:text-gray-900 transition-colors">
                  개인정보처리방침
                </Link>
                <Link to="/support" className="hover:text-gray-900 transition-colors">
                  고객지원
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 하단 저작권 */}
        <div className={`py-6 ${config.showAllSections ? 'border-t border-gray-800' : ''}`}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className={config.showAllSections ? 'text-gray-400' : 'text-gray-500'}>
              © {currentYear} SpitKorean. All rights reserved.
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <span className={config.showAllSections ? 'text-gray-400' : 'text-gray-500'}>
                🇰🇷 Made with
              </span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span className={config.showAllSections ? 'text-gray-400' : 'text-gray-500'}>
                for Korean learners worldwide
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// 미리 정의된 푸터 변형들
export const DefaultFooter = (props) => <Footer variant="default" {...props} />
export const MinimalFooter = (props) => <Footer variant="minimal" {...props} />
export const DarkFooter = (props) => <Footer variant="dark" {...props} />

export default Footer