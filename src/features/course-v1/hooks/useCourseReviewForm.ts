import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/app/providers/AuthContext';
import { CoursesApi } from '@/features/course-v1/api/course.api';
import {
  toDisplayForm,
  toPatchBodyFromDisplayForm
} from '@/features/course-v1/lib/reviewTransformers';

import type {
  Course,
  CourseReviewFormResponse,
  CourseReviewPatchRequest,
  DisplayFormCategory
} from '@/features/course-v1/model/types';

export function useCourseReviewForm(uuid: Course['uuid']) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const formQuery = useQuery<CourseReviewFormResponse, Error>({
    enabled: !!uuid && !!isAuthenticated,
    queryKey: ['course-review-form', uuid],
    queryFn: () => CoursesApi.getCourseReviewForm(uuid)
  });

  const mutation = useMutation({
    mutationFn: async (categories: DisplayFormCategory[]) => {
      const payload: CourseReviewPatchRequest =
        toPatchBodyFromDisplayForm(categories);
      return CoursesApi.patchCourseReview(uuid, payload);
    },
    onSuccess: async () => {
      toast.success(
        display?.hasMyReview
          ? '리뷰 수정이 완료되었어요'
          : '리뷰 작성이 완료되었어요'
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['course-review', uuid] }),
        queryClient.invalidateQueries({
          queryKey: ['course-review-form', uuid]
        })
      ]);
    },
    onError: (error) => {
      console.error('Failed to save review:', error);
      toast.error(
        display?.hasMyReview
          ? '리뷰가 수정되지 않았어요'
          : '리뷰가 작성되지 않았어요'
      );
    }
  });

  const display = useMemo(
    () => (formQuery.data ? toDisplayForm(formQuery.data) : undefined),
    [formQuery.data]
  );

  return {
    hasMyReview: display?.hasMyReview ?? false,
    formDetail: display?.categories ?? [],
    patchReview: mutation.mutate,
    patchReviewAsync: mutation.mutateAsync,
    isLoading: formQuery.isLoading,
    isError: formQuery.isError
  };
}
