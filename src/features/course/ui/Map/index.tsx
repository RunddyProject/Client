/**
 * CourseMap module
 *
 * This module exports the CourseMap component using the Container/View pattern.
 * The refactored structure improves maintainability and testability.
 *
 * @module features/course/ui/Map
 */

export { CourseMapContainer as default } from './CourseMapContainer';
export { CourseMapContainer } from './CourseMapContainer';
export { CourseMapView } from './CourseMapView';

// Hook exports
export { useCourseMapContainer } from './hooks/useCourseMapContainer';
export { useMapScrollSync, useCourseListScrollSync } from './hooks/useMapScrollSync';

// Type exports
export type { CourseMapProps, CourseMapHandlers, CourseMapContainerData } from './hooks/useCourseMapContainer';
export type { CourseMapViewProps } from './CourseMapView';
export type { MapScrollSyncOptions, ScrollSyncState, ScrollSyncActions } from './hooks/useMapScrollSync';
