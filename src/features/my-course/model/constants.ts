export const MY_COURSE_QUERY_KEYS = {
  all: ['user', 'courses'] as const,
  summary: ['user', 'course-summary'] as const,
  gpx: ['user', 'courses-gpx'] as const
} as const;
