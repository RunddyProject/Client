import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/app/providers/AuthContext';
import { UserApi } from '@/features/user/api/user.api';

import type { UserBookmarksResponse } from '@/features/user/model/types';

export function useUserBookmarks() {
  const { isAuthenticated } = useAuth();

  const query = useQuery<UserBookmarksResponse, Error>({
    enabled: !!isAuthenticated,
    queryKey: ['bookmarks'],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    queryFn: () => UserApi.getUserBookmarks()
  });

  if (query.isError) {
    console.error(query.error);
  }

  return {
    bookmarkList: query.data?.bookmarkList ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch
  };
}
