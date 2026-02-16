import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/app/providers/AuthContext';
import { MyCourseApi } from '@/features/my-course/api/my-course.api';
import { MY_COURSE_QUERY_KEYS } from '@/features/my-course/model/constants';

import type { UserCourseGpxResponse } from '@/features/my-course/model/types';

export function useUserCourseGpx(enabled: boolean) {
  const { isAuthenticated } = useAuth();

  const query = useQuery<UserCourseGpxResponse, Error>({
    enabled: !!isAuthenticated && enabled,
    queryKey: [...MY_COURSE_QUERY_KEYS.gpx],
    queryFn: () => MyCourseApi.getUserCourseGpx(),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: 1
  });

  return {
    gpxList: query.data?.userCourseGpxList ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching
  };
}
