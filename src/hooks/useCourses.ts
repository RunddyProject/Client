import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  CoursesApi,
  type Course,
  type CourseCategory,
  type CourseLevel,
  type CoursesResponse,
  type CourseType,
} from '@/lib/api/course.api';

type UserLocation = { lat: number; lng: number };

const LEVELS: readonly CourseLevel[] = [1, 2, 3];
const CATEGORIES: readonly CourseCategory[] = ['공원', '산책로', '트랙', '도심', '해변', '산', '숲', '기타'];
const TYPES: readonly CourseType[] = ['LOOP', 'OUT_AND_BACK', 'LINEAR', 'ART', 'ETC'];
const DISTANCES: readonly number[] = [3000, 5000, 20000];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomCourseInfo() {
  const level = pick(LEVELS);
  const category = pick(CATEGORIES);
  const courseType = pick(TYPES);
  const distance = pick(DISTANCES);
  return { level, category, courseType, distance };
}

const DEFAULT_CENTER = {
  lat: 37.575959,
  lng: 126.97679,
};

export function useCourses(userLocation: UserLocation | null = DEFAULT_CENTER) {
  const query = useQuery<Course[], Error>({
    queryKey: ['courses', userLocation?.lat, userLocation?.lng],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    queryFn: async () => {
      if (!userLocation) return [];
      const res: CoursesResponse = await CoursesApi.getCourses(userLocation.lat, userLocation.lng);
      // TEST
      return res.courseList.map((c) => ({ ...c, ...randomCourseInfo() }));
      // return res.courseList
    },
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
    refetch: query.refetch,
  };
}

export function usePrefetchCourses() {
  const qc = useQueryClient();
  return (loc: UserLocation) =>
    qc.prefetchQuery({
      queryKey: ['courses', loc.lat, loc.lng],
      queryFn: () =>
        CoursesApi.getCourses(loc.lat, loc.lng).then((r: CoursesResponse) =>
          r.courseList.map((c) => ({ ...c, ...randomCourseInfo() }))
        ),
      staleTime: 60_000,
    });
}
