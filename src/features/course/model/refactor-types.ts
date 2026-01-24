/**
 * 리팩토링을 위한 타입 정의
 *
 * 이 파일은 CourseMap 컴포넌트와 관련 훅들의 리팩토링을 위한
 * TypeScript Interface와 Hook Signature를 정의합니다.
 */

import type { RefObject } from 'react';

import type { Course, CoursePoint } from '@/features/course/model/types';
import type { MarkerInput } from '@/features/map/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

// ============================================================================
// 1. CourseMap 컴포넌트 분리를 위한 타입 정의
// ============================================================================

/**
 * CourseMap 컴포넌트의 Props
 */
export interface CourseMapProps {
  onViewModeChange: (mode: 'map' | 'list') => void;
}

/**
 * CourseMapContainer의 반환 타입 (비즈니스 로직)
 */
export interface CourseMapContainerData {
  // 코스 데이터
  courses: Course[];
  activeCourse: Course | null;
  activeCourseId: string | null;
  coursePointList: CoursePoint[];
  isFetching: boolean;

  // 지도 상태
  mapRef: RefObject<naver.maps.Map | null>;
  viewport: MapViewportState;
  initialCenter: { lat: number; lng: number } | null;
  initialZoom: number | undefined;

  // UI 상태
  showSearchButton: boolean;
  isLocationLoading: boolean;

  // 이벤트 핸들러
  handlers: CourseMapHandlers;

  // 스크롤 관련
  scrollerRef: RefObject<HTMLDivElement>;
  scrollToCenter: (id: string) => void;

  // 마커 데이터
  markers: MarkerInput[];
  displayPoints: CoursePoint[];
  activeColor: RUNDDY_COLOR;
}

/**
 * CourseMap 이벤트 핸들러들
 */
export interface CourseMapHandlers {
  onMapInit: (map: naver.maps.Map) => void;
  onMarkerClick: (uuid: string) => void;
  onScrollChange: (uuid: string) => void;
  onSearchHere: () => void;
  onSearchByCurrentLocation: () => Promise<void>;
  onViewModeChange: (mode: 'map' | 'list') => void;
}

/**
 * CourseMapView의 Props (순수 UI)
 */
export interface CourseMapViewProps {
  // 데이터
  courses: Course[];
  activeCourse: Course | null;
  activeCourseId: string | null;
  markers: MarkerInput[];
  displayPoints: CoursePoint[];
  activeColor: RUNDDY_COLOR;

  // 지도 상태
  mapRef: RefObject<naver.maps.Map | null>;
  initialCenter: { lat: number; lng: number } | null;
  initialZoom: number | undefined;

  // UI 상태
  showSearchButton: boolean;
  isFetching: boolean;
  isLocationLoading: boolean;

  // 스크롤
  scrollerRef: RefObject<HTMLDivElement>;

  // 이벤트 핸들러
  handlers: CourseMapHandlers;
}

// ============================================================================
// 2. 지도 관련 타입 정의
// ============================================================================

/**
 * 지도 뷰포트 상태
 */
export interface MapViewportState {
  center: { lat: number; lng: number };
  radius: number;
  zoom: number;
}

/**
 * 지도 검색 영역 정보
 */
export interface MapSearchArea {
  center: { lat: number; lng: number };
  radius: number;
  zoom: number;
}

/**
 * 지도 인터랙션 상태
 */
export interface MapInteractionState {
  movedByUser: boolean;
  isSearching: boolean;
}

// ============================================================================
// 3. 코스 선택 관련 타입
// ============================================================================

/**
 * 활성 코스 선택 상태
 */
export interface CourseSelectionState {
  activeCourseId: string | null;
  activeCourse: Course | null;
  setActiveCourseId: (id: string | null) => void;
  selectCourse: (uuid: string) => void;
}

/**
 * 코스 변경 감지 결과
 */
export interface CourseChangeDetection {
  coursesChanged: boolean;
  shouldScrollToFirst: boolean;
  shouldRestoreActive: boolean;
}

// ============================================================================
// 4. 스크롤 동기화 관련 타입
// ============================================================================

/**
 * 스크롤-지도 양방향 동기화 옵션
 */
export interface MapScrollSyncOptions {
  scrollerRef: RefObject<HTMLDivElement>;
  courses: Course[];
  activeCourseId: string | null;
  scrollToCenter: (id: string) => void;
  onScrollChange: (uuid: string) => void;
}

/**
 * 스크롤 동기화 상태
 */
export interface ScrollSyncState {
  isProgrammaticScroll: boolean;
  hasScrolledToActive: boolean;
  previousFirstCourseId: string | null;
}

/**
 * 스크롤 동기화 액션
 */
export interface ScrollSyncActions {
  triggerScrollToCourse: (courseId: string) => void;
  handleUserScroll: (courseId: string) => void;
  resetScrollState: () => void;
}

// ============================================================================
// 5. SVG 새니타이제이션 관련 타입
// ============================================================================

/**
 * SVG 새니타이제이션 옵션
 */
export interface SvgSanitizationOptions {
  allowedTags?: string[];
  removeScripts?: boolean;
  removeEventHandlers?: boolean;
}

/**
 * 새니타이즈된 SVG 캐시
 */
export interface SanitizedSvgCache {
  original: string;
  sanitized: string;
  timestamp: number;
}

// ============================================================================
// 6. 마커 최적화 관련 타입
// ============================================================================

/**
 * 마커 생성 옵션
 */
export interface MarkerGenerationOptions {
  courses: Course[];
  activeCourseId: string | null;
  coursePointList: CoursePoint[];
  userLocation: { lat: number; lng: number } | null;
}

/**
 * 마커 생성 결과
 */
export interface GeneratedMarkers {
  markers: MarkerInput[];
  startMarkers: MarkerInput[];
  endMarkers: MarkerInput[];
  locationMarker: MarkerInput | null;
}

// ============================================================================
// 7. Polyline 최적화 관련 타입
// ============================================================================

/**
 * Polyline 좌표 메모이제이션 옵션
 */
export interface PolylineCoordinatesOptions {
  points: CoursePoint[];
  shouldGenerate: boolean;
}

/**
 * Polyline 좌표 결과
 */
export interface PolylineCoordinates {
  path: naver.maps.LatLng[];
  pointCount: number;
  bounds: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  } | null;
}

// ============================================================================
// 8. 리스트 가상화 관련 타입
// ============================================================================

/**
 * 가상 스크롤 아이템 정보
 */
export interface VirtualScrollItem {
  index: number;
  start: number;
  end: number;
  size: number;
}

/**
 * 가상 스크롤 범위
 */
export interface VirtualScrollRange {
  startIndex: number;
  endIndex: number;
  visibleItems: VirtualScrollItem[];
  totalSize: number;
}

/**
 * 가상 스크롤 옵션
 */
export interface VirtualScrollOptions {
  itemCount: number;
  itemSize: number;
  overscan?: number;
  orientation?: 'vertical' | 'horizontal';
}

// ============================================================================
// 9. 필터 리팩토링 관련 타입
// ============================================================================

/**
 * 필터 상태
 */
export interface FilterState {
  gradeList: number[];
  envTypeList: string[];
  shapeTypeList: string[];
  distanceRange: [number, number];
  elevationRange: [number, number];
}

/**
 * 필터 적용 결과
 */
export interface AppliedFilterInfo {
  filterCount: number;
  courseCount: number;
  isDefault: boolean;
}

/**
 * 필터 URL 동기화 옵션
 */
export interface FilterUrlSyncOptions {
  searchParams: URLSearchParams;
  defaultFilters: FilterState;
}
