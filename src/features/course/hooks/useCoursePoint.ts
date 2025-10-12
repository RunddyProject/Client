import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { CoursesApi } from '@/features/course/api/course.api';
import {
  type Course,
  type CoursePoint,
  type CoursePointResponse
} from '@/features/course/model/types';

export function useCoursePoint(uuid: Course['uuid']) {
  const query = useQuery<CoursePoint[], Error>({
    enabled: !!uuid,
    queryKey: ['course-point', uuid],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    queryFn: async () => {
      if (!uuid) return [];
      const res: CoursePointResponse = await CoursesApi.getCoursePoint(uuid);
      return res.coursePointList;
    }
  });

  useEffect(() => {
    if (query.isError) {
      toast.error('코스 포인트 불러오기 실패');
      console.error('Failed to fetch course point:', query.error);
    }
  }, [query.isError, query.errorUpdatedAt, query.error]);

  return {
    coursePointList: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch
  };
}
