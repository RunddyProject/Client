import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/app/providers/AuthContext';
import { UserApi } from '@/features/user/api/user.api';

import type { UserReviewsResponse } from '@/features/user/model/types';

export function useUserReviews() {
  const { isAuthenticated } = useAuth();

  const query = useQuery<UserReviewsResponse, Error>({
    enabled: !!isAuthenticated,
    queryKey: ['reviews'],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    queryFn: () => UserApi.getUserReviews()
  });

  if (query.isError) {
    console.error(query.error);
  }

  return {
    courseList: query.data?.courseList ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch
  };
}
