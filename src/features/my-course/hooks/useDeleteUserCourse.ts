import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { MyCourseApi } from '../api/my-course.api';

export function useDeleteUserCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => MyCourseApi.deleteUserCourse(uuid),
    onSuccess: (_, uuid) => {
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.removeQueries({ queryKey: ['course', uuid] });
      toast.success('등록한 코스를 삭제했어요');
    },
    onError: () => {
      toast.error('코스가 삭제되지 않았어요');
    }
  });
}
