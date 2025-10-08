import type {
  EnvType,
  EnvTypeName,
  ShapeType,
  ShapeTypeName
} from '@/features/course/model/types';

export const DEFAULT_CENTER = {
  lat: 37.575959,
  lng: 126.97679
};

export const ENV_TYPE_TO_NAME: Record<EnvType, EnvTypeName> = {
  PARK: '공원',
  TRAIL: '산책로',
  TRACK: '트랙',
  URBAN: '도심',
  BEACH: '해변',
  MOUNTAIN: '산',
  FOREST: '숲'
  // ETC: '기타'
} as const;

export const ENV_NAME_TO_TYPE: Record<EnvTypeName, EnvType> = {
  공원: 'PARK',
  산책로: 'TRAIL',
  트랙: 'TRACK',
  도심: 'URBAN',
  해변: 'BEACH',
  산: 'MOUNTAIN',
  숲: 'FOREST'
  // 기타: 'ETC'
} as const;

export const SHAPE_TYPE_TO_NAME: Record<ShapeType, ShapeTypeName> = {
  LOOP: '순환',
  LINEAR: '직선',
  OUT_AND_BACK: '왕복',
  ART: '아트'
  // ETC: '기타'
} as const;

export const SHAPE_NAME_TO_TYPE: Record<ShapeTypeName, ShapeType> = {
  순환: 'LOOP',
  직선: 'LINEAR',
  왕복: 'OUT_AND_BACK',
  아트: 'ART'
  // 기타: 'ETC'
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
