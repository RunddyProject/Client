import {
  keepPreviousData,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';

import { CoursesApi } from '@/features/course/api/course.api';
import {
  DEFAULT_CENTER,
  DEFAULT_RADIUS
} from '@/features/course/model/constants';
import {
  type Course,
  type CourseSearchParams,
  type CoursesResponse,
  type UserLocation
} from '@/features/course/model/types';
import { useLocationStore } from '@/features/map/model/location.store';

export function useCourses({
  userLocation = DEFAULT_CENTER,
  radius = DEFAULT_RADIUS
}: {
  userLocation?: UserLocation | null;
  radius?: number;
} = {}) {
  const [params] = useSearchParams();

  const keyword = params.get('keyword') ?? undefined;
  const { setKeywordCenter } = useLocationStore();

  useEffect(() => {
    if (!keyword || keyword.trim() === '') {
      setKeywordCenter(null);
    }
  }, [keyword, setKeywordCenter]);

  const grades = params.getAll('grade').map(Number);
  const envTypes =
    (params.getAll('envType') as CourseSearchParams['envType']) || [];
  const shapeTypes =
    (params.getAll('shapeType') as CourseSearchParams['shapeType']) || [];

  const search: CourseSearchParams = {
    radius: radius ?? Number(params.get('radius')),
    grade: grades.length ? grades : undefined,
    envType: envTypes,
    shapeType: shapeTypes,
    minDist: params.get('minDist') ? Number(params.get('minDist')) : undefined,
    maxDist: params.get('maxDist') ? Number(params.get('maxDist')) : undefined,
    minEle: params.get('minEle') ? Number(params.get('minEle')) : undefined,
    maxEle: params.get('maxEle') ? Number(params.get('maxEle')) : undefined,
    keyword: params.get('keyword') ?? undefined
  };

  const lastGeocodedKeywordRef = useRef<string | null>(null);
  const geocodeCacheRef = useRef<Map<string, { lat: number; lng: number }>>(
    new Map()
  );

  const query = useQuery<Course[], Error>({
    queryKey: [
      'courses',
      userLocation?.lat,
      userLocation?.lng,
      search.radius,
      search.grade,
      search.envType,
      search.minDist,
      search.maxDist,
      search.minEle,
      search.maxEle,
      search.keyword
    ],
    queryFn: async () => {
      if (!userLocation) return [];

      // 1) Primary search: by user location + keyword (if any)
      const primaryResponse: CoursesResponse = await CoursesApi.getCourses(
        userLocation.lat,
        userLocation.lng,
        search
      );
      const primaryCourses = primaryResponse.courseList;

      if (primaryCourses.length > 0 || !search.keyword) return primaryCourses;

      // 2) If no results and keyword exists, try geocoding
      const normalizedKeyword = search.keyword.trim();
      if (!normalizedKeyword) return [];

      let resolvedCenter =
        geocodeCacheRef.current.get(normalizedKeyword) ?? null;

      if (
        !resolvedCenter &&
        lastGeocodedKeywordRef.current !== normalizedKeyword
      ) {
        lastGeocodedKeywordRef.current = normalizedKeyword;
        resolvedCenter = await geocode(normalizedKeyword);
        if (resolvedCenter)
          geocodeCacheRef.current.set(normalizedKeyword, resolvedCenter);
      }

      if (!resolvedCenter) {
        setKeywordCenter(null);
        return [];
      }

      setKeywordCenter(resolvedCenter);

      // 3) Secondary search: by geocoded location
      const secondaryResponse: CoursesResponse = await CoursesApi.getCourses(
        resolvedCenter.lat,
        resolvedCenter.lng,
        { ...search, keyword: undefined }
      );
      return secondaryResponse.courseList;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    enabled: !!userLocation,
    placeholderData: keepPreviousData
  });

  return {
    courses: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch
  };
}

async function geocode(
  keyword: string
): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!window.naver?.maps?.Service) {
      resolve(null);
      return;
    }
    window.naver.maps.Service.geocode(
      { query: keyword },
      (status, response) => {
        if (status !== window.naver.maps.Service.Status.OK) {
          resolve(null);
          return;
        }
        const addr = response?.v2?.addresses?.[0];
        if (!addr) {
          resolve(null);
          return;
        }
        resolve({ lat: parseFloat(addr.y), lng: parseFloat(addr.x) });
      }
    );
  });
}

export function usePrefetchCourses() {
  const qc = useQueryClient();
  return (userLocation: UserLocation, search?: CourseSearchParams) =>
    qc.prefetchQuery({
      queryKey: [
        'courses',
        userLocation?.lat,
        userLocation?.lng,
        search?.radius,
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
