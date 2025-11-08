import type { LatLngBounds } from '@/features/map/model/types';

export type UserLocation = { lat: number; lng: number };

export type CourseType = 'OFFICIAL' | 'UNOFFICIAL';
export type GradeType = 1 | 2 | 3;
export type EnvType =
  | 'PARK'
  | 'TRAIL'
  | 'TRACK'
  | 'URBAN'
  | 'BEACH'
  | 'MOUNTAIN'
  | 'FOREST';
// | 'ETC';
export type EnvTypeName =
  | '공원'
  | '산책로'
  | '트랙'
  | '도심'
  | '해변'
  | '산'
  | '숲';
// | '기타';
export type ShapeType = 'LOOP' | 'LINEAR' | 'OUT_AND_BACK' | 'ART'; // | 'ETC';
export type ShapeTypeName = '순환' | '직선' | '왕복' | '아트'; // | '기타';

export interface Course {
  uuid: string;
  lat: number;
  lng: number;
  name: string;
  type: CourseType;
  grade: GradeType;
  envType: EnvType;
  envTypeName: EnvTypeName;
  shapeType: ShapeType;
  shapeTypeName: ShapeTypeName;
  totalDistance: number;
  svg: string;
  isBookmarked?: boolean;
}

export interface CoursesResponse {
  courseList: Course[];
}

export type CourseSearchParams = {
  radius?: number; // (km)
  grade?: number | number[];
  envType?: EnvType | EnvType[];
  shapeType?: ShapeType | ShapeType[];
  minDist?: number; // (m)
  maxDist?: number; // (m)
  minEle?: number; // (m)
  maxEle?: number; // (m)
  keyword?: string; // text query
};

export interface CoursePoint {
  pointSeq: number;
  lat: number;
  lng: number;
  ele: number;
}

export interface CourseDetail
  extends Course,
    CoursePointResponse,
    LatLngBounds {
  startAddress: string;
  endAddress: string;
  elevationGain: number;
  elevationLoss: number;
  recommendCount: number;
}

export interface CoursePointResponse {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  coursePointList: CoursePoint[];
}

export interface ElevationChartPoint {
  distance: number;
  distanceMeters: number;
  elevation: number;
  lat: number;
  lng: number;
  index: number;
}

export interface KeyPoint extends ElevationChartPoint {
  label: string;
  type: 'start' | 'end' | 'highest' | 'lowest';
}

export type CategoryCode = 'COURSE_GOOD' | 'ENVIRONMENT_GOOD' | 'FACILITY_GOOD';

export type KeywordCode =
  | 'UPHILL_TRAINING'
  | 'GOOD_SURFACE'
  | 'BEGINNER_FRIENDLY'
  | 'POPULAR'
  | 'SCENIC'
  | 'SUNSET_VIEW'
  | 'QUIET_PEACEFUL'
  | 'SHADED'
  | 'WELL_LIT'
  | 'HAS_RESTROOM'
  | 'HAS_WATER'
  | 'EASY_PARKING'
  | 'ACCESSIBLE'
  | 'NEARBY_AMENITIES';

export interface CourseReviewKeyword {
  keywordId: number;
  keywordCode: string;
  keywordCount: number;
}

export interface CourseReviewCategory {
  categoryCode: string;
  courseReviewKeywordList: CourseReviewKeyword[];
}

export interface CourseReviewDetailItem {
  userName: string;
  courseReviewKeywordList: CourseReviewKeyword[];
  createdAt: number; // timestamp(ms)
}

export interface CourseReviewResponse {
  courseReviewSummary: CourseReviewCategory[];
  courseReviewDetail: CourseReviewDetailItem[];
}

export interface CourseReviewFormKeyword {
  keywordId: number;
  keywordCode: string;
  isSelected: boolean;
}

export interface CourseReviewFormCategory {
  categoryCode: string;
  courseReviewKeywordFormList: CourseReviewFormKeyword[];
}

export interface CourseReviewFormResponse {
  hasMyReview: boolean;
  courseReviewFormDetail: CourseReviewFormCategory[];
}

export interface CourseReviewKeywordPatch {
  keywordId: number;
  keywordCode: string;
  isSelected: boolean;
}

export interface CourseReviewPatchRequest {
  courseReviewKeywordList: CourseReviewKeywordPatch[];
}

export interface DisplayKeywordSummary {
  keywordId: number;
  keywordCode: string;
  label: string;
  count: number;
  color: string;
  emoji: string;
}

export interface DisplayCategorySummary {
  categoryCode: string;
  label: string;
  keywords: DisplayKeywordSummary[];
}

export interface DisplayReviewDetailItem {
  userName: string;
  createdAt: number;
  keywords: {
    keywordId: number;
    keywordCode: string;
    label: string;
    emoji: string;
  }[];
}

export interface DisplayFormKeyword {
  keywordId: number;
  keywordCode: string;
  label: string;
  emoji: string;
  isSelected: boolean;
}

export interface DisplayFormCategory {
  categoryCode: string;
  label: string;
  keywords: DisplayFormKeyword[];
}

export type BookmarkType = 'OFFICIAL' | 'USER' | string;

export interface BookmarksResponse {
  bookmarkList: Course[];
}

export interface BookmarkPatchRequest {
  courseUuid: string;
  isBookmarked: boolean;
}
