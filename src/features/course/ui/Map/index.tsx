/**
 * CourseMap - Public exports
 *
 * This index file provides the public API for the CourseMap feature.
 * It maintains backward compatibility with existing imports.
 *
 * Usage:
 * ```tsx
 * // Recommended: Named import
 * import { CourseMap } from '@/features/course/ui/Map';
 *
 * // Also works: Default import (for backward compatibility)
 * import CourseMap from '@/features/course/ui/Map';
 *
 * // Access individual components if needed
 * import { CourseMapContainer, CourseMapView } from '@/features/course/ui/Map';
 * ```
 */

export { CourseMapContainer } from './CourseMapContainer';
export { CourseMapView } from './CourseMapView';

// Main export - use Container as the default
export { CourseMapContainer as CourseMap } from './CourseMapContainer';

// Default export for backward compatibility
export { default } from './CourseMapContainer';
