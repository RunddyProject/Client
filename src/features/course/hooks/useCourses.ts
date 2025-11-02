import {
  keepPreviousData,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';

import { CoursesApi } from '@/features/course/api/course.api';
import { DEFAULT_CENTER } from '@/features/course/model/contants';
import {
  type Course,
  type CourseSearchParams,
  type CoursesResponse,
  type UserLocation
} from '@/features/course/model/types';

export function useCourses({
  userLocation = DEFAULT_CENTER
}: { userLocation?: UserLocation | null } = {}) {
  const [params] = useSearchParams();

  const grades = params.getAll('grade').map((g) => Number(g));
  const envTypes = params.getAll('envType');

  const search: CourseSearchParams = {
    dist: params.get('dist') ? Number(params.get('dist')) : undefined,
    grade: grades.length ? grades : undefined,
    envType: envTypes.length ? envTypes : undefined,
    minDist: params.get('minDist') ? Number(params.get('minDist')) : undefined,
    maxDist: params.get('maxDist') ? Number(params.get('maxDist')) : undefined,
    minEle: params.get('minEle') ? Number(params.get('minEle')) : undefined,
    maxEle: params.get('maxEle') ? Number(params.get('maxEle')) : undefined,
    keyword: params.get('keyword') ?? undefined
  };

  const query = useQuery<Course[], Error>({
    queryKey: [
      'courses',
      userLocation?.lat,
      userLocation?.lng,
      search.dist,
      search.grade,
      search.envType,
      search.minDist,
      search.maxDist,
      search.minEle,
      search.maxEle,
      search.keyword
    ],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!userLocation) return [];
      const res: CoursesResponse = await CoursesApi.getCourses(
        userLocation.lat,
        userLocation.lng,
        search
      );
      return res.courseList;
    }
  });

  useEffect(() => {
    if (query.isError) {
      toast.error('코스 불러오기 실패');
      console.error('Failed to fetch courses:', query.error);
    }
  }, [query.isError, query.errorUpdatedAt, query.error]);

  return {
    courses: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch
  };
}

export function usePrefetchCourses() {
  const qc = useQueryClient();
  return (userLocation: UserLocation, search?: CourseSearchParams) =>
    qc.prefetchQuery({
      queryKey: [
        'courses',
        userLocation?.lat,
        userLocation?.lng,
        search?.dist,
        search?.grade,
        search?.envType,
        search?.minDist,
        search?.maxDist,
        search?.minEle,
        search?.maxEle,
        search?.keyword
      ],
      queryFn: () =>
        CoursesApi.getCourses(userLocation.lat, userLocation.lng, search).then(
          (r: CoursesResponse) => r.courseList
        ),
      staleTime: 60_000
    });
}
