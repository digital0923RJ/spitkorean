// frontend/src/shared/types/common.ts

/**
 * 공통 타입 정의
 * 애플리케이션 전반에서 사용되는 공통 타입들
 */

// 기본 API 응답 형식
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  meta?: ResponseMeta;
}

// 응답 메타데이터
export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
  timestamp?: string;
  version?: string;
}

// 에러 응답
export interface ErrorResponse {
  status: 'error';
  message: string;
  error_type?: string;
  details?: ErrorDetail[];
  code?: string;
  timestamp: string;
}

// 에러 상세
export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

// 페이지네이션 파라미터
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 페이지네이션 정보
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// 정렬 옵션
export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
  label: string;
}

// 필터 옵션
export interface FilterOption {
  key: string;
  value: any;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select' | 'multi-select';
  options?: { value: any; label: string }[];
}

// 검색 파라미터
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
  include?: string[];
  exclude?: string[];
}

// 로딩 상태
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

// 비동기 상태
export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetched?: string;
}

// 폼 필드 타입
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  value: any;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  multiple?: boolean;
  accept?: string; // file input용
}

// 선택 옵션
export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

// 유효성 검사 규칙
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

// 폼 상태
export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// 알림 타입
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // 자동 삭제 시간 (ms)
  persistent?: boolean; // 수동으로만 삭제 가능
  actions?: NotificationAction[];
  createdAt: string;
}

// 알림 액션
export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

// 모달 상태
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: any;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

// 테마 설정
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  shadows: boolean;
  animations: boolean;
}

// 언어 정보
export interface Language {
  code: string; // ISO 639-1 코드
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string; // 국기 이모지 또는 URL
  isSupported: boolean;
}

// 지역 정보
export interface Locale {
  language: string;
  country: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  timezone: string;
}

// 미디어 파일 정보
export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document';
  mimeType: string;
  size: number; // bytes
  url: string;
  thumbnailUrl?: string;
  duration?: number; // seconds (audio/video)
  dimensions?: {
    width: number;
    height: number;
  };
  uploadedAt: string;
}

// 위치 정보
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

// 주소 정보
export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  formatted?: string;
  location?: Location;
}

// 연락처 정보
export interface Contact {
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  website?: string;
  socialMedia?: {
    platform: string;
    handle: string;
    url: string;
  }[];
}

// 날짜 범위
export interface DateRange {
  start: string;
  end: string;
  timezone?: string;
}

// 시간 범위
export interface TimeRange {
  start: string; // HH:MM 형식
  end: string;   // HH:MM 형식
}

// 색상 정보
export interface Color {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  hsl: {
    h: number;
    s: number;
    l: number;
  };
  name?: string;
}

// 통계 데이터
export interface StatisticData {
  label: string;
  value: number;
  unit?: string;
  change?: number; // 변화율 (%)
  changeDirection?: 'up' | 'down' | 'neutral';
  color?: string;
  icon?: string;
}

// 차트 데이터
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  options?: any; // Chart.js 옵션
}

// 차트 데이터셋
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

// 키-값 쌍
export interface KeyValuePair<T = any> {
  key: string;
  value: T;
  label?: string;
}

// 트리 노드
export interface TreeNode<T = any> {
  id: string;
  label: string;
  data?: T;
  children?: TreeNode<T>[];
  parent?: string;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  icon?: string;
}

// 메뉴 항목
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  action?: () => void;
  children?: MenuItem[];
  badge?: string | number;
  disabled?: boolean;
  visible?: boolean;
  divider?: boolean;
}

// 브레드크럼 항목
export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
  icon?: string;
}

// 탭 항목
export interface TabItem {
  id: string;
  label: string;
  content: any;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
  closable?: boolean;
}

// 액션 버튼
export interface ActionButton {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
}

// 컨텍스트 메뉴
export interface ContextMenu {
  items: ContextMenuItem[];
  position: {
    x: number;
    y: number;
  };
  visible: boolean;
}

// 컨텍스트 메뉴 항목
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  divider?: boolean;
  shortcut?: string;
}

// 토스트 메시지
export interface Toast extends Notification {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

// 환경 설정
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: {
    [featureName: string]: boolean;
  };
  limits: {
    [limitName: string]: number;
  };
  endpoints: {
    [endpointName: string]: string;
  };
}

// 브라우저 정보
export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
  cookieEnabled: boolean;
  javaEnabled: boolean;
  language: string;
  languages: string[];
  onLine: boolean;
  userAgent: string;
}

// 디바이스 정보
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: BrowserInfo;
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
}

// 유틸리티 타입들
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ID 타입
export type ID = string | number;

// 타임스탬프 타입
export type Timestamp = string; // ISO 8601 형식

// 상태 타입
export type Status = 'active' | 'inactive' | 'pending' | 'suspended' | 'deleted';

// 우선순위 타입
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// 크기 타입
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 변형 타입
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';