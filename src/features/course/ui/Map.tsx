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

  const {
    lastSearchedCenter,
    lastSearchedRadius,
    lastSearchedZoom,
    currentMapCenter,
    currentMapZoom,
    activeCourseId,
    keywordCenter,
    setLastSearchedArea,
    setCurrentMapView,
    setActiveCourseId
  } = useLocationStore();
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

    setLastSearchedArea(center, viewport.radius, zoom);
    resetMovedByUser();

    if (mapRef.current) {
      mapRef.current.setCenter(new naver.maps.LatLng(center.lat, center.lng));
    }
  };

  const handleSearchByCurrentLocation = async () => {
    const zoom = mapRef.current?.getZoom?.() || DEFAULT_ZOOM;
    const center = await getCurrentLocation();

    setLastSearchedArea(center, viewport.radius, zoom);

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
    if (courses.length === 0) {
      setActiveCourseId(null);
    } else if (!activeCourseId) {
      setActiveCourseId(courses[0].uuid);
    } else if (!courses.find((c) => c.uuid === activeCourseId)) {
      setActiveCourseId(courses[0].uuid);
    }
  }, [courses, activeCourseId, setActiveCourseId]);

  // Restore map view on mount, then listen to search area changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Restore saved map view if available, otherwise use last searched area
    const targetCenter = currentMapCenter ?? lastSearchedCenter;
    const targetZoom = currentMapZoom ?? lastSearchedZoom ?? DEFAULT_ZOOM;

    map.setCenter(new naver.maps.LatLng(targetCenter.lat, targetCenter.lng));
    map.setZoom(targetZoom);
  }, []); // Only run on mount

  // Update map when search area changes (explicit user action)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Only update if lastSearchedCenter actually changed
    const currentCenter = map.getCenter();
    const centerChanged =
      Math.abs(currentCenter.lat() - lastSearchedCenter.lat) > 0.0001 ||
      Math.abs(currentCenter.lng() - lastSearchedCenter.lng) > 0.0001;

    if (centerChanged) {
      map.setCenter(
        new naver.maps.LatLng(lastSearchedCenter.lat, lastSearchedCenter.lng)
      );
      map.setZoom(lastSearchedZoom ?? DEFAULT_ZOOM);
    }
  }, [lastSearchedCenter, lastSearchedZoom]);

  // Save current map view when user stops interacting
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleIdle = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      setCurrentMapView({ lat: center.lat(), lng: center.lng() }, zoom);
    };

    const listener = naver.maps.Event.addListener(map, 'idle', handleIdle);

    return () => {
      naver.maps.Event.removeListener(listener);
    };
  }, [setCurrentMapView]);

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
