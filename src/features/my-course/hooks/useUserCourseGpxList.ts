import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { MyCourseApi } from '../api/my-course.api';

export function useUserCourseGpxList(enabled: boolean = true) {
  const query = useQuery({
    queryKey: ['user-courses', 'gpx'],
    queryFn: MyCourseApi.getUserCourseGpxList,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    enabled
  });

  const gpxList = useMemo(
    () => query.data?.userCourseGpxList ?? [],
    [query.data]
  );

  return { gpxList, isLoading: query.isLoading };
}
