import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/app/providers/AuthContext';
import { MyCourseApi } from '@/features/my-course/api/my-course.api';
import { MY_COURSE_QUERY_KEYS } from '@/features/my-course/model/constants';

import type { UserCoursesResponse } from '@/features/my-course/model/types';

export function useUserCourses() {
  const { isAuthenticated } = useAuth();

  const query = useQuery<UserCoursesResponse, Error>({
    enabled: !!isAuthenticated,
    queryKey: [...MY_COURSE_QUERY_KEYS.all],
    queryFn: () => MyCourseApi.getUserCourses(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1
  });

  return {
    courseList: query.data?.courseList ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError
  };
}
