import { useQuery } from '@tanstack/react-query';

import { CoursesApi } from '@/features/course/api/course.api';
import { useLocationStore } from '@/features/map/model/location.store';

import type { CourseFilterPayload } from '@/features/course/model/types';

export function useCourseCount(
  filters: CourseFilterPayload,
  enabled: boolean = true
) {
  const { lastSearchedCenter, lastSearchedRadius } = useLocationStore();
  const payload = {
    lat: String(lastSearchedCenter?.lat),
    lng: String(lastSearchedCenter?.lng),
    radius: lastSearchedRadius,
    ...filters
  };
  const query = useQuery({
    queryKey: ['courseCount', payload],
    queryFn: async () => {
      const { count } = await CoursesApi.getFilteredCourseCount(payload);
      return count;
    },
    enabled: enabled && !!filters,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: (prev) => prev ?? 0
  });

  return {
    count: query.data ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch
  };
}
