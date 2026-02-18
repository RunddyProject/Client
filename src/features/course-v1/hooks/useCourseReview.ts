import { useQuery } from '@tanstack/react-query';

import { CoursesApi } from '@/features/course-v1/api/course.api';
import { toDisplaySummary } from '@/features/course-v1/lib/reviewTransformers';

import type {
  Course,
  CourseReviewResponse
} from '@/features/course-v1/model/types';

export function useCourseReview(uuid: Course['uuid']) {
  const query = useQuery<CourseReviewResponse, Error>({
    enabled: !!uuid,
    queryKey: ['course-review', uuid],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    queryFn: () => CoursesApi.getCourseReview(uuid)
  });

  const display = query.data ? toDisplaySummary(query.data) : undefined;

  return {
    courseReviewCount: query.data?.courseReviewDetail?.length ?? 0,
    courseReviewSummary: display?.summary ?? [],
    courseReviewDetail: display?.detail ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch
  };
}
