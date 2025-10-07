import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';

import {
  CoursesApi,
  type Course,
  type CoursesResponse
} from '@/lib/api/course.api';

type UserLocation = { lat: number; lng: number };

const DEFAULT_CENTER = {
  lat: 37.575959,
  lng: 126.97679
};

export function useCourses(userLocation: UserLocation | null = DEFAULT_CENTER) {
  const query = useQuery<Course[], Error>({
    queryKey: ['courses', userLocation?.lat, userLocation?.lng],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    queryFn: async () => {
      if (!userLocation) return [];
      const res: CoursesResponse = await CoursesApi.getCourses(
        userLocation.lat,
        userLocation.lng
      );
      // TEST
      return res.courseList;
    }
  });

  useEffect(() => {
    if (query.isError) {
      toast.error('코스 불러오기 실패');
      console.error('Failed to fetch courses:', query.error);
    }
  }, [query.isError, query.errorUpdatedAt]);

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
  return (loc: UserLocation) =>
    qc.prefetchQuery({
      queryKey: ['courses', loc.lat, loc.lng],
      queryFn: () =>
        CoursesApi.getCourses(loc.lat, loc.lng).then(
          (r: CoursesResponse) => r.courseList
        ),
      staleTime: 60_000
    });
}
