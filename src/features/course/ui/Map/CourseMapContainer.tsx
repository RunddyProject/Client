/**
 * CourseMapContainer - Container component for the Course Map
 *
 * This component follows the Container/View pattern:
 * - Container (this file): Manages business logic via useCourseMapContainer hook
 * - View (CourseMapView): Pure presentational component
 *
 * Benefits:
 * - Clear separation of concerns
 * - Easier testing (logic can be tested via hook)
 * - Better maintainability
 * - Reduced component complexity
 */

import { useCourseMapContainer } from '@/features/course/hooks/useCourseMapContainer';
import { CourseMapView } from '@/features/course/ui/Map/CourseMapView';

import type { CourseMapProps } from '@/features/course/model/refactor-types';

/**
 * CourseMapContainer - Main entry point for the Course Map feature
 *
 * All business logic is handled by useCourseMapContainer hook.
 * This component simply connects the hook to the view.
 *
 * @param props - Component props
 * @param props.onViewModeChange - Callback when user switches to list view
 *
 * @example
 * ```tsx
 * <CourseMapContainer onViewModeChange={(mode) => setViewMode(mode)} />
 * ```
 */
export function CourseMapContainer({ onViewModeChange }: CourseMapProps) {
  // Get all data and handlers from the facade hook
  const {
    courses,
    activeCourse,
    activeCourseId,
    isFetching,
    mapRef,
    initialCenter,
    initialZoom,
    showSearchButton,
    isLocationLoading,
    markers,
    displayPoints,
    activeColor,
    scrollerRef,
    handlers
  } = useCourseMapContainer({ onViewModeChange });

  // Render the view with all data
  return (
    <CourseMapView
      courses={courses}
      activeCourse={activeCourse}
      activeCourseId={activeCourseId}
      markers={markers}
      displayPoints={displayPoints}
      activeColor={activeColor}
      mapRef={mapRef}
      initialCenter={initialCenter}
      initialZoom={initialZoom}
      showSearchButton={showSearchButton}
      isFetching={isFetching}
      isLocationLoading={isLocationLoading}
      scrollerRef={scrollerRef}
      handlers={handlers}
    />
  );
}

export default CourseMapContainer;
