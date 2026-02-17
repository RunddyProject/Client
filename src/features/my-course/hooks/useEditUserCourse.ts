import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { MyCourseApi } from '../api/my-course.api';

import type { EditUserCourseRequest } from '../model/types';

export function useEditUserCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: EditUserCourseRequest }) =>
      MyCourseApi.editUserCourse(uuid, data),
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
      queryClient.invalidateQueries({ queryKey: ['user-courses', 'gpx'] });
      queryClient.invalidateQueries({ queryKey: ['course', uuid] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: () => {
      toast.error('코스 수정에 실패했어요');
    }
  });
}
