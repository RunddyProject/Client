import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { CoursesApi } from '@/features/course-v1/api/course.api';
import {
  type Course,
  type CoursePoint,
  type CoursePointResponse
} from '@/features/course-v1/model/types';

export function useCoursePoint(uuid: Course['uuid']) {
  const query = useQuery<CoursePoint[], Error>({
    enabled: !!uuid,
    queryKey: ['course-point', uuid],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    queryFn: async () => {
      if (!uuid) return [];
      const res: CoursePointResponse = await CoursesApi.getCoursePoint(uuid);
      return res.coursePointList;
    }
  });

  // Memoize to prevent new array reference when data is undefined
  const coursePointList = useMemo(() => query.data ?? [], [query.data]);

  return {
    coursePointList,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch
  };
}
