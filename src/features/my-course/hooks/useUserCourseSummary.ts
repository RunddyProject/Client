import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/app/providers/AuthContext';
import { MyCourseApi } from '@/features/my-course/api/my-course.api';
import { MY_COURSE_QUERY_KEYS } from '@/features/my-course/model/constants';

import type { UserCourseSummaryResponse } from '@/features/my-course/model/types';

export function useUserCourseSummary() {
  const { isAuthenticated } = useAuth();

  const query = useQuery<UserCourseSummaryResponse, Error>({
    enabled: !!isAuthenticated,
    queryKey: [...MY_COURSE_QUERY_KEYS.summary],
    queryFn: () => MyCourseApi.getUserCourseSummary(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1
  });

  return {
    myCourseCount: query.data?.myCourseCount ?? 0,
    myTotalDistance: query.data?.myTotalDistance ?? 0,
    isLoading: query.isLoading
  };
}
