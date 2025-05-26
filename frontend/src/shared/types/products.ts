// frontend/src/shared/types/products.ts

/**
 * SpitKorean 상품 타입 정의
 * 4개 핵심 상품과 번들 패키지 타입
 */

// 상품 ID 타입
export type ProductId = 'talk' | 'drama' | 'test' | 'journey';

// 번들 패키지 ID 타입
export type BundleId = 'bundle_2' | 'bundle_3' | 'bundle_all';

// 학습 레벨 타입 (상품별로 다름)
export type KoreanLevel = 'beginner' | 'intermediate' | 'advanced';
export type TOPIKLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type JourneyLevel = 'level1' | 'level2' | 'level3' | 'level4';

// 컨텐츠 타입
export type ContentType = 
  | 'conversation'     // Talk: 대화
  | 'sentence'         // Drama: 문장 구성
  | 'question'         // Test: 문제
  | 'reading'          // Journey: 읽기
  | 'pronunciation'    // Journey: 발음
  | 'hangul'          // Journey: 한글
  | 'dialogue';       // Journey: 대화문

// 문제 유형 (Test & Study)
export type QuestionType = 
  | 'vocabulary'       // 어휘
  | 'grammar'          // 문법
  | 'reading'          // 읽기
  | 'listening'        // 듣기
  | 'writing';         // 쓰기

// 드라마 장르 (Drama Builder)
export type DramaGenre = 
  | 'daily'            // 일상
  | 'romance'          // 로맨스
  | 'business'         // 비즈니스
  | 'medical'          // 의료
  | 'legal'            // 법정
  | 'historical'       // 사극
  | 'family';          // 가족

/**
 * 기본 상품 인터페이스
 */
export interface Product {
  id: ProductId;
  name: string;
  description: string;
  price: number;
  dailyLimit: number;
  features: string[];
  category: 'conversation' | 'grammar' | 'test' | 'reading';
  difficulty: KoreanLevel[];
  supportedLanguages: string[];
}

/**
 * Talk Like You Mean It 상품
 */
export interface TalkProduct extends Product {
  id: 'talk';
  conversationTypes: {
    beginner: string[];      // ['daily_greeting', 'weather', 'hobbies']
    intermediate: string[];  // ['weekend_plans', 'movie_review', 'travel']
    advanced: string[];      // ['current_events', 'philosophy', 'career']
  };
  emotionSupport: boolean;
  voiceRecognition: boolean;
  aiPersonality: string[];
}

/**
 * Drama Builder 상품
 */
export interface DramaProduct extends Product {
  id: 'drama';
  supportedGenres: DramaGenre[];
  sentenceComplexity: {
    beginner: {
      wordCount: [number, number];    // [3, 5]
      grammarPoints: string[];        // ['basic_particles']
      similarSentences: number;       // 3
    };
    intermediate: {
      wordCount: [number, number];    // [7, 10]
      grammarPoints: string[];        // ['connective_endings', 'tense']
      similarSentences: number;       // 5
    };
    advanced: {
      wordCount: [number, number];    // [12, 20]
      grammarPoints: string[];        // ['relative_clauses', 'formal_endings']
      similarSentences: number;       // 7-10
    };
  };
  dramaLibrary: {
    beginner: string[];              // ['뽀로로', '타요']
    intermediate: string[];          // ['사랑의 불시착', '미생']
    advanced: string[];              // ['킹덤', '우영우']
  };
}

/**
 * Test & Study 상품
 */
export interface TestProduct extends Product {
  id: 'test';
  supportedLevels: TOPIKLevel[];
  questionTypes: QuestionType[];
  testStructure: {
    topik1: {
      levels: [1, 2];
      sections: ['listening', 'reading'];
      questionCount: number;           // 70
      timeLimit: number;               // 100 minutes
    };
    topik2: {
      levels: [3, 4, 5, 6];
      sections: ['listening', 'reading', 'writing'];
      questionCount: number;           // 70
      timeLimit: number;               // 180 minutes
    };
  };
  vocabularyRange: {
    [K in TOPIKLevel]: number;       // 1: 800, 2: 1500, 3-4: 3000, 5-6: 5000+
  };
  mockExamMode: boolean;
  weaknessAnalysis: boolean;
}

/**
 * Korean Journey 상품
 */
export interface JourneyProduct extends Product {
  id: 'journey';
  supportedLevels: JourneyLevel[];
  contentTypes: ContentType[];
  levelStructure: {
    level1: {
      name: '한글 마스터';
      description: '한글 자음과 모음, 기초 단어를 학습합니다.';
      recommendedSpeed: 0.5;
      content: ['hangul', 'pronunciation'];
      vocabulary: number;              // 100
    };
    level2: {
      name: '기초 리더';
      description: '간단한 일상 대화와 문장을 읽습니다.';
      recommendedSpeed: 0.8;
      content: ['reading', 'dialogue'];
      vocabulary: number;              // 500
    };
    level3: {
      name: '중급 리더';
      description: '뉴스, 블로그 글 등의 중급 텍스트를 읽습니다.';
      recommendedSpeed: 1.0;
      content: ['reading', 'pronunciation'];
      vocabulary: number;              // 2000
    };
    level4: {
      name: '고급 리더';
      description: '문학 작품, 전문적인 글 등의 고급 텍스트를 읽습니다.';
      recommendedSpeed: 1.2;
      content: ['reading', 'pronunciation'];
      vocabulary: number;              // 5000+
    };
  };
  pronunciationAnalysis: boolean;
  ttsSupport: boolean;
  speedControl: boolean;
}

/**
 * 번들 패키지 인터페이스
 */
export interface BundlePackage {
  id: BundleId;
  name: string;
  description: string;
  discount: number;                    // 0.10 = 10% 할인
  minProducts: number;
  maxProducts: number;
  includedProducts?: ProductId[];      // bundle_all의 경우 모든 상품
  price?: number;                      // 고정 가격 (bundle_all: $75)
  benefits: string[];
}

/**
 * 상품 기능 상세 정의
 */
export interface ProductFeature {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isPremium?: boolean;
}

/**
 * 상품 제한사항
 */
export interface ProductLimitation {
  dailyLimit: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  concurrentSessions?: number;
  maxFileSize?: number;                // MB
  maxRecordingTime?: number;           // seconds
}

/**
 * 상품 통계
 */
export interface ProductStats {
  totalUsers: number;
  activeUsers: number;
  averageRating: number;
  completionRate: number;
  retentionRate: {
    week1: number;
    month1: number;
    month3: number;
  };
}

/**
 * 상품 메타데이터
 */
export interface ProductMeta {
  version: string;
  lastUpdated: string;
  changeLog: {
    version: string;
    date: string;
    changes: string[];
  }[];
  betaFeatures?: string[];
}

/**
 * 완전한 상품 정보 (모든 데이터 포함)
 */
export interface CompleteProduct extends Product {
  features: ProductFeature[];
  limitations: ProductLimitation;
  stats: ProductStats;
  meta: ProductMeta;
}

/**
 * 상품 카탈로그 (전체 상품 목록)
 */
export interface ProductCatalog {
  products: {
    talk: TalkProduct;
    drama: DramaProduct;
    test: TestProduct;
    journey: JourneyProduct;
  };
  bundles: {
    bundle_2: BundlePackage;
    bundle_3: BundlePackage;
    bundle_all: BundlePackage;
  };
  metadata: {
    totalProducts: number;
    supportedLanguages: string[];
    priceRange: {
      min: number;
      max: number;
    };
    lastUpdated: string;
  };
}

/**
 * 상품 가격 정책
 */
export interface PricingPolicy {
  individual: {
    [K in ProductId]: {
      monthly: number;
      quarterly?: number;               // 10% 할인
      yearly?: number;                  // 20% 할인
      lifetime?: number;                // $1,299
    };
  };
  bundles: {
    [K in BundleId]: {
      products: number;
      discount: number;
      price?: number;
    };
  };
  freeTrial: {
    duration: number;                   // 7 days
    creditCardRequired: boolean;        // false
    limitations: {
      [K in ProductId]?: Partial<ProductLimitation>;
    };
  };
}

/**
 * 상품 비교 타입
 */
export interface ProductComparison {
  products: ProductId[];
  features: {
    [featureId: string]: {
      [productId in ProductId]?: boolean | string | number;
    };
  };
  recommendations: {
    bestFor: {
      beginners: ProductId[];
      intermediate: ProductId[];
      advanced: ProductId[];
    };
    mostPopular: ProductId;
    bestValue: ProductId;
  };
}

/**
 * 상품 사용 패턴
 */
export interface ProductUsagePattern {
  productId: ProductId;
  averageSessionTime: number;          // minutes
  peakUsageHours: number[];           // [19, 20, 21] = 7-9PM
  preferredDifficulty: KoreanLevel;
  commonFeatures: string[];
  dropoffPoints: string[];            // 사용자가 그만두는 지점
}

/**
 * 상품 개인화 설정
 */
export interface ProductPersonalization {
  productId: ProductId;
  userLevel: KoreanLevel;
  interests: string[];
  learningGoals: string[];
  preferredContentTypes: ContentType[];
  customSettings: {
    [key: string]: any;
  };
}

// 타입 가드 함수들
export const isProductId = (id: string): id is ProductId => {
  return ['talk', 'drama', 'test', 'journey'].includes(id);
};

export const isBundleId = (id: string): id is BundleId => {
  return ['bundle_2', 'bundle_3', 'bundle_all'].includes(id);
};

export const isTOPIKLevel = (level: number): level is TOPIKLevel => {
  return level >= 1 && level <= 6;
};

export const isJourneyLevel = (level: string): level is JourneyLevel => {
  return ['level1', 'level2', 'level3', 'level4'].includes(level);
};

// 상품별 타입 가드
export const isTalkProduct = (product: Product): product is TalkProduct => {
  return product.id === 'talk';
};

export const isDramaProduct = (product: Product): product is DramaProduct => {
  return product.id === 'drama';
};

export const isTestProduct = (product: Product): product is TestProduct => {
  return product.id === 'test';
};

export const isJourneyProduct = (product: Product): product is JourneyProduct => {
  return product.id === 'journey';
};

// 상수 정의
export const PRODUCT_CATEGORIES = {
  CONVERSATION: 'conversation',
  GRAMMAR: 'grammar',
  TEST: 'test',
  READING: 'reading'
} as const;

export const SUPPORTED_LANGUAGES = [
  'ko', 'en', 'ja', 'zh', 'vi', 'es', 'fr', 'hi', 'th', 'de', 'mn', 'ar', 'pt', 'tr'
] as const;

export const KOREAN_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export const TOPIK_LEVELS = [1, 2, 3, 4, 5, 6] as const;
export const JOURNEY_LEVELS = ['level1', 'level2', 'level3', 'level4'] as const;