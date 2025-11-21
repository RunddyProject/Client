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

  const lastSearchedCenter = useLocationStore(
    (state) => state.lastSearchedCenter
  );
  const lastSearchedRadius = useLocationStore(
    (state) => state.lastSearchedRadius
  );
  const lastSearchedZoom = useLocationStore((state) => state.lastSearchedZoom);
  const keywordCenter = useLocationStore((state) => state.keywordCenter);
  const userLocation = useLocationStore((state) => state.userLocation);

  const setLastSearchedAreaRef = useRef(
    useLocationStore.getState().setLastSearchedArea
  );
  const setCurrentMapViewRef = useRef(
    useLocationStore.getState().setCurrentMapView
  );

  useEffect(() => {
    setLastSearchedAreaRef.current =
      useLocationStore.getState().setLastSearchedArea;
    setCurrentMapViewRef.current =
      useLocationStore.getState().setCurrentMapView;
  });

  const [activeCourseId, setActiveCourseId] = useState<string | null>(() => {
    return useLocationStore.getState().activeCourseId;
  });

  const activeCourseIdRef = useRef(activeCourseId);
  useEffect(() => {
    activeCourseIdRef.current = activeCourseId;
  }, [activeCourseId]);

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

  const { getCurrentLocation, isLoading: isLocationLoading } = useGeolocation();

  const { viewport, movedByUser, resetMovedByUser } = useMapViewport(
    mapRef.current
  );

  const { courses, isFetching } = useCourses({
    userLocation: lastSearchedCenter,
    radius: lastSearchedRadius
  });

  const shouldFetchPoints = courses.length > 0 && activeCourseId !== null;
  const { coursePointList } = useCoursePoint(
    shouldFetchPoints ? activeCourseId : ''
  );

  const displayPoints =
    courses.length === 0 ? [] : activeCourseId ? coursePointList : [];

  const activeCourse =
    courses.find((c) => c.uuid === activeCourseId) ?? courses[0] ?? null;
  const activeColor: RUNDDY_COLOR = activeCourse
    ? SHAPE_TYPE_COLOR[activeCourse.shapeType]
    : runddyColor['blue'];

  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollToCenter = useScrollItemToCenter(
    scrollerRef as RefObject<HTMLElement>,
    'uuid'
  );

  const isProgrammaticScrollRef = useRef(false);

  const hasCenterChanged =
    Math.abs(viewport.center.lat - lastSearchedCenter.lat) > 0.0001 ||
    Math.abs(viewport.center.lng - lastSearchedCenter.lng) > 0.0001;

  const showSearchButton = movedByUser && hasCenterChanged;

  const handleSearch = (center: { lat: number; lng: number }) => {
    const zoom = mapRef.current?.getZoom?.() || DEFAULT_ZOOM;

    setLastSearchedAreaRef.current(center, viewport.radius, zoom);
    resetMovedByUser();

    if (mapRef.current) {
      mapRef.current.setCenter(new naver.maps.LatLng(center.lat, center.lng));
    }
  };

  const handleSearchHere = () => {
    const center = keywordCenter ?? viewport.center;
    handleSearch(center);
  };

  const handleSearchByCurrentLocation = async () => {
    const center = await getCurrentLocation();
    handleSearch(center);
  };

  const handleMarkerClick = (uuid: Course['uuid']) => {
    setActiveCourseId(uuid);
    isProgrammaticScrollRef.current = true;
    requestAnimationFrame(() => {
      scrollToCenter(uuid);
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    });
  };

  const handleScrollChange = useCallback((uuid: Course['uuid']) => {
    if (isProgrammaticScrollRef.current) {
      return;
    }
    setActiveCourseId(uuid);
  }, []);

  useCenteredActiveByScroll({
    container: scrollerRef as RefObject<HTMLElement>,
    itemAttr: 'uuid',
    onChange: handleScrollChange
  });

  const previousFirstCourseIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (courses.length === 0) {
      setActiveCourseId(null);
      previousFirstCourseIdRef.current = null;
      return;
    }
    const currentFirstCourseId = courses[0]?.uuid;

    const coursesChanged =
      previousFirstCourseIdRef.current !== null &&
      previousFirstCourseIdRef.current !== currentFirstCourseId;

    if (coursesChanged) {
      previousFirstCourseIdRef.current = currentFirstCourseId;
      const newId = courses[0].uuid;
      setActiveCourseId(newId);
      hasScrolledToActiveRef.current = false;
      isProgrammaticScrollRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToCenter(newId);
          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
            hasScrolledToActiveRef.current = true;
          }, 500);
        });
      });
      return;
    }

    if (activeCourseId && courses.find((c) => c.uuid === activeCourseId)) {
      if (!hasScrolledToActiveRef.current) {
        hasScrolledToActiveRef.current = true;
        isProgrammaticScrollRef.current = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToCenter(activeCourseId);
            setTimeout(() => {
              isProgrammaticScrollRef.current = false;
            }, 500);
          });
        });
      }
      if (previousFirstCourseIdRef.current === null) {
        previousFirstCourseIdRef.current = currentFirstCourseId;
      }
      return;
    }

    if (!activeCourseId || !courses.find((c) => c.uuid === activeCourseId)) {
      previousFirstCourseIdRef.current = currentFirstCourseId;
      const newId = courses[0].uuid;
      setActiveCourseId(newId);
      hasScrolledToActiveRef.current = true;
      isProgrammaticScrollRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToCenter(newId);
          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 500);
        });
      });
    }
  }, [courses, activeCourseId, scrollToCenter]);

  const hasRestoredRef = useRef(false);
  const hasScrolledToActiveRef = useRef(false);

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

  return (
    <div className='relative h-[100dvh] overflow-hidden'>
      <NaverMap
        key='runddy-naver-map'
        className='absolute inset-0'
        glassTopOverlay
        center={initialCenter ?? undefined}
        zoom={initialZoom}
        points={displayPoints}
        color={activeColor}
        markers={[
          ...courses.flatMap((c) => {
            const start: MarkerInput = {
              id: c.uuid,
              lat: c.lat,
              lng: c.lng,
              kind: 'start'
            };
            const endPoint =
              coursePointList.length > 0
                ? coursePointList[coursePointList.length - 1]
                : null;
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
          }),
          ...(userLocation
            ? [
                {
                  id: 'user_current_location',
                  lat: userLocation.lat,
                  lng: userLocation.lng,
                  kind: 'current_location' as const
                }
              ]
            : [])
        ]}
        focusKey={activeCourseId ?? undefined}
        fitEnabled={false}
        panEnabled={false}
        onInit={handleMapInit}
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

      <div className='pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+52px)] right-0 bottom-[env(safe-area-inset-bottom)] z-10 grid grid-rows-[auto_auto_1fr_auto]'>
        {/* Search */}
        <div className='pointer-events-auto px-5 pt-3'>
          <Search className='shadow-runddy' />
        </div>

        {/* Filter */}
        <div className='no-scrollbar mt-3 overflow-x-auto px-5'>
          <CourseFilter className='bg-w-100 shadow-runddy' />
        </div>

        <div />

        {/* Bottom Controls */}
        <div className='space-y-2 px-5 pb-5'>
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
          <div className='px-5 pb-5'>
            <div className='bg-w-100 pointer-events-auto flex items-center gap-4 rounded-2xl px-5 py-4.5 shadow-xl'>
              <Icon name='no_course' size={60} />
              <div className='flex flex-col space-y-1'>
                <div className='text-title-b18'>조건에 맞는 코스가 없어요</div>
                <div className='text-ter text-contents-r14'>
                  설정된 필터를 변경해 보세요
                </div>
              </div>
            </div>
          </div>
        )}

        {courses.length === 1 && (
          <div className='px-4 pb-5'>
            <CourseInfoCard
              course={courses[0]}
              className='rounded-2xl px-5 py-4.5 shadow-xl'
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
                  className='rounded-2xl px-5 py-4.5 shadow-xl'
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
