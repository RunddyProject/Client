export const CourseCategory = {
  RUNDDY: 'runddy',
  MARATHON: 'marathon'
} as const;

export type CourseCategoryType =
  (typeof CourseCategory)[keyof typeof CourseCategory];

export const CATEGORY_LABELS: Record<CourseCategoryType, string> = {
  runddy: '런디코스',
  marathon: '마라톤'
};

export const isMarathonCategory = (category?: string): boolean =>
  category === CourseCategory.MARATHON;

export const DEFAULT_CATEGORY = CourseCategory.RUNDDY;
