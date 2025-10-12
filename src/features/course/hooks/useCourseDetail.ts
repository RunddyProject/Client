import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { CoursesApi } from '@/features/course/api/course.api';
import { type Course, type CourseDetail } from '@/features/course/model/types';

export function useCourseDetail(uuid: Course['uuid']) {
  const query = useQuery<CourseDetail | null, Error>({
    enabled: !!uuid,
    queryKey: ['course', uuid],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    queryFn: async () => {
      if (!uuid) return null;
      const res: CourseDetail = await CoursesApi.getCourseDetail(uuid);
      return res;
    }
  });

  useEffect(() => {
    if (query.isError) {
      toast.error('코스 포인트 불러오기 실패');
      console.error('Failed to fetch course detail:', query.error);
    }
  }, [query.isError, query.errorUpdatedAt, query.error]);

  return {
    courseDetail: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch
  };
}
