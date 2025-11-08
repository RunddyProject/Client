import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/app/providers/AuthContext';
import { CoursesApi } from '@/features/course/api/course.api';

import type { BookmarksResponse } from '@/features/course/model/types';

export function useBookmarks() {
  const { isAuthenticated } = useAuth();

  const query = useQuery<BookmarksResponse, Error>({
    enabled: !!isAuthenticated,
    queryKey: ['bookmarks'],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    queryFn: () => CoursesApi.getBookmarks()
  });

  if (query.isError) {
    toast.error('북마크를 불러오지 못했어요');
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
