import { useQuery } from '@tanstack/react-query';

import { CoursesApi } from '@/features/course-v1/api/course.api';
import {
  type Course,
  type CourseDetail
} from '@/features/course-v1/model/types';

export function useCourseDetail(uuid: Course['uuid']) {
  const query = useQuery<CourseDetail | null, Error>({
    enabled: !!uuid,
    queryKey: ['course', uuid],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    queryFn: async () => {
      if (!uuid) return null;
      const res: CourseDetail = await CoursesApi.getCourseDetail(uuid);
      return res;
    }
  });

  return {
    courseDetail: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch
  };
}
