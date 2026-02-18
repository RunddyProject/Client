import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { MyCourseApi } from '../api/my-course.api';

export function useUserCourses() {
  const query = useQuery({
    queryKey: ['user-courses'],
    queryFn: MyCourseApi.getUserCourses,
    staleTime: 60_000,
    gcTime: 5 * 60_000
  });

  const courses = useMemo(() => query.data?.courseList ?? [], [query.data]);

  return {
    courses,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError
  };
}
