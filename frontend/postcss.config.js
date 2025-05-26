export default {
  plugins: {
    // Tailwind CSS 처리
    tailwindcss: {},
    
    // CSS 자동 전처리 (브라우저 호환성)
    autoprefixer: {},
    
    // 개발 환경에서는 최적화 스킵, 프로덕션에서만 적용
    ...(process.env.NODE_ENV === 'production' && {
      // CSS 최적화 및 압축
      cssnano: {
        preset: ['default', {
          // 주석 제거
          discardComments: {
            removeAll: true,
          },
          // 중복 규칙 제거
          discardDuplicates: true,
          // 사용되지 않는 CSS 제거
          discardUnused: true,
          // 색상 값 최적화
          colormin: true,
          // CSS 변수 최적화
          normalizeWhitespace: true,
        }],
      },
      
      // PurgeCSS - 사용되지 않는 CSS 제거
      '@fullhuman/postcss-purgecss': {
        content: [
          './index.html',
          './src/**/*.{js,jsx,ts,tsx}',
        ],
        // Tailwind CSS 및 동적 클래스 보호
        safelist: [
          // 동적으로 생성되는 클래스들
          /^(bg-|text-|border-|hover:)/,
          // 애니메이션 클래스들
          /^animate-/,
          // 반응형 클래스들
          /^(sm:|md:|lg:|xl:|2xl:)/,
          // 상태 클래스들
          /^(focus:|active:|disabled:)/,
          // SpitKorean 커스텀 클래스들
          /^spitkorean-/,
        ],
        // Tailwind CSS 기본 클래스들 보호
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      },
    }),
  },
};