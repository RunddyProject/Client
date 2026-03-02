/**
 * useCourseMapContainer - Facade hook for CourseMap business logic
 *
 * This hook integrates all business logic needed for the CourseMap component,
 * following the Container/View pattern with grouped returns for better DX.
 *
 * Return Structure (Grouped by Domain):
 * - data: Business data and derived states
 * - status: Loading and UI states
 * - mapConfig: Initial map settings
 * - refs: DOM and instance references
 * - handlers: Memoized event handlers
 *
 * The Container component spreads these groups into flat props for the View,
 * ensuring React.memo shallow comparison works correctly.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useCoursePoint } from '@/features/course/hooks/useCoursePoint';
import { useCourses } from '@/features/course/hooks/useCourses';
import { useOptimizedMarkers } from '@/features/course/hooks/useOptimizedMarkers';
import {
  DEFAULT_ZOOM,
  SHAPE_TYPE_COLOR
} from '@/features/course/model/constants';
import { useGeolocation } from '@/features/map/hooks/useGeolocation';
import { useMapViewport } from '@/features/map/hooks/useMapViewport';
import { useLocationStore } from '@/features/map/model/location.store';
import { useCenteredActiveByScroll } from '@/shared/hooks/useCenteredActiveByScroll';
import { useScrollItemToCenter } from '@/shared/hooks/useScrollItemToCenter';
import { runddyColor } from '@/shared/model/constants';

import { useMapScrollSync } from './useMapScrollSync';

import type {
  CourseMapContainerData,
  CourseMapHandlers
} from '@/features/course/model/refactor-types';
import type { RefObject } from 'react';

/**
 * useCourseMapContainer - Facade hook for CourseMap
 *
 * Extracts all business logic from CourseMap component for better testability
 * and separation of concerns. Returns grouped data for DX while enabling
 * flat prop spreading for performance.
 *
 * @param props - CourseMap component props
 * @returns Grouped data, status, config, refs, and handlers
 *
 * @example
 * ```tsx
 * function CourseMapContainer({ onViewModeChange }: CourseMapProps) {
 *   const { data, status, mapConfig, refs, handlers } = useCourseMapContainer({
 *     onViewModeChange
 *   });
 *
 *   return (
 *     <CourseMapView
 *       {...data}
 *       {...status}
 *       {...mapConfig}
 *       scrollerRef={refs.scrollerRef}
 *       handlers={handlers}
 *     />
 *   );
 * }
 * ```
 */
export function useCourseMapContainer(): CourseMapContainerData {
  // ============================================================================
  // Map Reference
  // ============================================================================
  const mapRef = useRef<naver.maps.Map | null>(null);

  // ============================================================================
  // Location Store State (using selectors for minimal re-renders)
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

  // Store action refs (stable references to avoid re-renders)
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

  // CRITICAL: Store viewport in ref to avoid dependency in handlers
  // This prevents handler recreation on every map movement
  const viewportRef = useRef(viewport);
  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

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
  const displayPoints = useMemo(
    () => (courses.length === 0 ? [] : activeCourseId ? coursePointList : []),
    [courses.length, activeCourseId, coursePointList]
  );

  // ============================================================================
  // Active Course & Color (Derived State)
  // ============================================================================
  const activeCourse = useMemo(
    () => courses.find((c) => c.uuid === activeCourseId) ?? courses[0] ?? null,
    [courses, activeCourseId]
  );

  const activeColor = useMemo(
    () =>
      activeCourse
        ? SHAPE_TYPE_COLOR[activeCourse.shapeType]
        : runddyColor['default'],
    [activeCourse]
  );

  // ============================================================================
  // Optimized Markers
  // ============================================================================
  const markers = useOptimizedMarkers({
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

  // Map-Scroll synchronization hook
  const { triggerScrollToCourse, handleUserScroll } = useMapScrollSync({
    courses,
    activeCourseId,
    scrollToCenter,
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
  const showSearchButton = useMemo(() => {
    const hasCenterChanged =
      Math.abs(viewport.center.lat - lastSearchedCenter.lat) > 0.0001 ||
      Math.abs(viewport.center.lng - lastSearchedCenter.lng) > 0.0001;

    return movedByUser && hasCenterChanged;
  }, [viewport.center, lastSearchedCenter, movedByUser]);

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
   * Uses viewportRef to avoid dependency on viewport state
   */
  const handleSearch = useCallback(
    (center: { lat: number; lng: number }) => {
      const zoom = mapRef.current?.getZoom?.() || DEFAULT_ZOOM;
      const radius = viewportRef.current.radius;

      setLastSearchedAreaRef.current(center, radius, zoom);
      resetMovedByUser();

      if (mapRef.current) {
        mapRef.current.setCenter(new naver.maps.LatLng(center.lat, center.lng));
      }
    },
    [resetMovedByUser]
  );

  /**
   * Search at current map center (or keyword center)
   * Uses viewportRef to avoid dependency on viewport.center
   */
  const handleSearchHere = useCallback(() => {
    const center = keywordCenter ?? viewportRef.current.center;
    handleSearch(center);
  }, [keywordCenter, handleSearch]);

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
    (uuid: string) => {
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
    const radius = viewportRef.current.radius;
    setLastSearchedAreaRef.current(keywordCenter, radius, zoom);
  }, [keywordCenter, lastSearchedZoom]);

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
      onSearchByCurrentLocation: handleSearchByCurrentLocation
    }),
    [
      handleMapInit,
      handleMarkerClick,
      handleUserScroll,
      handleSearchHere,
      handleSearchByCurrentLocation
    ]
  );

  // ============================================================================
  // Memoized Group Objects for Stable References
  // ============================================================================

  /**
   * CRITICAL: Each group must be memoized to prevent React.memo from failing.
   * Without memoization, spreading new objects passes the same primitive values
   * but array/object references (courses, markers) would still trigger re-renders.
   */

  // Group 1: Business data (memoized to keep array references stable)
  const data = useMemo(
    () => ({
      courses,
      activeCourseId,
      displayPoints,
      markers,
      activeColor
    }),
    [courses, activeCourseId, displayPoints, markers, activeColor]
  );

  // Group 2: Loading and UI states
  const status = useMemo(
    () => ({
      isFetching,
      isLocationLoading,
      showSearchButton
    }),
    [isFetching, isLocationLoading, showSearchButton]
  );

  // Group 3: Initial map settings
  const mapConfig = useMemo(
    () => ({
      initialCenter,
      initialZoom
    }),
    [initialCenter, initialZoom]
  );

  // Group 4: DOM references (refs are stable, but wrap for consistency)
  const refs = useMemo(
    () => ({
      scrollerRef
    }),
    [scrollerRef]
  );

  // ============================================================================
  // Return Memoized Groups
  // ============================================================================
  return {
    data,
    status,
    mapConfig,
    refs,
    handlers
  };
}

export default useCourseMapContainer;
