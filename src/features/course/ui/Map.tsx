import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject
} from 'react';

import { useCoursePoint } from '@/features/course/hooks/useCoursePoint';
import { useCourses } from '@/features/course/hooks/useCourses';
import {
  SHAPE_TYPE_COLOR,
  DEFAULT_ZOOM
} from '@/features/course/model/constants';
import CourseFilter from '@/features/course/ui/Filter';
import CourseInfoCard from '@/features/course/ui/InfoCard';
import Search from '@/features/course/ui/Search';
import { useGeolocation } from '@/features/map/hooks/useGeolocation';
import { useMapViewport } from '@/features/map/hooks/useMapViewport';
import { useLocationStore } from '@/features/map/model/location.store';
import { NaverMap } from '@/features/map/ui/NaverMap';
import { useCenteredActiveByScroll } from '@/shared/hooks/useCenteredActiveByScroll';
import { useScrollItemToCenter } from '@/shared/hooks/useScrollItemToCenter';
import { Icon } from '@/shared/icons/icon';
import { runddyColor } from '@/shared/model/constants';
import { Button } from '@/shared/ui/primitives/button';

import type { Course } from '@/features/course/model/types';
import type { MarkerInput } from '@/features/map/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

const CourseMap = ({
  onViewModeChange
}: {
  onViewModeChange: (mode: 'map' | 'list') => void;
}) => {
  const mapRef = useRef<naver.maps.Map | null>(null);

  // Use zustand selectors for read-only values (NOT currentMapCenter/Zoom - avoid re-render loop)
  const lastSearchedCenter = useLocationStore((state) => state.lastSearchedCenter);
  const lastSearchedRadius = useLocationStore((state) => state.lastSearchedRadius);
  const lastSearchedZoom = useLocationStore((state) => state.lastSearchedZoom);
  const keywordCenter = useLocationStore((state) => state.keywordCenter);

  // Use refs for setters to avoid recreating callbacks
  const setLastSearchedAreaRef = useRef(useLocationStore.getState().setLastSearchedArea);
  const setCurrentMapViewRef = useRef(useLocationStore.getState().setCurrentMapView);

  useEffect(() => {
    setLastSearchedAreaRef.current = useLocationStore.getState().setLastSearchedArea;
    setCurrentMapViewRef.current = useLocationStore.getState().setCurrentMapView;
  });

  // activeCourseId as LOCAL state to prevent infinite loops
  // Only sync with store on mount/unmount
  const [activeCourseId, setActiveCourseId] = useState<string | null>(() => {
    return useLocationStore.getState().activeCourseId;
  });

  // Keep ref updated for cleanup
  const activeCourseIdRef = useRef(activeCourseId);
  useEffect(() => {
    activeCourseIdRef.current = activeCourseId;
  }, [activeCourseId]);

  // Save to store on unmount
  useEffect(() => {
    return () => {
      // Save both activeCourseId and current map view on unmount
      const activeId = activeCourseIdRef.current;
      console.log('💾 Saving on unmount - activeCourseId:', activeId);
      useLocationStore.getState().setActiveCourseId(activeId);

      const map = mapRef.current;
      if (map) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        const centerObj = { lat: center.lat(), lng: center.lng() };
        console.log('💾 Saving on unmount - center:', centerObj, 'zoom:', zoom);
        useLocationStore.getState().setCurrentMapView(centerObj, zoom);
      } else {
        console.log('⚠️ No map to save on unmount');
      }
    };
  }, []);

  const { getCurrentLocation, isLoading: isLocationLoading } = useGeolocation();

  const { viewport, movedByUser, resetMovedByUser } = useMapViewport(
    mapRef.current
  );

  const { courses, isFetching } = useCourses({
    userLocation: lastSearchedCenter,
    radius: lastSearchedRadius
  });

  const { coursePointList } = useCoursePoint(activeCourseId ?? '');

  const activeCourse =
    courses.find((c) => c.uuid === activeCourseId) ?? courses[0];
  const activeColor: RUNDDY_COLOR = activeCourse
    ? SHAPE_TYPE_COLOR[activeCourse.shapeType]
    : runddyColor['blue'];

  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollToCenter = useScrollItemToCenter(
    scrollerRef as RefObject<HTMLElement>,
    'uuid'
  );

  const hasCenterChanged =
    Math.abs(viewport.center.lat - lastSearchedCenter.lat) > 0.0001 ||
    Math.abs(viewport.center.lng - lastSearchedCenter.lng) > 0.0001;

  const showSearchButton = movedByUser && hasCenterChanged;

  const handleSearchHere = () => {
    const zoom = mapRef.current?.getZoom?.() || DEFAULT_ZOOM;
    const center = keywordCenter ?? viewport.center;

    setLastSearchedAreaRef.current(center, viewport.radius, zoom);
    resetMovedByUser();

    if (mapRef.current) {
      mapRef.current.setCenter(new naver.maps.LatLng(center.lat, center.lng));
    }
  };

  const handleSearchByCurrentLocation = async () => {
    const zoom = mapRef.current?.getZoom?.() || DEFAULT_ZOOM;
    const center = await getCurrentLocation();

    setLastSearchedAreaRef.current(center, viewport.radius, zoom);

    if (mapRef.current) {
      mapRef.current.setCenter(new naver.maps.LatLng(center.lat, center.lng));
    }
  };

  const handleMarkerClick = (uuid: Course['uuid']) => {
    setActiveCourseId(uuid);
    requestAnimationFrame(() => scrollToCenter(uuid));
  };

  // Separate handler for scroll events - only updates active state, no scrolling
  const handleScrollChange = useCallback((uuid: Course['uuid']) => {
    setActiveCourseId(uuid);
  }, []);

  useCenteredActiveByScroll({
    container: scrollerRef as RefObject<HTMLElement>,
    itemAttr: 'uuid',
    onChange: handleScrollChange
  });

  useEffect(() => {
    // Don't change activeCourseId while courses are loading or empty
    if (courses.length === 0) return;

    console.log('🔍 activeCourseId effect:', {
      activeCourseId,
      coursesLength: courses.length,
      firstCourseId: courses[0]?.uuid
    });

    // If we have a saved activeCourseId and it exists in current courses, keep it
    if (activeCourseId && courses.find((c) => c.uuid === activeCourseId)) {
      console.log('✅ Keeping activeCourseId:', activeCourseId);
      return; // Keep current selection
    }

    // Only set to first course if we don't have a selection or it's invalid
    if (!activeCourseId || !courses.find((c) => c.uuid === activeCourseId)) {
      console.log('⚠️ Setting activeCourseId to first course:', courses[0].uuid);
      setActiveCourseId(courses[0].uuid);
    }
  }, [courses, activeCourseId]);

  // Restore map view on mount, then update only on explicit search
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (hasRestoredRef.current) return; // Already restored

    // Restore saved view on mount (read once from store)
    const savedCenter = useLocationStore.getState().currentMapCenter;
    const savedZoom = useLocationStore.getState().currentMapZoom;

    console.log('🔄 Restoring map view:', {
      savedCenter,
      savedZoom,
      lastSearchedCenter,
      lastSearchedZoom
    });

    // Prioritize saved view over last searched area
    if (savedCenter && savedZoom) {
      console.log('✅ Using saved center:', savedCenter, savedZoom);
      map.setCenter(new naver.maps.LatLng(savedCenter.lat, savedCenter.lng));
      map.setZoom(savedZoom);
    } else {
      // Fallback to last searched area only if no saved view
      console.log('⚠️ Using lastSearchedCenter (no saved view):', lastSearchedCenter);
      map.setCenter(new naver.maps.LatLng(lastSearchedCenter.lat, lastSearchedCenter.lng));
      map.setZoom(lastSearchedZoom ?? DEFAULT_ZOOM);
    }

    hasRestoredRef.current = true;
  }); // No deps - runs every render until map exists and restoration completes

  // Update map when user explicitly searches (lastSearchedCenter changes)
  const lastSearchedCenterRef = useRef(lastSearchedCenter);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Check if lastSearchedCenter actually changed
    const prev = lastSearchedCenterRef.current;
    const curr = lastSearchedCenter;

    const changed =
      Math.abs(prev.lat - curr.lat) > 0.0001 ||
      Math.abs(prev.lng - curr.lng) > 0.0001;

    if (changed) {
      lastSearchedCenterRef.current = lastSearchedCenter;
      map.setCenter(new naver.maps.LatLng(curr.lat, curr.lng));
      map.setZoom(lastSearchedZoom ?? DEFAULT_ZOOM);
    }
  }, [lastSearchedCenter, lastSearchedZoom]);

  // Save current map view when user stops interacting (throttled)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let throttleTimer: number | null = null;

    const handleIdle = () => {
      // Throttle: only save once per second
      if (throttleTimer) return;

      throttleTimer = window.setTimeout(() => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        setCurrentMapViewRef.current({ lat: center.lat(), lng: center.lng() }, zoom);
        throttleTimer = null;
      }, 1000);
    };

    const listener = naver.maps.Event.addListener(map, 'idle', handleIdle);

    return () => {
      naver.maps.Event.removeListener(listener);
      if (throttleTimer) clearTimeout(throttleTimer);
      // Final save is now handled in component unmount effect above
    };
  }, []); // Stable - no deps needed

  return (
    <div className='relative h-[100dvh]'>
      <NaverMap
        key='runddy-naver-map'
        className='absolute inset-0'
        glassTopOverlay
        points={coursePointList}
        color={activeColor}
        markers={courses.flatMap((c) => {
          const start: MarkerInput = {
            id: c.uuid,
            lat: c.lat,
            lng: c.lng,
            kind: 'start'
          };
          const endPoint = coursePointList[coursePointList.length - 1];
          if (c.uuid === activeCourseId && endPoint?.lat && endPoint?.lng) {
            const end: MarkerInput = {
              id: `${c.uuid}__end`,
              lat: endPoint.lat,
              lng: endPoint.lng,
              kind: 'end'
            };
            return [start, end];
          }
          return [start];
        })}
        focusKey={activeCourseId ?? undefined}
        fitEnabled={false}
        panEnabled={false}
        onInit={(map) => (mapRef.current = map)}
        onMarkerClick={handleMarkerClick}
      />

      {showSearchButton && (
        <div className='fixed top-[178px] left-1/2 z-50 -translate-x-1/2 transform'>
          <Button
            className='shadow-runddy gap-1.5 rounded-full px-3 py-2'
            onClick={handleSearchHere}
            disabled={isFetching}
          >
            <Icon
              name='refresh'
              size={20}
              color='var(--g-20)'
              secondary='var(--g-90)'
            />
            현재 위치에서 검색
          </Button>
        </div>
      )}

      <div className='pointer-events-none absolute top-[calc(env(safe-area-inset-top)+52px)] right-0 bottom-0 left-0 z-10 grid grid-rows-[auto_1fr_auto]'>
        {/* Search */}
        <div className='pointer-events-auto px-5 pt-[calc(env(safe-area-inset-top)+12px)]'>
          <Search className='shadow-runddy' />
        </div>

        {/* Filter */}
        <div className='mt-3 overflow-x-auto px-5'>
          <CourseFilter />
        </div>

        {/* Bottom Controls */}
        <div className='space-y-2 px-5 pb-[calc(env(safe-area-inset-bottom)+20px)]'>
          <div className='flex items-end justify-between'>
            <div className='flex flex-col gap-2'>
              {/* <Button
                size='icon'
                variant='secondary'
                className='rounded-full w-9.5 h-9.5 shadow-runddy bg-w-100'
                onClick={handleWeather}
              >
                <Icon name='weather' size={24} />
              </Button> */}
              <Button
                size='icon'
                variant='secondary'
                disabled={isLocationLoading}
                className='shadow-runddy bg-w-100 pointer-events-auto h-9.5 w-9.5 rounded-full'
                onClick={handleSearchByCurrentLocation}
              >
                <Icon
                  name='my_location'
                  size={24}
                  color='currentColor'
                  className='text-g-60'
                />
              </Button>
            </div>

            <Button
              className='shadow-runddy bg-w-100 pointer-events-auto gap-1 rounded-full px-3'
              onClick={() => onViewModeChange('list')}
            >
              <Icon
                name='list'
                size={20}
                color='currentColor'
                className='text-g-60'
              />
              <span className='text-sec text-contents-r-14'>목록 보기</span>
            </Button>
          </div>
        </div>

        {/* Course Cards */}
        {courses.length === 0 && (
          <div className='px-4 pb-5'>
            <div className='bg-w-100 flex [touch-action:none] gap-4 rounded-2xl p-5 shadow-xl'>
              <div className='bg-muted/60 flex h-12 w-12 items-center justify-center rounded-xl'>
                course
              </div>
              <div className='flex-1 space-y-1'>
                <p className='text-title-b18'>조건에 맞는 코스가 없어요</p>
                <p className='text-ter text-contents-r14'>
                  설정된 필터를 변경해 보세요
                </p>
              </div>
            </div>
          </div>
        )}

        {courses.length === 1 && (
          <div className='px-4 pb-5'>
            <CourseInfoCard
              course={courses[0]}
              className='rounded-2xl p-5 shadow-xl'
            />
          </div>
        )}

        {courses.length > 1 && (
          <div
            ref={scrollerRef}
            className='no-scrollbar pointer-events-auto flex touch-pan-x snap-x snap-mandatory [scroll-padding-right:16px] [scroll-padding-left:16px] gap-4 overflow-x-auto [overscroll-behavior-x:contain] px-4 pb-5'
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {courses.map((course) => (
              <div
                key={course.uuid}
                data-uuid={course.uuid}
                className='w-[85%] max-w-[420px] shrink-0 snap-center'
              >
                <CourseInfoCard
                  course={course}
                  className='rounded-2xl p-5 shadow-xl'
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseMap;
