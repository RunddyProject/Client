import type { EnvType, EnvTypeName, ShapeType, ShapeTypeName } from '@/features/course/model/types';

export const ENV_TYPE_OPTIONS: { value: EnvType; label: EnvTypeName }[] = [
  { value: 'TRACK', label: '트랙' },
  { value: 'PARK', label: '공원' },
  { value: 'FOREST', label: '숲' },
  { value: 'TRAIL', label: '산책로' },
  { value: 'URBAN', label: '도심' },
  { value: 'MOUNTAIN', label: '산' },
  { value: 'BEACH', label: '해변' }
];

export const SHAPE_TYPE_OPTIONS: { value: ShapeType; label: ShapeTypeName }[] = [
  { value: 'LOOP', label: '순환' },
  { value: 'LINEAR', label: '직선' },
  { value: 'OUT_AND_BACK', label: '왕복' },
  { value: 'ART', label: '아트' }
];

export const UPLOAD_METHOD_LABELS = {
  direct: '직접 업로드하기',
  strava: 'Strava에서 가져오기'
} as const;
