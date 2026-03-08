export const CourseCategory = {
  RUNDDY: 'runddy',
  MARATHON: 'marathon',
  USER: 'user'
} as const;

export type CourseCategoryType =
  (typeof CourseCategory)[keyof typeof CourseCategory];

export const CATEGORY_LABELS: Record<CourseCategoryType, string> = {
  runddy: '런디코스',
  marathon: '마라톤',
  user: '유저코스'
};

export const isMarathonCategory = (category?: string): boolean =>
  category === CourseCategory.MARATHON;

export const isUserCategory = (category?: string): boolean =>
  category === CourseCategory.USER;

export const DEFAULT_CATEGORY = CourseCategory.RUNDDY;
