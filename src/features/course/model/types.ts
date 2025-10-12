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

export interface CoursePoint {
  pointSeq: number;
  lat: number;
  lng: number;
  ele: number;
}

export interface CourseDetail extends Course, CoursePointResponse {
  startAddress: string;
  endAddress: string;
  elevationGain: number;
  elevationLoss: number;
  recommendCount: number;
}

export interface CoursesResponse {
  courseList: Course[];
}

export interface CoursePointResponse {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  coursePointList: CoursePoint[];
}
