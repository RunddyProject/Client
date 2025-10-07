import { api } from '@/lib/api/api';

export type CourseType = 'OFFICIAL' | 'UNOFFICIAL';
export type GradeType = 1 | 2 | 3;
export type EnvType =
  | 'PARK'
  | 'TRAIL'
  | 'TRACK'
  | 'URBAN'
  | 'BEACH'
  | 'MOUNTAIN'
  | 'FOREST'
  | 'ETC';
export type EnvTypeName =
  | '공원'
  | '산책로'
  | '트랙'
  | '도심'
  | '해변'
  | '산'
  | '숲'
  | '기타';
export type ShapeType = 'LOOP' | 'LINEAR' | 'OUT_AND_BACK' | 'ART' | 'ETC';
export type ShapeTypeName = '순환' | '직선' | '왕복' | '아트' | '기타';

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

export const ENV_TYPE_TO_NAME: Record<EnvType, EnvTypeName> = {
  PARK: '공원',
  TRAIL: '산책로',
  TRACK: '트랙',
  URBAN: '도심',
  BEACH: '해변',
  MOUNTAIN: '산',
  FOREST: '숲',
  ETC: '기타'
} as const;

export const ENV_NAME_TO_TYPE: Record<EnvTypeName, EnvType> = {
  공원: 'PARK',
  산책로: 'TRAIL',
  트랙: 'TRACK',
  도심: 'URBAN',
  해변: 'BEACH',
  산: 'MOUNTAIN',
  숲: 'FOREST',
  기타: 'ETC'
} as const;

export const SHAPE_TYPE_TO_NAME: Record<ShapeType, ShapeTypeName> = {
  LOOP: '순환',
  LINEAR: '직선',
  OUT_AND_BACK: '왕복',
  ART: '아트',
  ETC: '기타'
} as const;

export const SHAPE_NAME_TO_TYPE: Record<ShapeTypeName, ShapeType> = {
  순환: 'LOOP',
  직선: 'LINEAR',
  왕복: 'OUT_AND_BACK',
  아트: 'ART',
  기타: 'ETC'
} as const;

export const grades = [1, 2, 3];
export const envTypeNames = Object.keys(ENV_NAME_TO_TYPE) as EnvTypeName[];
export const shapeTypeNames = Object.keys(
  SHAPE_NAME_TO_TYPE
) as ShapeTypeName[];

export function safeEnvTypeName(t: EnvType | string): EnvTypeName {
  return (ENV_TYPE_TO_NAME as Record<string, EnvTypeName>)[t] ?? '기타';
}
export function safeShapeTypeName(t: ShapeType | string): ShapeTypeName {
  return (SHAPE_TYPE_TO_NAME as Record<string, ShapeTypeName>)[t] ?? '기타';
}

export const CoursesApi = {
  getCourses: async (
    lat: number,
    lng: number,
    radius?: number
  ): Promise<CoursesResponse> => {
    const dist = Number.isFinite(radius) ? Math.max(0, Number(radius)) : 10;
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      dist: String(dist)
    });
    return api.get<CoursesResponse>(`/course?${params.toString()}`, {
      requiresAuth: false
    });
  }
};
