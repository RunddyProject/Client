import { useQuery } from '@tanstack/react-query';

import { MyCourseApi } from '../api/my-course.api';

/**
 * Check if the given course uuid belongs to the current user.
 * Uses `isPending` (not `isLoading`) so the guard blocks until data arrives.
 */
export function useIsOwnerCourse(uuid: string | undefined) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['user-courses'],
    queryFn: MyCourseApi.getUserCourses,
    staleTime: 60_000,
    gcTime: 5 * 60_000
  });

  const isOwner =
    !isPending &&
    !isError &&
    !!uuid &&
    (data?.courseList.some((c) => c.uuid === uuid) ?? false);

  return { isOwner, isChecking: isPending, isError };
}
