import { useQuery } from '@tanstack/react-query';

import { MyCourseApi } from '../api/my-course.api';

/**
 * Check if the given course uuid belongs to the current user.
 *
 * Guards against stale cache: when invalidated data doesn't contain the uuid
 * but a background refetch is in progress, we keep `isChecking = true` until
 * fresh data arrives instead of prematurely redirecting.
 */
export function useIsOwnerCourse(uuid: string | undefined) {
  const { data, isPending, isFetching, isError } = useQuery({
    queryKey: ['user-courses'],
    queryFn: MyCourseApi.getUserCourses,
    staleTime: 60_000,
    gcTime: 5 * 60_000
  });

  const ownerMatch =
    !!uuid && (data?.courseList.some((c) => c.uuid === uuid) ?? false);

  // Block while: initial load OR uuid not found but refetch in progress (stale cache)
  const isChecking = isPending || (!ownerMatch && isFetching);
  const isOwner = !isChecking && !isError && ownerMatch;

  return { isOwner, isChecking, isError };
}
