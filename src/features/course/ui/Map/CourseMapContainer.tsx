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

import { useCourseMapContainer } from './hooks/useCourseMapContainer';
import { CourseMapView } from './CourseMapView';

import type { CourseMapProps } from '@/features/course/model/refactor-types';

/**
 * CourseMapContainer - Main entry point for the Course Map feature
 *
 * Receives grouped data from the hook and spreads it into flat props
 * for the View component, ensuring React.memo optimization works.
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
  // Get grouped data from the facade hook
  const { data, status, mapConfig, refs, handlers } = useCourseMapContainer({
    onViewModeChange
  });

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
