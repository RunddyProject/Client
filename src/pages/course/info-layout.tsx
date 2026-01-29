import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  generatePath,
  Outlet,
  useLocation,
  useNavigate,
  useParams
} from 'react-router';

import { useCourseDetail } from '@/features/course/hooks/useCourseDetail';
import { SHAPE_TYPE_COLOR } from '@/features/course/model/constants';
import { NaverMap } from '@/features/map/ui/NaverMap';
import { cn } from '@/shared/lib/utils';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';

import type { Course } from '@/features/course/model/types';
import type { MarkerInput } from '@/features/map/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

export interface CourseInfoContext {
  course: Course;
  isLoading: boolean;
}

function CourseInfoLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { uuid } = useParams<{ uuid: string }>();

  const { courseDetail: course, isLoading } = useCourseDetail(uuid ?? '');

  // Detect if we're in expanded map mode (/course/:uuid/map)
  const isMapExpanded = location.pathname.endsWith('/map');

  // Store map instance for resize handling
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);

  // Memoize color to prevent recalculation
  const activeColor = useMemo<RUNDDY_COLOR>(
    () => (course ? SHAPE_TYPE_COLOR[course.shapeType] : 'blue'),
    [course?.shapeType]
  );

  // Memoize markers to prevent recreation on every render
  const markers = useMemo<MarkerInput[]>(() => {
    if (!course?.coursePointList?.length) return [];

    const points = course.coursePointList;
    const startPoint = points[0];
    const endPoint = points[points.length - 1];

    return [
      {
        id: course.uuid,
        lat: startPoint.lat,
        lng: startPoint.lng,
        kind: 'start'
      },
      {
        id: `${course.uuid}__end`,
        lat: endPoint.lat,
        lng: endPoint.lng,
        kind: 'end'
      }
    ];
  }, [course?.uuid, course?.coursePointList]);

  // Memoize bounds
  const bounds = useMemo(() => {
    if (!course) return undefined;
    return {
      minLat: course.minLat,
      maxLat: course.maxLat,
      minLng: course.minLng,
      maxLng: course.maxLng
    };
  }, [course?.minLat, course?.maxLat, course?.minLng, course?.maxLng]);

  // Handle map click in preview mode
  const handleMapClick = () => {
    if (!uuid) return;
    navigate(generatePath('/course/:uuid/map', { uuid }));
  };

  // Handle map initialization - store instance for resize on mode change
  const handleMapInit = useCallback((map: naver.maps.Map) => {
    mapInstanceRef.current = map;
  }, []);

  // Trigger resize when switching between preview/expanded modes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Wait for CSS transition to complete, then resize
    const timer = setTimeout(() => {
      map.autoResize();
    }, 350); // slightly longer than 300ms transition

    return () => clearTimeout(timer);
  }, [isMapExpanded]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!course) {
    navigate('/');
    return null;
  }

  return (
    <div className='min-h-[100dvh]'>
      {/* Shared map layer - static in preview, fixed in fullscreen */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          isMapExpanded ? 'fixed inset-0 z-50' : 'h-78 px-5 pt-3'
        )}
      >
        <NaverMap
          center={{ lat: course.lat, lng: course.lng }}
          points={course.coursePointList}
          bounds={bounds}
          markers={markers}
          markerSize={isMapExpanded ? 42 : 32}
          focusKey={course.uuid}
          color={activeColor}
          fitEnabled
          panEnabled={false}
          interactionsEnabled={isMapExpanded}
          onInit={handleMapInit}
          onOverlayClick={handleMapClick}
          className={cn('h-full w-full', !isMapExpanded && 'rounded-xl')}
        />
      </div>

      {/* Child content - only visible when map is not expanded */}
      {!isMapExpanded && <Outlet context={{ course, isLoading }} />}
    </div>
  );
}

export default CourseInfoLayout;
