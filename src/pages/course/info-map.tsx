/**
 * CourseInfoMap - Fullscreen map view for course details
 *
 * This component serves as a route marker for /course/:uuid/map.
 * The actual NaverMap is rendered by CourseInfoLayout and persists
 * across info/info-map transitions for better UX (no map recreation
 * or pan animation on navigation).
 *
 * The layout detects this route via pathname and expands the map
 * to fullscreen with interactions enabled.
 */
function CourseInfoMap() {
  // Map is rendered by CourseInfoLayout - this component exists for routing
  return null;
}

export default CourseInfoMap;
