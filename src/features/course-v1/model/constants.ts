import type {
  CategoryCode,
  EnvType,
  EnvTypeName,
  GradeType,
  ShapeType,
  ShapeTypeName
} from '@/features/course-v1/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

export const DEFAULT_CENTER = {
  lat: 37.575959,
  lng: 126.97679
};

export const DEFAULT_RADIUS = 10;

export const DEFAULT_ZOOM = 12;

export const ENV_TYPE_TO_NAME: Record<EnvType, EnvTypeName> = {
  TRACK: '트랙',
  PARK: '공원',
  RIVER: '강',
  TRAIL: '산책로',
  URBAN: '도심',
  MOUNTAIN: '산',
  FOREST: '숲',
  BEACH: '해변'
  // ETC: '기타'
} as const;

export const ENV_NAME_TO_TYPE: Record<EnvTypeName, EnvType> = {
  트랙: 'TRACK',
  공원: 'PARK',
  강: 'RIVER',
  산책로: 'TRAIL',
  도심: 'URBAN',
  산: 'MOUNTAIN',
  숲: 'FOREST',
  해변: 'BEACH'
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

export const SHAPE_TYPE_COLOR: Record<ShapeType, RUNDDY_COLOR> = {
  LOOP: 'blue',
  LINEAR: 'green',
  OUT_AND_BACK: 'orange',
  ART: 'pink'
};

export const grades = [1, 2, 3];
export const GRADE_TO_NAME = {
  1: '초급',
  2: '중급',
  3: '고급'
} as const satisfies Record<GradeType, string>;

export const envTypeNames = Object.keys(ENV_NAME_TO_TYPE) as EnvTypeName[];
export const shapeTypeNames = Object.keys(
  SHAPE_NAME_TO_TYPE
) as ShapeTypeName[];

export const safeEnvTypeName = (t: EnvType | string): EnvTypeName =>
  (ENV_TYPE_TO_NAME as Record<string, EnvTypeName>)[t] ?? '기타';

export const safeShapeTypeName = (t: ShapeType | string): ShapeTypeName =>
  (SHAPE_TYPE_TO_NAME as Record<string, ShapeTypeName>)[t] ?? '기타';

export const CATEGORY_LABEL_MAP: Record<CategoryCode, string> = {
  COURSE_GOOD: '코스 자체가 좋아요',
  ENVIRONMENT_GOOD: '환경/분위기가 좋아요',
  FACILITY_GOOD: '편의성이 좋아요'
};

export const getCategoryLabel = (code: string) =>
  (CATEGORY_LABEL_MAP as Record<string, string>)[code] ?? code;

export const REVIEW_KEYWORD_META = {
  // 코스 자체가 좋아요
  UPHILL_TRAINING: {
    emoji: '⬆️',
    color: '#FF75341F',
    label: '업힐 훈련하기 좋아요'
  },
  GOOD_SURFACE: { emoji: '🏞️', color: '#04AEF11F', label: '노면이 좋아요' },
  BEGINNER_FRIENDLY: {
    emoji: '👟',
    color: '#2AC47E1F',
    label: '초보자도 달리기 좋아요'
  },
  POPULAR: { emoji: '👯‍♀️', color: '#FD7FCD1F', label: '달리는 사람이 많아요' },

  // 환경/분위기가 좋아요
  SCENIC: { emoji: '🏞️', color: '#04AEF11F', label: '풍경이 좋아요' },
  SUNSET_VIEW: {
    emoji: '🌇',
    color: '#FD7FCD1F',
    label: '해질녘에 달리기 좋아요'
  },
  SHADED: { emoji: '🌳', color: '#2AC47E1F', label: '그늘이 있어요' },
  WELL_LIT: { emoji: '🌠', color: '#04AEF11F', label: '밤에도 밝아요' },
  QUIET_PEACEFUL: {
    emoji: '🕊️',
    color: '#FD7FCD1F',
    label: '조용하고 평화로워요'
  },

  // 편의성이 좋아요
  HAS_RESTROOM: { emoji: '🚻', color: '#FD7FCD1F', label: '화장실이 가까워요' },
  HAS_WATER: { emoji: '💧', color: '#04AEF11F', label: '급수대가 있어요' },
  EASY_PARKING: { emoji: '🅿️', color: '#04AEF11F', label: '주차가 편해요' },
  ACCESSIBLE: { emoji: '🚌', color: '#FF75341F', label: '접근성이 좋아요' },
  NEARBY_AMENITIES: {
    emoji: '🏪',
    color: '#2AC47E1F',
    label: '편의시설이 많아요'
  }
} as const;

export const getKeywordMeta = (code: string) =>
  (
    REVIEW_KEYWORD_META as Record<
      string,
      (typeof REVIEW_KEYWORD_META)[keyof typeof REVIEW_KEYWORD_META]
    >
  )[code] ?? { emoji: '', color: '#FFFFFF', label: code };
