import { CourseMapView } from './CourseMapView';
import { useCourseMapContainer } from './hooks/useCourseMapContainer';

import type { CourseMapProps } from './hooks/useCourseMapContainer';

/**
 * CourseMapContainer - Business logic container
 *
 * @description
 * Implements the Container/View pattern:
 * - Container: handles all business logic via useCourseMapContainer hook
 * - View: pure presentation component (CourseMapView)
 *
 * This separation improves:
 * - Testability: View can be tested in isolation with mock props
 * - Maintainability: Business logic changes don't affect UI and vice versa
 * - Reusability: View can be reused with different data sources
 */
export function CourseMapContainer({ onViewModeChange }: CourseMapProps) {
  const containerData = useCourseMapContainer({ onViewModeChange });

  return (
    <CourseMapView
      courses={containerData.courses}
      activeCourseId={containerData.activeCourseId}
      displayPoints={containerData.displayPoints}
      activeColor={containerData.activeColor}
      markers={containerData.markers}
      initialCenter={containerData.initialCenter}
      initialZoom={containerData.initialZoom}
      showSearchButton={containerData.showSearchButton}
      isFetching={containerData.isFetching}
      isLocationLoading={containerData.isLocationLoading}
      scrollerRef={containerData.scrollerRef}
      handlers={containerData.handlers}
    />
  );
}

export default CourseMapContainer;
