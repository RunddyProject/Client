import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/app/providers/AuthContext';
import { CoursesApi } from '@/features/course/api/course.api';

import type {
  Course,
  CourseReviewFormResponse,
  CourseReviewPatchRequest
} from '@/features/course/model/types';

export function useCourseReviewForm(uuid: Course['uuid']) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const formQuery = useQuery<CourseReviewFormResponse, Error>({
    enabled: !!uuid && !!isAuthenticated,
    queryKey: ['course-review-form', uuid],
    queryFn: () => CoursesApi.getCourseReviewForm(uuid)
  });

  const mutation = useMutation({
    mutationFn: (body: CourseReviewPatchRequest) =>
      CoursesApi.patchCourseReview(uuid, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-review', uuid] });
      queryClient.invalidateQueries({ queryKey: ['course-review-form', uuid] });
    },
    onError: (error) => {
      console.error(error);
      toast.error('리뷰 저장 실패');
    }
  });

  return {
    form: formQuery.data,
    isLoading: formQuery.isLoading,
    isError: formQuery.isError,
    refetch: formQuery.refetch,
    patchReview: mutation.mutate
  };
}
