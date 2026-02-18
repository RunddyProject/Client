import { useUserCourses } from '@/features/my-course/hooks/useUserCourses';

/**
 * Check if the given course uuid belongs to the current user.
 * Uses `isPending` (not `isLoading`) so the guard blocks until data arrives.
 */
export function useIsOwnerCourse(uuid: string | undefined) {
  const { courses, isPending, isFetching, isError } = useUserCourses();

  const ownerMatch = !!uuid && (courses.some((c) => c.uuid === uuid) ?? false);

  // Block while: initial load OR uuid not found but refetch in progress (stale cache)
  const isChecking = isPending || (!ownerMatch && isFetching);
  const isOwner = !isChecking && !isError && ownerMatch;

  return { isOwner, isChecking, isError };
}
