import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { MyCourseApi } from '@/features/my-course/api/my-course.api';
import { MY_COURSE_QUERY_KEYS } from '@/features/my-course/model/constants';

import type { CourseUpdateRequest } from '@/features/my-course/model/types';

export function useEditCourse() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: CourseUpdateRequest }) =>
      MyCourseApi.updateCourse(uuid, data),
    onSuccess: (_data, { uuid }) => {
      queryClient.invalidateQueries({
        queryKey: [...MY_COURSE_QUERY_KEYS.all]
      });
      queryClient.invalidateQueries({
        queryKey: [...MY_COURSE_QUERY_KEYS.summary]
      });
      queryClient.invalidateQueries({
        queryKey: [...MY_COURSE_QUERY_KEYS.gpx]
      });
      queryClient.invalidateQueries({ queryKey: ['course', uuid] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });

      toast.success('코스가 수정되었어요');
      navigate(`/my-courses/${uuid}`);
    },
    onError: () => {
      toast.error('코스 수정에 실패했어요');
    }
  });

  return {
    editCourse: mutation.mutate,
    editCourseAsync: mutation.mutateAsync,
    isEditing: mutation.isPending
  };
}
