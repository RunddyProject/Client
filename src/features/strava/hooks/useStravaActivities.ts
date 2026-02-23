import { useInfiniteQuery } from '@tanstack/react-query';

import { StravaApi } from '../api/strava.api';

const PER_PAGE = 30;

export function useStravaActivities() {
  return useInfiniteQuery({
    queryKey: ['strava', 'activities'],
    queryFn: ({ pageParam }) =>
      StravaApi.getActivities({ page: pageParam, perPage: PER_PAGE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = lastPage.activityList.length === PER_PAGE;
      return hasMore ? allPages.length + 1 : undefined;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false
  });
}
