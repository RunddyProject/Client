import { useQuery } from '@tanstack/react-query';

import { MyCourseApi } from '../api/my-course.api';

export function useUserCourseSummary() {
  return useQuery({
    queryKey: ['user-courses', 'summary'],
    queryFn: MyCourseApi.getUserCourseSummary,
    staleTime: 60_000,
    gcTime: 5 * 60_000
  });
}
