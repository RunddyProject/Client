import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { CoursesApi } from '@/features/course/api/course.api';

import type {
  Course,
  CourseReviewResponse
} from '@/features/course/model/types';

export function useCourseReview(uuid: Course['uuid']) {
  const query = useQuery<CourseReviewResponse, Error>({
    enabled: !!uuid,
    queryKey: ['course-review', uuid],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    queryFn: async () => {
      if (!uuid) throw new Error('uuid required');
      return CoursesApi.getCourseReview(uuid);
    }
  });

  useEffect(() => {
    if (query.isError) {
      toast.error('코스 리뷰 불러오기 실패');
      console.error('Failed to fetch course review:', query.error);
    }
  }, [query.isError, query.errorUpdatedAt, query.error]);

  return {
    courseReviewCount: query.data?.courseReviewDetail?.length ?? 0,
    courseReviewSummary: query.data?.courseReviewSummary ?? [],
    courseReviewDetail: query.data?.courseReviewDetail ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch
  };
}
