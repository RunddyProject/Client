import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { CoursesApi } from '@/features/course/api/course.api';

import type { Course } from '@/features/course/model/types';

export function useDeleteCourseReview(uuid: Course['uuid']) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!uuid) throw new Error('코스 ID가 필요해요');
      return CoursesApi.deleteCourseReview(uuid);
    },
    onSuccess: async () => {
      toast.success('리뷰 삭제가 완료되었어요');

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['course-review', uuid] }),
        queryClient.invalidateQueries({
          queryKey: ['course-review-form', uuid]
        })
      ]);
    },
    onError: (error) => {
      console.error('Failed to delete course review:', error);
      toast.error('리뷰 삭제에 실패했어요');
    }
  });

  return {
    deleteReview: mutation.mutate,
    deleteReviewAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending
  };
}
