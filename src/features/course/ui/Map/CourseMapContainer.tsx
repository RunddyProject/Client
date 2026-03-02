/**
 * CourseMapContainer - Container component for the Course Map
 *
 * This component follows the Container/View pattern:
 * - Container (this file): Manages business logic via useCourseMapContainer hook
 * - View (CourseMapView): Pure presentational component with React.memo
 *
 * Data Flow:
 * 1. useCourseMapContainer returns GROUPED data (for DX)
 * 2. Container SPREADS groups into FLAT props (for React.memo performance)
 * 3. View receives FLAT props (shallow comparison works correctly)
 */

import { CourseMapView } from './CourseMapView';
import { useCourseMapContainer } from './hooks/useCourseMapContainer';

export function CourseMapContainer() {
  // Get grouped data from the facade hook
  const { data, status, mapConfig, refs, handlers } =
    useCourseMapContainer();

  // Spread groups into flat props for React.memo optimization
  return (
    <CourseMapView
      {...data}
      {...status}
      {...mapConfig}
      scrollerRef={refs.scrollerRef}
      handlers={handlers}
    />
  );
}

export default CourseMapContainer;
