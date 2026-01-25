/**
 * useCourseMapContainer - Facade hook for CourseMap business logic
 *
 * This hook integrates all the business logic needed for the CourseMap component,
 * following the Container/View pattern. It combines:
 * - Course data fetching
 * - Active course selection
 * - Map viewport management
 * - Scroll synchronization
 * - Marker generation
 *
 * The View component (CourseMapView) receives all data and handlers from this hook,
 * keeping it purely presentational.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject
} from 'react';

import { useOptimizedMarkers } from '@/features/course/hooks/useOptimizedMarkers';
import { useCoursePoint } from '@/features/course/hooks/useCoursePoint';
import { useCourses } from '@/features/course/hooks/useCourses';
import { useMapScrollSync } from '@/features/course/hooks/useMapScrollSync';
import {
  SHAPE_TYPE_COLOR,
  DEFAULT_ZOOM
} from '@/features/course/model/constants';
import { useGeolocation } from '@/features/map/hooks/useGeolocation';
import { useMapViewport } from '@/features/map/hooks/useMapViewport';
import { useLocationStore } from '@/features/map/model/location.store';
import { useCenteredActiveByScroll } from '@/shared/hooks/useCenteredActiveByScroll';
import { useScrollItemToCenter } from '@/shared/hooks/useScrollItemToCenter';
import { runddyColor } from '@/shared/model/constants';

import type {
  CourseMapContainerData,
  CourseMapHandlers,
  CourseMapProps
} from '@/features/course/model/refactor-types';
import type { Course, CoursePoint } from '@/features/course/model/types';
import type { MarkerInput } from '@/features/map/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

/**
 * useCourseMapContainer - Facade hook for CourseMap
 *
 * Extracts all business logic from CourseMap component for better testability
 * and separation of concerns.
 *
 * @param props - CourseMap component props
 * @returns All data, state, and handlers needed by CourseMapView
 *
 * @example
 * ```tsx
 * function CourseMapContainer({ onViewModeChange }: CourseMapProps) {
 *   const containerData = useCourseMapContainer({ onViewModeChange });
 *   return <CourseMapView {...containerData} />;
 * }
 * ```
 */
export function useCourseMapContainer(
  props: CourseMapProps
): CourseMapContainerData {
  const { onViewModeChange } = props;

  // ============================================================================
  // Map Reference
  // ============================================================================
  const mapRef = useRef<naver.maps.Map | null>(null);

  // ============================================================================
  // Location Store State
  // ============================================================================
  const lastSearchedCenter = useLocationStore(
    (state) => state.lastSearchedCenter
  );
  const lastSearchedRadius = useLocationStore(
    (state) => state.lastSearchedRadius
  );
  const lastSearchedZoom = useLocationStore((state) => state.lastSearchedZoom);
  const keywordCenter = useLocationStore((state) => state.keywordCenter);
  const userLocation = useLocationStore((state) => state.userLocation);

  // Store action refs (stable references)
  const setLastSearchedAreaRef = useRef(
    useLocationStore.getState().setLastSearchedArea
  );
  const setCurrentMapViewRef = useRef(
    useLocationStore.getState().setCurrentMapView
  );

  // Sync store action refs on mount
  useEffect(() => {
    setLastSearchedAreaRef.current =
      useLocationStore.getState().setLastSearchedArea;
    setCurrentMapViewRef.current =
      useLocationStore.getState().setCurrentMapView;
  }, []);

  // ============================================================================
  // Active Course State
  // ============================================================================
  const [activeCourseId, setActiveCourseId] = useState<string | null>(() => {
    return useLocationStore.getState().activeCourseId;
  });

  // Keep activeCourseId ref in sync for cleanup
  const activeCourseIdRef = useRef(activeCourseId);
  useEffect(() => {
    activeCourseIdRef.current = activeCourseId;
  }, [activeCourseId]);

  // Save state on unmount
  useEffect(() => {
    return () => {
      const activeId = activeCourseIdRef.current;
      useLocationStore.getState().setActiveCourseId(activeId);

      const map = mapRef.current;
      if (map) {
        const center = map.getCenter() as naver.maps.LatLng;
        const zoom = map.getZoom();
        const centerObj = { lat: center.lat(), lng: center.lng() };
        useLocationStore.getState().setCurrentMapView(centerObj, zoom);
      }
    };
  }, []);

  // ============================================================================
  // Geolocation
  // ============================================================================
  const { getCurrentLocation, isLoading: isLocationLoading } = useGeolocation();

  // ============================================================================
  // Map Viewport
  // ============================================================================
  const { viewport, movedByUser, resetMovedByUser } = useMapViewport(
    mapRef.current
  );

  // ============================================================================
  // Course Data Fetching
  // ============================================================================
  const { courses, isFetching } = useCourses({
    userLocation: lastSearchedCenter,
    radius: lastSearchedRadius
  });

  // ============================================================================
  // Course Points (for active course polyline)
  // ============================================================================
  const shouldFetchPoints = courses.length > 0 && activeCourseId !== null;
  const { coursePointList } = useCoursePoint(
    shouldFetchPoints ? activeCourseId : ''
  );

  // Display points (empty when no courses or no active course)
  const displayPoints: CoursePoint[] =
    courses.length === 0 ? [] : activeCourseId ? coursePointList : [];

  // ============================================================================
  // Active Course & Color
  // ============================================================================
  const activeCourse =
    courses.find((c) => c.uuid === activeCourseId) ?? courses[0] ?? null;

  const activeColor: RUNDDY_COLOR = activeCourse
    ? SHAPE_TYPE_COLOR[activeCourse.shapeType]
    : runddyColor['blue'];

  // ============================================================================
  // Optimized Markers
  // ============================================================================
  const markers: MarkerInput[] = useOptimizedMarkers({
    courses,
    activeCourseId,
    coursePointList,
    userLocation
  });

  // ============================================================================
  // Scroll Management
  // ============================================================================
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollToCenter = useScrollItemToCenter(
    scrollerRef as RefObject<HTMLElement>,
    'uuid'
  );

  // Scroll change callback (updates active course)
  const handleScrollChange = useCallback((uuid: Course['uuid']) => {
    setActiveCourseId(uuid);
  }, []);

  // Map-Scroll synchronization hook
  const { triggerScrollToCourse, handleUserScroll } = useMapScrollSync({
    scrollerRef,
    courses,
    activeCourseId,
    scrollToCenter,
    onScrollChange: handleScrollChange,
    setActiveCourseId
  });

  // Detect user scroll and update active course
  useCenteredActiveByScroll({
    container: scrollerRef as RefObject<HTMLElement>,
    itemAttr: 'uuid',
    onChange: handleUserScroll
  });

  // ============================================================================
  // Search Area Changed Detection
  // ============================================================================
  const hasCenterChanged =
    Math.abs(viewport.center.lat - lastSearchedCenter.lat) > 0.0001 ||
    Math.abs(viewport.center.lng - lastSearchedCenter.lng) > 0.0001;

  const showSearchButton = movedByUser && hasCenterChanged;

  // ============================================================================
  // Map Initialization State
  // ============================================================================
  const hasRestoredRef = useRef(false);

  const [initialCenter, setInitialCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(() => {
    const savedCenter = useLocationStore.getState().currentMapCenter;
    return savedCenter ?? lastSearchedCenter;
  });

  const [initialZoom, setInitialZoom] = useState<number | undefined>(() => {
    const savedZoom = useLocationStore.getState().currentMapZoom;
    return savedZoom ?? lastSearchedZoom ?? DEFAULT_ZOOM;
  });

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handle search at a given center position
   */
  const handleSearch = useCallback(
    (center: { lat: number; lng: number }) => {
      const zoom = mapRef.current?.getZoom?.() || DEFAULT_ZOOM;

      setLastSearchedAreaRef.current(center, viewport.radius, zoom);
      resetMovedByUser();

      if (mapRef.current) {
        mapRef.current.setCenter(new naver.maps.LatLng(center.lat, center.lng));
      }
    },
    [viewport.radius, resetMovedByUser]
  );

  /**
   * Search at current map center (or keyword center)
   */
  const handleSearchHere = useCallback(() => {
    const center = keywordCenter ?? viewport.center;
    handleSearch(center);
  }, [keywordCenter, viewport.center, handleSearch]);

  /**
   * Search at user's current GPS location
   */
  const handleSearchByCurrentLocation = useCallback(async () => {
    const center = await getCurrentLocation();
    handleSearch(center);
  }, [getCurrentLocation, handleSearch]);

  /**
   * Handle marker click on map
   */
  const handleMarkerClick = useCallback(
    (uuid: Course['uuid']) => {
      triggerScrollToCourse(uuid);
    },
    [triggerScrollToCourse]
  );

  /**
   * Handle map initialization
   */
  const handleMapInit = useCallback((map: naver.maps.Map) => {
    mapRef.current = map;

    if (!hasRestoredRef.current) {
      hasRestoredRef.current = true;

      requestAnimationFrame(() => {
        setInitialCenter(null);
        setInitialZoom(undefined);
      });
    }
  }, []);

  // ============================================================================
  // Keyword Center Sync Effect
  // ============================================================================
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!hasRestoredRef.current) return;
    if (!keywordCenter) return;

    map.setCenter(new naver.maps.LatLng(keywordCenter.lat, keywordCenter.lng));
    map.setZoom(lastSearchedZoom ?? DEFAULT_ZOOM);

    const zoom = map.getZoom();
    setLastSearchedAreaRef.current(keywordCenter, viewport.radius, zoom);
  }, [keywordCenter, lastSearchedZoom, viewport.radius]);

  // ============================================================================
  // Map View Persistence Effect (save on idle)
  // ============================================================================
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let throttleTimer: number | null = null;

    const handleIdle = () => {
      if (throttleTimer) return;

      throttleTimer = window.setTimeout(() => {
        const center = map.getCenter() as naver.maps.LatLng;
        const zoom = map.getZoom();
        const centerObj = { lat: center.lat(), lng: center.lng() };
        setCurrentMapViewRef.current(centerObj, zoom);
        throttleTimer = null;
      }, 1000);
    };

    const listener = naver.maps.Event.addListener(map, 'idle', handleIdle);

    return () => {
      naver.maps.Event.removeListener(listener);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, []);

  // ============================================================================
  // Memoized Handlers Object
  // ============================================================================
  const handlers: CourseMapHandlers = useMemo(
    () => ({
      onMapInit: handleMapInit,
      onMarkerClick: handleMarkerClick,
      onScrollChange: handleUserScroll,
      onSearchHere: handleSearchHere,
      onSearchByCurrentLocation: handleSearchByCurrentLocation,
      onViewModeChange
    }),
    [
      handleMapInit,
      handleMarkerClick,
      handleUserScroll,
      handleSearchHere,
      handleSearchByCurrentLocation,
      onViewModeChange
    ]
  );

  // ============================================================================
  // Return Container Data
  // ============================================================================
  return {
    // Course data
    courses,
    activeCourse,
    activeCourseId,
    coursePointList,
    isFetching,

    // Map state
    mapRef,
    viewport,
    initialCenter,
    initialZoom,

    // UI state
    showSearchButton,
    isLocationLoading,

    // Handlers
    handlers,

    // Scroll
    scrollerRef,
    scrollToCenter,

    // Markers & Polyline
    markers,
    displayPoints,
    activeColor
  };
}

export default useCourseMapContainer;
