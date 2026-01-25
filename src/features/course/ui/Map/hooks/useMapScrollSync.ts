import { useCallback, useEffect, useRef } from 'react';

import type { Course } from '@/features/course/model/types';

/**
 * Map-Scroll bidirectional sync options
 */
export interface MapScrollSyncOptions {
  /** Scroller container ref */
  scrollerRef: React.RefObject<HTMLDivElement | null>;
  /** Course list */
  courses: Course[];
  /** Active course ID */
  activeCourseId: string | null;
  /** Scroll to center function */
  scrollToCenter: (id: string) => void;
  /** Callback when scroll changes active item */
  onScrollChange: (uuid: string) => void;
  /** Callback to set active course ID */
  setActiveCourseId: (id: string | null) => void;
}

/**
 * Scroll sync state
 */
export interface ScrollSyncState {
  /** Whether programmatic scroll is in progress */
  isProgrammaticScroll: boolean;
  /** Whether active item has been scrolled to */
  hasScrolledToActive: boolean;
  /** Previous first course ID for change detection */
  previousFirstCourseId: string | null;
}

/**
 * Scroll sync actions
 */
export interface ScrollSyncActions {
  /** Trigger scroll to specific course (from marker click) */
  triggerScrollToCourse: (courseId: string) => void;
  /** Handle user scroll event */
  handleUserScroll: (courseId: string) => void;
  /** Reset scroll state */
  resetScrollState: () => void;
}

/**
 * Map-Scroll bidirectional sync hook
 *
 * @description
 * - Handles marker click → card scroll
 * - Handles card scroll → active course change
 * - Distinguishes between programmatic scroll and user scroll
 * - Auto-scrolls when course list changes
 */
export function useMapScrollSync({
  scrollerRef: _scrollerRef,
  courses,
  activeCourseId,
  scrollToCenter,
  onScrollChange,
  setActiveCourseId
}: MapScrollSyncOptions): ScrollSyncState & ScrollSyncActions {
  // Note: scrollerRef is passed for type consistency but not used directly
  // as scrollToCenter already encapsulates the scroll logic
  void _scrollerRef;
  const isProgrammaticScrollRef = useRef(false);
  const hasScrolledToActiveRef = useRef(false);
  const previousFirstCourseIdRef = useRef<string | null>(null);

  // Trigger scroll to course (from marker click)
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
    [scrollToCenter, setActiveCourseId]
  );

  // Handle user scroll
  const handleUserScroll = useCallback(
    (courseId: string) => {
      if (isProgrammaticScrollRef.current) {
        return;
      }
      onScrollChange(courseId);
    },
    [onScrollChange]
  );

  // Reset scroll state
  const resetScrollState = useCallback(() => {
    isProgrammaticScrollRef.current = false;
    hasScrolledToActiveRef.current = false;
    previousFirstCourseIdRef.current = null;
  }, []);

  // Handle course list changes and auto-scroll
  useEffect(() => {
    if (courses.length === 0) {
      setActiveCourseId(null);
      previousFirstCourseIdRef.current = null;
      return;
    }

    const currentFirstCourseId = courses[0]?.uuid;

    // Detect if courses have changed (first course changed)
    const coursesChanged =
      previousFirstCourseIdRef.current !== null &&
      previousFirstCourseIdRef.current !== currentFirstCourseId;

    if (coursesChanged) {
      // Courses changed → scroll to first course
      previousFirstCourseIdRef.current = currentFirstCourseId;
      const newId = courses[0].uuid;
      setActiveCourseId(newId);
      hasScrolledToActiveRef.current = false;
      isProgrammaticScrollRef.current = true;

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

    // Active course exists in list
    if (activeCourseId && courses.find((c) => c.uuid === activeCourseId)) {
      if (!hasScrolledToActiveRef.current) {
        // First time → scroll to active course
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
      if (previousFirstCourseIdRef.current === null) {
        previousFirstCourseIdRef.current = currentFirstCourseId;
      }
      return;
    }

    // Active course not in list or null → select first course
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
    // State (current refs)
    isProgrammaticScroll: isProgrammaticScrollRef.current,
    hasScrolledToActive: hasScrolledToActiveRef.current,
    previousFirstCourseId: previousFirstCourseIdRef.current,
    // Actions
    triggerScrollToCourse,
    handleUserScroll,
    resetScrollState
  };
}

/**
 * Course list scroll sync hook
 *
 * @description
 * - Simplified version for external use
 * - Handles course list changes and scrolls to appropriate course
 */
export function useCourseListScrollSync(
  courses: Course[],
  activeCourseId: string | null,
  scrollToCenter: (id: string) => void,
  setActiveCourseId: (id: string | null) => void
): void {
  const previousFirstCourseIdRef = useRef<string | null>(null);
  const hasScrolledToActiveRef = useRef(false);

  useEffect(() => {
    if (courses.length === 0) {
      setActiveCourseId(null);
      previousFirstCourseIdRef.current = null;
      return;
    }

    const currentFirstCourseId = courses[0]?.uuid;
    const coursesChanged =
      previousFirstCourseIdRef.current !== null &&
      previousFirstCourseIdRef.current !== currentFirstCourseId;

    if (coursesChanged) {
      previousFirstCourseIdRef.current = currentFirstCourseId;
      const newId = courses[0].uuid;
      setActiveCourseId(newId);
      hasScrolledToActiveRef.current = false;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToCenter(newId);
        });
      });
      return;
    }

    if (activeCourseId && courses.find((c) => c.uuid === activeCourseId)) {
      if (!hasScrolledToActiveRef.current) {
        hasScrolledToActiveRef.current = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToCenter(activeCourseId);
          });
        });
      }
      if (previousFirstCourseIdRef.current === null) {
        previousFirstCourseIdRef.current = currentFirstCourseId;
      }
      return;
    }

    if (!activeCourseId || !courses.find((c) => c.uuid === activeCourseId)) {
      previousFirstCourseIdRef.current = currentFirstCourseId;
      const newId = courses[0].uuid;
      setActiveCourseId(newId);
      hasScrolledToActiveRef.current = true;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToCenter(newId);
        });
      });
    }
  }, [courses, activeCourseId, scrollToCenter, setActiveCourseId]);
}
