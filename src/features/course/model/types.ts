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
  dist?: number; // (km)
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

export interface CourseReviewKeyword {
  keywordId: number;
  keyword: string;
  keywordCount: number;
}

export interface CourseReviewSummary {
  categoryCode: string;
  category: string;
  courseReviewKeywordList: CourseReviewKeyword[];
}

export interface CourseReviewDetail {
  userName: string;
  courseReviewKeywordList: CourseReviewKeyword[];
  createdAt: number;
}

export interface CourseReviewResponse {
  courseReviewSummary: CourseReviewSummary[];
  courseReviewDetail: CourseReviewDetail[];
}

export interface CourseReviewKeywordForm {
  keywordId: number;
  keyword: string;
  isSelected: boolean;
}

export interface CourseReviewFormCategory {
  categoryCode: number;
  category: string;
  courseReviewKeywordFormList: CourseReviewKeywordForm[];
}

export interface CourseReviewFormResponse {
  hasMyReview: boolean;
  courseReviewFormDetail: CourseReviewFormCategory[];
}

export interface CourseReviewPatchRequest {
  courseReviewKeywordList: CourseReviewKeywordForm[];
}
