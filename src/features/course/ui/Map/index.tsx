/**
 * CourseMap - Public exports
 *
 * This index file provides the public API for the CourseMap feature.
 * It maintains backward compatibility with existing imports.
 *
 * Architecture:
 * - CourseMapContainer: Business logic (uses hooks, spreads data)
 * - CourseMapView: Pure presentation (memoized, flat props)
 * - Hooks: Business logic extraction (useCourseMapContainer, useMapScrollSync)
 *
 * Usage:
 * ```tsx
 * // Recommended: Named import
 * import { CourseMap } from '@/features/course-v1/ui/Map';
 *
 * // Also works: Default import (for backward compatibility)
 * import CourseMap from '@/features/course-v1/ui/Map';
 *
 * // Access individual components if needed
 * import { CourseMapContainer, CourseMapView } from '@/features/course-v1/ui/Map';
 *
 * // Access hooks directly
 * import { useCourseMapContainer, useMapScrollSync } from '@/features/course-v1/ui/Map/hooks';
 * ```
 */

// Components
export { CourseMapContainer } from './CourseMapContainer';
export { CourseMapView } from './CourseMapView';

// Main export - use Container as the default
export { CourseMapContainer as CourseMap } from './CourseMapContainer';

// Default export for backward compatibility
export { default } from './CourseMapContainer';
