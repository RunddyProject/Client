import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { MyCourseApi } from '@/features/my-course/api/my-course.api';
import { MY_COURSE_QUERY_KEYS } from '@/features/my-course/model/constants';

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (uuid: string) => MyCourseApi.deleteCourse(uuid),
    onSuccess: (_data, uuid) => {
      queryClient.invalidateQueries({
        queryKey: [...MY_COURSE_QUERY_KEYS.all]
      });
      queryClient.invalidateQueries({
        queryKey: [...MY_COURSE_QUERY_KEYS.summary]
      });
      queryClient.invalidateQueries({
        queryKey: [...MY_COURSE_QUERY_KEYS.gpx]
      });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.removeQueries({ queryKey: ['course', uuid] });

      toast.success('코스가 삭제되었어요');
      navigate('/my-courses', { replace: true });
    },
    onError: () => {
      toast.error('코스 삭제에 실패했어요');
    }
  });

  return {
    deleteCourse: mutation.mutate,
    isDeleting: mutation.isPending
  };
}
