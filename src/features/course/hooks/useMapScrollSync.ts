/**
 * useMapScrollSync - Map-Scroll bidirectional synchronization hook
 *
 * This hook extracts the complex scroll synchronization logic from Map.tsx
 * to separate concerns and improve maintainability.
 *
 * Features:
 * - Map marker click → scroll card to center
 * - User scroll → update active course
 * - Course list change → auto-scroll to appropriate course
 * - Distinguish programmatic scroll from user scroll
 */

import { useCallback, useEffect, useRef } from 'react';

import type {
  MapScrollSyncOptions,
  ScrollSyncActions,
  ScrollSyncState
} from '@/features/course/model/refactor-types';

/**
 * Hook return type combining state and actions
 */
export type UseMapScrollSyncReturn = ScrollSyncState & ScrollSyncActions;

/**
 * Extended options including setActiveCourseId for complete synchronization
 */
export interface MapScrollSyncOptionsExtended extends MapScrollSyncOptions {
  setActiveCourseId: (id: string | null) => void;
}

/**
 * useMapScrollSync - Map-Scroll bidirectional synchronization hook
 *
 * Handles:
 * 1. Marker click → scroll to course card
 * 2. User scroll → update active course ID
 * 3. Course list change → auto-scroll adjustment
 *
 * @param options - Scroll sync options including refs and callbacks
 * @returns Scroll sync state and action handlers
 *
 * @example
 * ```ts
 * const {
 *   triggerScrollToCourse,
 *   handleUserScroll,
 *   isProgrammaticScroll
 * } = useMapScrollSync({
 *   scrollerRef,
 *   courses,
 *   activeCourseId,
 *   scrollToCenter,
 *   onScrollChange,
 *   setActiveCourseId
 * });
 *
 * // On marker click
 * triggerScrollToCourse('course-uuid');
 *
 * // On user scroll (from useCenteredActiveByScroll)
 * handleUserScroll('course-uuid');
 * ```
 */
export function useMapScrollSync(
  options: MapScrollSyncOptionsExtended
): UseMapScrollSyncReturn {
  const {
    courses,
    activeCourseId,
    scrollToCenter,
    onScrollChange,
    setActiveCourseId
  } = options;

  // Internal refs for tracking scroll state
  const isProgrammaticScrollRef = useRef(false);
  const hasScrolledToActiveRef = useRef(false);
  const previousFirstCourseIdRef = useRef<string | null>(null);

  /**
   * Trigger programmatic scroll to a course card
   * Used when marker is clicked on the map
   */
  const triggerScrollToCourse = useCallback(
    (courseId: string) => {
      setActiveCourseId(courseId);
      isProgrammaticScrollRef.current = true;

      requestAnimationFrame(() => {
        scrollToCenter(courseId);
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 500);
      });
    },
    [setActiveCourseId, scrollToCenter]
  );

  /**
   * Handle user-initiated scroll
   * Only updates active course if scroll was not programmatic
   */
  const handleUserScroll = useCallback(
    (courseId: string) => {
      if (isProgrammaticScrollRef.current) {
        return;
      }
      onScrollChange(courseId);
    },
    [onScrollChange]
  );

  /**
   * Reset scroll state (for external control)
   */
  const resetScrollState = useCallback(() => {
    isProgrammaticScrollRef.current = false;
    hasScrolledToActiveRef.current = false;
    previousFirstCourseIdRef.current = null;
  }, []);

  /**
   * Effect: Handle course list changes and synchronize scroll position
   *
   * This effect handles three scenarios:
   * 1. Course list changed (first course is different) → scroll to first course
   * 2. Active course exists in list but not scrolled yet → scroll to active
   * 3. Active course not in list → reset to first course
   */
  useEffect(() => {
    // Empty list: reset state
    if (courses.length === 0) {
      setActiveCourseId(null);
      previousFirstCourseIdRef.current = null;
      return;
    }

    const currentFirstCourseId = courses[0]?.uuid;

    // Scenario 1: Course list changed (search area changed)
    const coursesChanged =
      previousFirstCourseIdRef.current !== null &&
      previousFirstCourseIdRef.current !== currentFirstCourseId;

    if (coursesChanged) {
      previousFirstCourseIdRef.current = currentFirstCourseId;
      const newId = courses[0].uuid;
      setActiveCourseId(newId);
      hasScrolledToActiveRef.current = false;
      isProgrammaticScrollRef.current = true;

      // Double requestAnimationFrame for layout stabilization
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToCenter(newId);
          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
            hasScrolledToActiveRef.current = true;
          }, 500);
        });
      });
      return;
    }

    // Scenario 2: Active course exists but not scrolled yet
    if (activeCourseId && courses.find((c) => c.uuid === activeCourseId)) {
      if (!hasScrolledToActiveRef.current) {
        hasScrolledToActiveRef.current = true;
        isProgrammaticScrollRef.current = true;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToCenter(activeCourseId);
            setTimeout(() => {
              isProgrammaticScrollRef.current = false;
            }, 500);
          });
        });
      }

      // Initialize previousFirstCourseId if null
      if (previousFirstCourseIdRef.current === null) {
        previousFirstCourseIdRef.current = currentFirstCourseId;
      }
      return;
    }

    // Scenario 3: Active course not in list (removed or never set)
    if (!activeCourseId || !courses.find((c) => c.uuid === activeCourseId)) {
      previousFirstCourseIdRef.current = currentFirstCourseId;
      const newId = courses[0].uuid;
      setActiveCourseId(newId);
      hasScrolledToActiveRef.current = true;
      isProgrammaticScrollRef.current = true;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToCenter(newId);
          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 500);
        });
      });
    }
  }, [courses, activeCourseId, scrollToCenter, setActiveCourseId]);

  return {
    // State (read-only snapshots)
    isProgrammaticScroll: isProgrammaticScrollRef.current,
    hasScrolledToActive: hasScrolledToActiveRef.current,
    previousFirstCourseId: previousFirstCourseIdRef.current,

    // Actions
    triggerScrollToCourse,
    handleUserScroll,
    resetScrollState
  };
}

export default useMapScrollSync;
