/**
 * useMapScrollSync - Map-Scroll bidirectional synchronization hook
 *
 * Handles the complex synchronization between map markers and course cards:
 * - Map marker click → scroll card to center
 * - User scroll → update active course
 * - Course list change → auto-scroll to appropriate course
 * - Distinguishes programmatic scroll from user scroll (loop prevention)
 */

import { useCallback, useEffect, useRef } from 'react';

import type { Course } from '@/features/course-v1/model/types';

/**
 * Options for the scroll sync hook
 */
export interface UseMapScrollSyncOptions {
  /** Current course list */
  courses: Course[];
  /** Currently active course ID */
  activeCourseId: string | null;
  /** Function to scroll a course card to center */
  scrollToCenter: (id: string) => void;
  /** Callback when active course should change */
  setActiveCourseId: (id: string | null) => void;
}

/**
 * Return type for the scroll sync hook
 */
export interface UseMapScrollSyncReturn {
  /**
   * Trigger programmatic scroll to a course card.
   * Used when marker is clicked on the map.
   */
  triggerScrollToCourse: (courseId: string) => void;

  /**
   * Handle user-initiated scroll.
   * Only updates active course if scroll was not programmatic.
   */
  handleUserScroll: (courseId: string) => void;

  /**
   * Check if current scroll is programmatic (for external use)
   */
  isProgrammaticScroll: () => boolean;
}

/**
 * useMapScrollSync - Bidirectional map-scroll synchronization
 *
 * This hook manages the complex state required to synchronize:
 * 1. Map marker clicks with card scrolling
 * 2. User scrolling with active course updates
 * 3. Course list changes with automatic scroll adjustments
 *
 * The key challenge is preventing infinite loops when programmatic
 * scrolling triggers scroll events that would normally update state.
 *
 * @param options - Configuration options
 * @returns Scroll sync actions and state checkers
 *
 * @example
 * ```ts
 * const { triggerScrollToCourse, handleUserScroll } = useMapScrollSync({
 *   courses,
 *   activeCourseId,
 *   scrollToCenter,
 *   setActiveCourseId
 * });
 *
 * // On marker click
 * const handleMarkerClick = (uuid: string) => {
 *   triggerScrollToCourse(uuid);
 * };
 *
 * // On user scroll (from useCenteredActiveByScroll)
 * useCenteredActiveByScroll({
 *   container: scrollerRef,
 *   itemAttr: 'uuid',
 *   onChange: handleUserScroll
 * });
 * ```
 */
export function useMapScrollSync(
  options: UseMapScrollSyncOptions
): UseMapScrollSyncReturn {
  const { courses, activeCourseId, scrollToCenter, setActiveCourseId } =
    options;

  // Internal refs for tracking scroll state
  // Using refs instead of state to avoid re-renders and race conditions
  const isProgrammaticScrollRef = useRef(false);
  const hasScrolledToActiveRef = useRef(false);
  const previousFirstCourseIdRef = useRef<string | null>(null);

  /**
   * Trigger programmatic scroll to a course card.
   * Sets flag to prevent handleUserScroll from firing during animation.
   */
  const triggerScrollToCourse = useCallback(
    (courseId: string) => {
      // Update active course first
      setActiveCourseId(courseId);

      // Mark as programmatic scroll
      isProgrammaticScrollRef.current = true;

      // Use RAF to ensure DOM is ready
      requestAnimationFrame(() => {
        scrollToCenter(courseId);

        // Reset flag after scroll animation completes (~500ms)
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 500);
      });
    },
    [setActiveCourseId, scrollToCenter]
  );

  /**
   * Handle user-initiated scroll.
   * Only updates active course if scroll was not programmatic.
   * This prevents the loop: marker click → scroll → detect scroll → update state
   */
  const handleUserScroll = useCallback(
    (courseId: string) => {
      // Skip if this scroll was triggered programmatically
      if (isProgrammaticScrollRef.current) {
        return;
      }

      // User scrolled manually, update active course
      setActiveCourseId(courseId);
    },
    [setActiveCourseId]
  );

  /**
   * Check if current scroll is programmatic
   */
  const isProgrammaticScroll = useCallback(() => {
    return isProgrammaticScrollRef.current;
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

    // Scenario 1: Course list changed (e.g., search area changed)
    const coursesChanged =
      previousFirstCourseIdRef.current !== null &&
      previousFirstCourseIdRef.current !== currentFirstCourseId;

    if (coursesChanged) {
      previousFirstCourseIdRef.current = currentFirstCourseId;
      const newId = courses[0].uuid;
      setActiveCourseId(newId);
      hasScrolledToActiveRef.current = false;
      isProgrammaticScrollRef.current = true;

      // Double RAF for layout stabilization
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
    triggerScrollToCourse,
    handleUserScroll,
    isProgrammaticScroll
  };
}

export default useMapScrollSync;
