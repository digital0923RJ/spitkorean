# 🚀 SpitKorean Integrated Master Plan (Vite Applied)

## 📋 Overall Overview

### 🎯 Project Vision
SpitKorean is an AI-powered Korean language learning platform that provides integrated learning for all stages of Korean language acquisition including voice conversation, grammar, TOPIK exam preparation, and drama-based sentence construction.

### 💰 Subscription Product Lineup
1. **Talk Like You Mean It** - $30/month
2. **Drama Builder** - $20/month
3. **Test & Study** - $20/month
4. **Korean Journey** - $30/month

---

## 🎮 Common Feature System

### 🔓 Free Level Selection System
- Complete freedom to choose any level regardless of current skill
- Unlimited re-learning of completed content
- "Master Mode" for repeated lower levels
  - Speed Challenge (time reduction challenge)
  - Mentor Mode (explaining to other learners)
  - 100% accuracy challenge
- Enhanced "Learning Support Mode" for challenging higher levels
  - Hint function activation
  - Step-by-step explanations
  - Immediate basic grammar review

### 🆕 Daily New Content
- GPT-4 generates different problems/conversations/content daily
- Real-time updates reflecting current events/seasons
- Personalized content based on individual interests
- Various variations even for the same topic

### 🏆 Continuous Learning Reward System
```
Day 1 ✓ → Day 7 ✓ → Day 30 ✓ → Day 100 ✓
  🔥1      🏅Badge   🎁Gift     🌟Certificate
```

- 7 consecutive days: Premium emoticon unlock
- 30 consecutive days: Korean snack box delivery
- 100 consecutive days: Online certificate + merchandise

### 🥇 Social League & Competition
```
💎 Diamond League (Top 1%)
   ↑
🏅 Gold League (Top 10%)
   ↑
🥈 Silver League (Top 30%)
   ↑
🥉 Bronze League (Starting)
```

- Weekly competition
- XP-based ranking system
- Special rewards for promotion

### 🌐 Multilingual Explanation Support(using Google Translation API) 
- 🇺🇸 English
- 🇯🇵 Japanese
- 🇨🇳 Chinese
- 🇻🇳 Vietnamese
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇮🇳 Hindi
- 🇹🇭 Thai
- 🇩🇪 German
- 🇲🇳 Mongolian
- 🇸🇦 Arabic
- 🇧🇷 Portuguese
- 🇹🇷 Turkish

Grammar explanations and feedback provided in user's native language

---

## 📘 Talk Like You Mean It

### Product Overview
- AI-based "real Korean friend" conversation service
- Emotion recognition (Hume.ai) + conversation memory system
- $30/month / 60 conversations per day

### Level-specific Features

#### 🌱 Beginner
- Conversation: Daily greetings, weather, hobbies
- Speed: 0.7x (very slow)
- Language ratio: Korean 30% + Native language 70%
- Features: Frequent confirmation, native language re-explanation

#### 🌿 Intermediate
- Conversation: Plans, experiences, opinion sharing
- Speed: 1.0x (normal)
- Language ratio: Korean 70% + Native language 30%
- Features: Context understanding, natural conversation

#### 🌳 Advanced
- Conversation: Current affairs discussion, professional topics
- Speed: 1.2x (natural)
- Language ratio: Korean 95% + Native language 5%
- Features: Nuance understanding, in-depth discussion

---

## 🎬 Drama Builder

### Product Overview
- Drama/real-life situation sentence construction learning
- Grammar feedback + pronunciation evaluation
- **$20/month** / 20 sentences per day

### Level-specific Features

#### 🌱 Beginner
- Sentences: 3-5 word simple sentences
- Drama: Pororo, Tayo
- Grammar: Basic particles (은/는, 이/가)
- Similar sentences: 3

#### 🌿 Intermediate
- Sentences: 7-10 word complex sentences
- Drama: Crash Landing on You, Misaeng
- Grammar: Connective endings, tenses
- Similar sentences: 5

#### 🌳 Advanced
- Sentences: 12+ word complex sentences
- Drama: Kingdom, Extraordinary Attorney Woo
- Grammar: Relative clauses, advanced honorifics
- Similar sentences: 7-10

---

## 🎯 Test & Study

### Product Overview
- TOPIK levels 1-6 exam preparation
- GPT-4 real-time question generation
- **$20/month** / 20 questions per day

### Level-specific Features

#### 🌱 TOPIK 1-2
- Listening: Picture-based answers
- Reading: Signs, simple text comprehension
- Vocabulary: 800-1,500 words
- Grammar: Basic particles, tenses

#### 🌿 TOPIK 3-4
- Listening: News, lectures
- Reading: Explanatory texts, editorials
- Writing: 200-300 character composition
- Vocabulary: 3,000 words

#### 🌳 TOPIK 5-6
- Listening: Academic lectures
- Reading: Academic papers, literature
- Writing: 700-character essays
- Vocabulary: 5,000+ words

---

## 📚 Korean Journey

### Product Overview
- Reading/pronunciation learning starting from Hangul
- Whisper + GPT-4 pronunciation analysis
- $30/month / 20 sentences per day

### Level-specific Features

#### 🌱 Level 1: Hangul Master
- Consonants/vowels learning
- Basic 100 words
- Basic pronunciation rules
- Speed: 0.5x

#### 🌿 Level 2: Basic Reader
- Pronunciation rules (liaison, palatalization)
- Daily conversation texts
- Children's songs, K-Pop
- Speed: 0.8x-1.0x

#### 🌳 Level 3: Intermediate Reader
- News, literary works
- Emotional expression
- Professional vocabulary
- Speed: 1.0x-1.2x

#### 💎 Level 4: Advanced Reader
- Professional texts
- Dialects/regional accents
- Presentations
- Speed: 1.5x+

---

## 🛠️ Technology Stack

### Backend
- Quart + Motor + Celery
- GPT-4, Whisper, 
- Google Cloud TTS
- MongoDB, Redis

### Frontend (Vite-based Upgrade)
- Vite + React 18 + Redux Toolkit
- Key benefits:
  - 95% reduction in dev server start time (15-30s → 1-2s)
  - 90% improvement in HMR reflection time (1-2s → 0.1-0.2s)
  - 65% reduction in production build time (90-120s → 30-45s)
- Tailwind CSS + PostCSS
- WebRTC (voice recording)
- Vitest testing framework

### Infrastructure
- Docker Compose
- AWS ECS/EC2/S3 
- Google OAuth + JWT

---

## 💰 Pricing Policy

### Individual Subscriptions
- Talk Like You Mean It: $30/month
- Drama Builder: $20/month
- Test & Study: $20/month
- Korean Journey: $30/month

### Free Trial
- 3-day free trial (no credit card required)
- Continued free use with limited features

---

# 📁 SpitKorean Project Dictionary & File Structure (Vite-based)

## 🗂️ Overall Project Structure

```
spitkorean/
├── backend/                        # Backend server
├── frontend/                      # Frontend app (Vite-based)
├── infrastructure/               # Infrastructure configuration
├── shared/                       # Common modules
├── documentation/               # Project documentation
├── docker-compose.yml           # Docker integrated configuration
├── .env.example                 # Environment variables example
└── README.md                    # Project overview
```

## 📘 Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # Main application
│   ├── config.py                   # Configuration management
│   ├── database.py                 # DB connection
│   │
│   ├── core/                       # Core central management modules
│   │   ├── __init__.py
│   │   ├── auth.py                 # Central authentication management
│   │   ├── rate_limiter.py         # Usage limit management
│   │   ├── cache_manager.py        # Central cache management
│   │   └── event_bus.py            # Event publish/subscribe
│   │
│   ├── models/                     # Data models
│   │   ├── __init__.py
│   │   ├── user.py                 # User model
│   │   ├── subscription.py         # Subscription model
│   │   ├── chat.py                 # Chat model
│   │   ├── drama.py                # Drama content model
│   │   ├── test.py                 # TOPIK test model
│   │   ├── journey.py              # Reading journey model
│   │   └── common.py               # Common model
│   │
│   ├── routes/                     # API routes
│   │   ├── __init__.py
│   │   ├── auth.py                 # Authentication routes
│   │   ├── talk.py                 # Talk Like You Mean It
│   │   ├── drama.py                # Drama Builder
│   │   ├── test.py                 # Test & Study
│   │   ├── journey.py              # Korean Journey
│   │   └── common.py               # Common routes
│   │
│   ├── services/                   # Business logic
│   │   ├── __init__.py
│   │   ├── gpt_service.py          # GPT-4 service
│   │   ├── whisper_service.py      # Speech recognition service
│   │   ├── tts_service.py          # TTS service
│   │   ├── emotion_service.py      # Emotion analysis service
│   │   ├── translation_service.py  # Multilingual translation service
│   │   ├── gamification_service.py # Gamification service
│   │   └── analytics_service.py    # Analytics service
│   │
│   ├── utils/                      # Utilities
│   │   ├── __init__.py
│   │   ├── auth.py                 # Authentication helpers
│   │   ├── response.py             # Central response formatter
│   │   ├── validators.py           # Input validation
│   │   ├── cache.py                # Cache management
│   │   └── logger.py               # Central logging system
│   │
│   └── tasks/                      # Celery tasks
│       ├── __init__.py
│       ├── audio_tasks.py          # Audio processing
│       ├── analysis_tasks.py       # Analysis tasks
│       ├── notification_tasks.py   # Notification tasks
│       └── content_tasks.py        # Content generation
│
├── tests/                          # Tests
├── migrations/                     # DB migrations
├── Dockerfile                      # Docker configuration
└── requirements.txt               # Dependencies
```

## 🎨 Frontend Structure (Vite-based)

```
frontend/
├── public/                         # Static files
│   ├── favicon.ico (existing)
│   ├── robots.txt (existing)
│   └── assets/                     # Images, icons, etc.
│
├── src/
│   ├── main.jsx (existing)                    # Entry point
│   ├── App.jsx (existing)                     # Main app component
│   ├── routes.jsx (existing)                  # Routing configuration
│   │
│   ├── api/                        # API communication logic
│   │   ├── index.js (existing)                # API client configuration
│   │   ├── auth.js (existing)                 # Authentication related API
│   │   ├── talk.js (existing)                 # Talk Like You Mean It API
│   │   ├── drama.js (existing)                # Drama Builder API
│   │   ├── test.js (existing)                 # Test & Study API
│   │   ├── journey.js (existing)              # Korean Journey API
│   │   └── subscription.js (existing)         # Subscription related API
│   │
│   ├── components/                 # Common components
│   │   ├── common/                 # Basic UI components
│   │   │   ├── Button.jsx (existing)
│   │   │   ├── Input.jsx (existing)
│   │   │   ├── Modal.jsx (existing)
│   │   │   ├── Dropdown.jsx (existing)
│   │   │   ├── Card.jsx (existing)
│   │   │   ├── TranslatableText.jsx (existing) # 🌟 Real-time translation component
│   │   │   ├── LanguageSelector.jsx (existing) # Language selector
│   │   │   └── Loader.jsx (existing)
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── Header.jsx (existing)
│   │   │   ├── Sidebar.jsx (existing)
│   │   │   ├── Footer.jsx (existing)
│   │   │   └── AuthLayout.jsx (existing)
│   │   │
│   │   ├── auth/                   # Authentication related components
│   │   │   ├── LoginForm.jsx (existing)
│   │   │   ├── RegisterForm.jsx (existing)
│   │   │   └── ProtectedRoute.jsx (existing)
│   │   │
│   │   ├── talk/                   # Talk Like You Mean It components
│   │   │   ├── ChatInterface.jsx (existing)
│   │   │   ├── MessageBubble.jsx (existing)
│   │   │   ├── VoiceRecorder.jsx (existing)
│   │   │   └── EmotionIndicator.jsx (existing)
│   │   │
│   │   ├── drama/                  # Drama Builder components
│   │   │   ├── SentenceBuilder.jsx (existing)
│   │   │   ├── SentenceCard.jsx (existing)
│   │   │   ├── GrammarTips.jsx (existing)
│   │   │   └── SimilarSentences.jsx (existing)
│   │   │
│   │   ├── test/                   # Test & Study components
│   │   │   ├── QuestionCard.jsx (existing)
│   │   │   ├── MultipleChoice.jsx (existing)
│   │   │   ├── ExplanationPanel.jsx (existing)
│   │   │   └── ProgressTracker.jsx (existing)
│   │   │
│   │   ├── journey/                # Korean Journey components
│   │   │   ├── ReadingPanel.jsx (existing)
│   │   │   ├── PronunciationFeedback.jsx (existing)
│   │   │   ├── HangulDisplay.jsx (existing)
│   │   │   └── SpeedControl.jsx (existing)
│   │   │
│   │   ├── subscription/           # Subscription related components
│   │   │   ├── PlanCard.jsx (existing)
│   │   │   ├── PlanComparison.jsx (existing)
│   │   │   ├── PaymentForm.jsx (existing)
│   │   │   └── SubscriptionStatus.jsx (existing)
│   │   │
│   │   └── feedback/               # Feedback related components
│   │       ├── FeedbackCard.jsx (existing)
│   │       ├── AiFeedback.jsx (existing)
│   │       └── TranslatedFeedback.jsx (existing)
│   │
│   ├── pages/                      # Page components
│   │   ├── Home.jsx (existing)                # Homepage
│   │   ├── Login.jsx (existing)               # Login page
│   │   ├── Register.jsx (existing)            # Registration page
│   │   ├── Dashboard.jsx (existing)           # Dashboard page
│   │   │
│   │   ├── talk/                   # Talk Like You Mean It pages
│   │   │   ├── TalkHome.jsx (existing)        # Main page
│   │   │   ├── ChatSession.jsx (existing)     # Chat session page
│   │   │   └── SessionHistory.jsx (existing)  # Previous session view page
│   │   │
│   │   ├── drama/                  # Drama Builder pages
│   │   │   ├── DramaHome.jsx (existing)       # Main page
│   │   │   ├── SentencePractice.jsx (existing)# Sentence practice page
│   │   │   └── Progress.jsx (existing)        # Progress page
│   │   │
│   │   ├── test/                   # Test & Study pages
│   │   │   ├── TestHome.jsx (existing)        # Main page
│   │   │   ├── QuizSession.jsx (existing)     # Quiz session page
│   │   │   ├── Results.jsx (existing)         # Results page
│   │   │   └── Statistics.jsx (existing)      # Statistics page
│   │   │
│   │   ├── journey/                # Korean Journey pages
│   │   │   ├── JourneyHome.jsx (existing)     # Main page
│   │   │   ├── ReadingSession.jsx (existing)  # Reading session page
│   │   │   └── LevelProgress.jsx (existing)   # Level progress page
│   │   │
│   │   ├── subscription/           # Subscription related pages
│   │   │   ├── Plans.jsx (existing)           # Plan selection page
│   │   │   ├── Checkout.jsx (existing)        # Payment page
│   │   │   └── ManageSubscription.js (existing) # Subscription management page
│   │   │
│   │   └── profile/                # Profile related pages
│   │       ├── Profile.jsx (existing)         # Profile page
│   │       ├── EditProfile.jsx (existing)     # Profile edit page
│   │       └── Settings.jsx (existing)        # Settings page
│   │
│   ├── services/                   # External service integration
│   │   ├── googleTranslate.js (existing)      # 🌟 Google Translate API service
│   │   ├── openai.js (existing)               # OpenAI feedback service
│   │   └── stripe.js (existing)               # Stripe payment service
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── useAuth.js (existing)              # Authentication related hook
│   │   ├── useChat.js (existing)              # Chat related hook
│   │   ├── useVoice.js (existing)             # Voice related hook
│   │   ├── useLanguage.js (existing)          # 🌟 Language setting related hook
│   │   ├── useGamification.js (existing)      # Gamification custom hook
│   │   └── useSubscription.js (existing)      # Subscription related hook
│   │
│   ├── store/                      # State management (Redux)
│   │   ├── index.js (existing)                # Store configuration
│   │   ├── slices/                 # Redux slices
│   │   │   ├── authSlice.js (existing)        # Authentication state management
│   │   │   ├── talkSlice.js (existing)        # Talk Like You Mean It state
│   │   │   ├── dramaSlice.js (existing)       # Drama Builder state
│   │   │   ├── testSlice.js (existing)        # Test & Study state
│   │   │   ├── journeySlice.js (existing)     # Korean Journey state
│   │   │   ├── subscriptionSlice.js (existing)# Subscription state
│   │   │   ├── languageSlice.js (existing)    # Language state management
│   │   │   └── feedbackSlice.js (existing)    # Feedback state
│   │   │
│   │   └── middleware/             # Middleware
│   │       └── api.js (existing)              # API middleware
│   │
│   ├── shared/                     # Shared modules
│   │   ├── constants/              # Global constants
│   │   │   ├── products.js (existing)         # Product definitions
│   │   │   ├── subscriptions.js (existing)    # Subscription plan definitions
│   │   │   ├── levels.js (existing)           # Learning level definitions
│   │   │   ├── routes.js (existing)           # Route path definitions
│   │   │   └── api.js (existing)              # API path definitions
│   │   │
│   │   ├── types/                  # Type definitions (TypeScript)
│   │   │   ├── products.ts (existing)         # Product types
│   │   │   ├── user.ts (existing)             # User types
│   │   │   ├── subscription.ts (existing)     # Subscription types
│   │   │   └── common.ts (existing)           # Common types
│   │   │
│   │   └── utils/                  # Shared utilities
│   │       ├── formatting.js (existing)       # Formatting functions
│   │       ├── validation.js (existing)       # Validation
│   │       └── calculations.js (existing)     # Calculation functions
│   │
│   ├── utils/                      # Utility functions
│   │   ├── auth.js (existing)                 # Authentication related utilities
│   │   ├── format.js (existing)               # Formatting utilities
│   │   ├── validation.js (existing)           # Validation utilities
│   │   └── storage.js (existing)              # Local storage management
│   │
│   ├── assets/                     # Source assets
│   │   ├── icons/                  # Icons
│   │   ├── images/                 # Images
│   │   └── sounds/                 # Audio files
│   │
│   └── styles/                     # Styles
│       ├── index.css (existing)               # Basic styles
│
├── tests/                          # Test files
│   ├── components/                 # Component tests
│   ├── pages/                      # Page tests
│   └── hooks/                      # Hook tests
│
├── .env (existing)                            # Environment variables
├── .env.development                # Development environment variables
├── .env.production                 # Production environment variables
├── index.html (existing)                      # HTML entry point
├── vite.config.js (existing)                  # Vite configuration
├── tailwind.config.js (existing)              # Tailwind configuration
├── postcss.config.js (existing)               # PostCSS configuration
└── package.json (existing)                    # Package information & scripts
```

## 🛠️ Infrastructure Structure

```
infrastructure/
├── docker/
│   ├── nginx/
│   │   └── nginx.conf              # Central web server configuration
│   └── redis/
│       └── redis.conf              # Cache configuration
│
├── kubernetes/                     # K8s configuration (optional)
│   ├── deployments/
│   ├── services/
│   └── ingress/
│
└── terraform/                      # Infrastructure as code (optional)
    ├── aws/
    └── modules/
```


## 🗄️ Database Structure

### MongoDB Collections

```javascript
// users - User information
{
  _id: ObjectId,
  email: String,
  profile: {
    name: String,
    nativeLanguage: String,
    koreanLevel: String,
    interests: [String]
  },
  subscriptions: [{
    product: String,
    status: String,
    startDate: Date,
    endDate: Date
  }],
  preferences: {
    studyGoals: [String],
    dailyStudyTime: Number
  }
}

// chat_logs - Talk Like You Mean It conversation records
{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: String,
  messages: [{
    role: String,
    content: String,
    timestamp: Date,
    emotion: Object
  }],
  level: String,
  date: Date
}

// drama_progress - Drama Builder progress
{
  _id: ObjectId,
  userId: ObjectId,
  dramaId: String,
  episodeId: String,
  completedSentences: [String],
  accuracy: Number,
  level: String,
  date: Date
}

// test_results - Test & Study results
{
  _id: ObjectId,
  userId: ObjectId,
  testType: String,
  level: Number,
  score: Number,
  questions: [{
    question: String,
    userAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean
  }],
  weaknesses: [String],
  date: Date
}

// reading_history - Korean Journey records
{
  _id: ObjectId,
  userId: ObjectId,
  contentId: String,
  readingSpeed: Number,
  pronunciationScore: Number,
  completedSentences: Number,
  level: String,
  date: Date
}

// gamification - Gamification data
{
  _id: ObjectId,
  userId: ObjectId,
  streakDays: Number,
  totalXP: Number,
  currentLeague: String,
  achievements: [String],
  weeklyProgress: Object
}
```
## 🎯 Product-specific Core Files

### Talk Like You Mean It
- **Backend**: `backend/app/routes/talk.py`, `backend/app/services/gpt_service.py`
- **Frontend**: `frontend/src/pages/talk/`, `frontend/src/components/talk/`
- **API**: `frontend/src/api/talk.js`
- **State Management**: `frontend/src/store/slices/talkSlice.js`
- **Hooks**: `frontend/src/hooks/useChat.js`, `frontend/src/hooks/useVoice.js`

### Drama Builder
- **Backend**: `backend/app/routes/drama.py`, `backend/app/models/drama.py`
- **Frontend**: `frontend/src/pages/drama/`, `frontend/src/components/drama/`
- **API**: `frontend/src/api/drama.js`
- **State Management**: `frontend/src/store/slices/dramaSlice.js`

### Test & Study
- **Backend**: `backend/app/routes/test.py`, `backend/app/services/gpt_service.py`
- **Frontend**: `frontend/src/pages/test/`, `frontend/src/components/test/`
- **API**: `frontend/src/api/test.js`
- **State Management**: `frontend/src/store/slices/testSlice.js`

### Korean Journey
- **Backend**: `backend/app/routes/journey.py`, `backend/app/services/whisper_service.py`
- **Frontend**: `frontend/src/pages/journey/`, `frontend/src/components/journey/`
- **API**: `frontend/src/api/journey.js`
- **State Management**: `frontend/src/store/slices/journeySlice.js`

## 🔗 Common Connection Points

### Backend Common
- `backend/app/core/auth.py` - Central authentication
- `backend/app/core/rate_limiter.py` - Usage limitations
- `backend/app/utils/response.py` - Unified response format

### Frontend Common
- `frontend/src/api/index.js` - Central API client
- `frontend/src/store/index.js` - Global state management
- `frontend/src/components/common/` - Common UI components
- `frontend/src/shared/constants/` - Product-specific configuration constants

### Product-specific Translation/Feedback Usage
- **Talk Like You Mean It**: OpenAI feedback (conversation analysis, grammar correction)
- **Drama Builder**: Google Translate (sentence translation) + OpenAI feedback (grammar explanation)
- **Test & Study**: Google Translate (question translation) + OpenAI feedback (wrong answer explanation)
- **Korean Journey**: Google Translate (content translation) + OpenAI feedback (pronunciation analysis)

## 🚀 Key Vite Migration Changes

### File Structure Changes
- `src/index.js` → `src/main.jsx` (entry point)
- `public/index.html` → `index.html` (moved to root)
- React component file extensions `.js` → `.jsx`

### Environment Variable Changes
- `process.env.REACT_APP_*` → `import.meta.env.VITE_*`


