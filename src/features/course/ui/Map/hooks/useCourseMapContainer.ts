import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useOptimizedMarkers } from '@/features/course/hooks/useOptimizedMarkers';
import { useCoursePoint } from '@/features/course/hooks/useCoursePoint';
import { useCourses } from '@/features/course/hooks/useCourses';
import { DEFAULT_ZOOM, SHAPE_TYPE_COLOR } from '@/features/course/model/constants';
import { useGeolocation } from '@/features/map/hooks/useGeolocation';
import { useMapViewport } from '@/features/map/hooks/useMapViewport';
import { useLocationStore } from '@/features/map/model/location.store';
import { useCenteredActiveByScroll } from '@/shared/hooks/useCenteredActiveByScroll';
import { useScrollItemToCenter } from '@/shared/hooks/useScrollItemToCenter';
import { runddyColor } from '@/shared/model/constants';

import { useMapScrollSync } from './useMapScrollSync';

import type { RefObject } from 'react';

import type { Course, CoursePoint } from '@/features/course/model/types';
import type { MarkerInput } from '@/features/map/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

/**
 * CourseMap Props
 */
export interface CourseMapProps {
  onViewModeChange: (mode: 'map' | 'list') => void;
}

/**
 * CourseMap event handlers
 */
export interface CourseMapHandlers {
  onMapInit: (map: naver.maps.Map) => void;
  onMarkerClick: (uuid: string) => void;
  onScrollChange: (uuid: string) => void;
  onSearchHere: () => void;
  onSearchByCurrentLocation: () => Promise<void>;
  onViewModeChange: (mode: 'map' | 'list') => void;
}

/**
 * CourseMap container data (returned from hook)
 */
export interface CourseMapContainerData {
  // Course data
  courses: Course[];
  activeCourse: Course | null;
  activeCourseId: string | null;
  coursePointList: CoursePoint[];
  isFetching: boolean;

  // Map state
  mapRef: RefObject<naver.maps.Map | null>;
  initialCenter: { lat: number; lng: number } | null;
  initialZoom: number | undefined;

  // UI state
  showSearchButton: boolean;
  isLocationLoading: boolean;

  // Markers & Polyline
  markers: MarkerInput[];
  displayPoints: CoursePoint[];
  activeColor: RUNDDY_COLOR;

  // Scroll
  scrollerRef: RefObject<HTMLDivElement | null>;

  // Event handlers
  handlers: CourseMapHandlers;
}

/**
 * CourseMap container hook - integrates all business logic
 *
 * @description
 * This hook combines all the logic needed for CourseMap:
 * - Course data fetching and selection
 * - Map viewport and search area management
 * - Scroll synchronization
 * - Marker generation
 * - Event handlers
 */
export function useCourseMapContainer({
  onViewModeChange
}: CourseMapProps): CourseMapContainerData {
  const mapRef = useRef<naver.maps.Map | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // ============================================================================
  // Zustand Store State
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

  // Store action refs (to avoid dependency issues in effects)
  const setLastSearchedAreaRef = useRef(
    useLocationStore.getState().setLastSearchedArea
  );
  const setCurrentMapViewRef = useRef(
    useLocationStore.getState().setCurrentMapView
  );

  // Keep action refs in sync
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

  const activeCourseIdRef = useRef(activeCourseId);
  useEffect(() => {
    activeCourseIdRef.current = activeCourseId;
  }, [activeCourseId]);

  // Save active course and map state on unmount
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
  // Data Fetching
  // ============================================================================

  const { getCurrentLocation, isLoading: isLocationLoading } = useGeolocation();

  const { viewport, movedByUser, resetMovedByUser } = useMapViewport(
    mapRef.current
  );

  const { courses, isFetching } = useCourses({
    userLocation: lastSearchedCenter,
    radius: lastSearchedRadius
  });

  // Fetch course points for active course
  const shouldFetchPoints = courses.length > 0 && activeCourseId !== null;
  const { coursePointList } = useCoursePoint(
    shouldFetchPoints ? activeCourseId : ''
  );

  // ============================================================================
  // Derived State
  // ============================================================================

  const displayPoints =
    courses.length === 0 ? [] : activeCourseId ? coursePointList : [];

  const activeCourse =
    courses.find((c) => c.uuid === activeCourseId) ?? courses[0] ?? null;

  const activeColor: RUNDDY_COLOR = activeCourse
    ? SHAPE_TYPE_COLOR[activeCourse.shapeType]
    : runddyColor['blue'];

  // Optimized marker array
  const markers = useOptimizedMarkers({
    courses,
    activeCourseId,
    coursePointList,
    userLocation
  });

  // ============================================================================
  // Scroll Synchronization
  // ============================================================================

  const scrollToCenter = useScrollItemToCenter(
    scrollerRef as RefObject<HTMLElement>,
    'uuid'
  );

  const handleScrollChange = useCallback((uuid: Course['uuid']) => {
    setActiveCourseId(uuid);
  }, []);

  const { triggerScrollToCourse, handleUserScroll } = useMapScrollSync({
    scrollerRef,
    courses,
    activeCourseId,
    scrollToCenter,
    onScrollChange: handleScrollChange,
    setActiveCourseId
  });

  // Centered active by scroll detection
  useCenteredActiveByScroll({
    container: scrollerRef as RefObject<HTMLElement>,
    itemAttr: 'uuid',
    onChange: handleUserScroll
  });

  // ============================================================================
  // Search Button Logic
  // ============================================================================

  const hasCenterChanged =
    Math.abs(viewport.center.lat - lastSearchedCenter.lat) > 0.0001 ||
    Math.abs(viewport.center.lng - lastSearchedCenter.lng) > 0.0001;

  const showSearchButton = movedByUser && hasCenterChanged;

  // ============================================================================
  // Map Initialization
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
  // Keyword Center Sync
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
  // Map View Persistence (on idle)
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
  // Search Handlers
  // ============================================================================

  const handleSearch = useCallback(
    (center: { lat: number; lng: number }) => {
      const zoom = mapRef.current?.getZoom?.() || DEFAULT_ZOOM;

      setLastSearchedAreaRef.current(center, viewport.radius, zoom);
      resetMovedByUser();

      if (mapRef.current) {
        mapRef.current.setCenter(
          new naver.maps.LatLng(center.lat, center.lng)
        );
      }
    },
    [viewport.radius, resetMovedByUser]
  );

  const handleSearchHere = useCallback(() => {
    const center = keywordCenter ?? viewport.center;
    handleSearch(center);
  }, [keywordCenter, viewport.center, handleSearch]);

  const handleSearchByCurrentLocation = useCallback(async () => {
    const center = await getCurrentLocation();
    handleSearch(center);
  }, [getCurrentLocation, handleSearch]);

  // ============================================================================
  // Event Handlers (Memoized)
  // ============================================================================

  const handlers = useMemo<CourseMapHandlers>(
    () => ({
      onMapInit: handleMapInit,
      onMarkerClick: triggerScrollToCourse,
      onScrollChange: handleUserScroll,
      onSearchHere: handleSearchHere,
      onSearchByCurrentLocation: handleSearchByCurrentLocation,
      onViewModeChange
    }),
    [
      handleMapInit,
      triggerScrollToCourse,
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
    initialCenter,
    initialZoom,

    // UI state
    showSearchButton,
    isLocationLoading,

    // Markers & Polyline
    markers,
    displayPoints,
    activeColor,

    // Scroll
    scrollerRef,

    // Event handlers
    handlers
  };
}
