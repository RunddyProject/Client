import { useCallback, useEffect, useRef } from 'react';
import {
  generatePath,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router';

import { useHeader } from '@/app/providers/HeaderContext';
import { useCourseDetail } from '@/features/course/hooks/useCourseDetail';
import { useCourseReview } from '@/features/course/hooks/useCourseReview';
import { SHAPE_TYPE_COLOR } from '@/features/course/model/constants';
import CourseDetail from '@/features/course/ui/CourseDetail';
import CourseReview from '@/features/course/ui/CourseReview';
import { useLocationStore } from '@/features/map/model/location.store';
import { NaverMap } from '@/features/map/ui/NaverMap';
import { useToggleBookmark } from '@/features/user/hooks/useToggleBookmark';
import { Icon } from '@/shared/icons/icon';
import { runddyColor } from '@/shared/model/constants';
import { ShareButton } from '@/shared/ui/actions/ShareButton';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';
import { Button } from '@/shared/ui/primitives/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/shared/ui/primitives/tabs';

import type { Course } from '@/features/course/model/types';
import type { MarkerInput } from '@/features/map/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

const CourseInfo = () => {
  const navigate = useNavigate();
  const { setConfig, resetConfig } = useHeader();
  const courseDetailMapState = useLocationStore((s) => s.courseDetailMapState);
  const setCourseDetailMapState = useLocationStore(
    (s) => s.setCourseDetailMapState
  );
  const mapRef = useRef<naver.maps.Map | null>(null);
  const idleListenerRef = useRef<naver.maps.MapEventListener | null>(null);

  const { uuid } = useParams<{
    uuid: Course['uuid'];
  }>();
  const [params] = useSearchParams();
  const tab = params.get('tab') ?? 'detail';

  const { courseDetail: course, isLoading } = useCourseDetail(uuid ?? '');
  const { courseReviewCount } = useCourseReview(uuid ?? '');
  const { toggle, isSaving } = useToggleBookmark();

  // Check if we have saved state for this course
  const hasSavedState = courseDetailMapState?.courseUuid === course?.uuid;

  const handleMapInit = useCallback(
    (map: naver.maps.Map) => {
      mapRef.current = map;

      // Register idle event listener to save map state after fitBounds
      idleListenerRef.current = naver.maps.Event.addListener(
        map,
        'idle',
        () => {
          if (!course) return;
          const center = map.getCenter();
          setCourseDetailMapState({
            courseUuid: course.uuid,
            center: { lat: center.y, lng: center.x },
            zoom: map.getZoom()
          });
        }
      );
    },
    [course, setCourseDetailMapState]
  );

  // Cleanup idle listener on unmount
  useEffect(() => {
    return () => {
      if (idleListenerRef.current) {
        naver.maps.Event.removeListener(idleListenerRef.current);
        idleListenerRef.current = null;
      }
    };
  }, []);

  const handleMapClick = useCallback(() => {
    if (!course) return;
    navigate(generatePath('/course/:uuid/map', { uuid: course.uuid }));
  }, [course, navigate]);

  useEffect(() => {
    if (!course) return;

    setConfig({
      rightButton: (
        <ShareButton
          title={`${course.name} (${(course.totalDistance / 1000).toFixed(1)}km)`}
        />
      )
    });

    return () => resetConfig();
  }, [course, resetConfig, setConfig]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!course) {
    navigate('/');
    return null;
  }

  const activeColor: RUNDDY_COLOR = course
    ? SHAPE_TYPE_COLOR[course.shapeType]
    : 'blue';

  const startPoint = course.coursePointList[0];
  const startMarker: MarkerInput = {
    id: course.uuid,
    lat: startPoint?.lat,
    lng: startPoint?.lng,
    kind: 'start'
  };
  const endPoint = course.coursePointList[course.coursePointList.length - 1];
  const endMarker: MarkerInput = {
    id: `${course.uuid}__end`,
    lat: endPoint?.lat,
    lng: endPoint?.lng,
    kind: 'end'
  };

  const handleClickBookmark = () => {
    if (!uuid) return;
    toggle({ courseUuid: uuid, isBookmarked: !course.isBookmarked });
  };

  // Use saved state if available for this course
  const center = hasSavedState
    ? courseDetailMapState!.center
    : { lat: course.lat, lng: course.lng };
  const zoom = hasSavedState ? courseDetailMapState!.zoom : undefined;

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      <div className='relative'>
        <div className='h-78 px-5 pt-3'>
          <NaverMap
            key={`course-info-${course.uuid}`}
            center={center}
            zoom={zoom}
            points={course.coursePointList}
            bounds={{
              minLat: course.minLat,
              maxLat: course.maxLat,
              minLng: course.minLng,
              maxLng: course.maxLng
            }}
            markers={[startMarker, endMarker]}
            markerSize={32}
            focusKey={course.uuid}
            color={activeColor}
            fitEnabled={!hasSavedState}
            panEnabled={false}
            interactionsEnabled={false}
            onInit={handleMapInit}
            onOverlayClick={handleMapClick}
            className='h-full w-full rounded-xl'
          />
        </div>
      </div>

      <div className='space-y-1 px-5 pt-6 pb-7.5'>
        <div className='flex items-center justify-between gap-1'>
          <div className='text-title-b18 truncate'>
            {course?.name || '코스이름'}
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={handleClickBookmark}
            disabled={isSaving}
            aria-label='Bookmark toggle'
          >
            <Icon
              name={course.isBookmarked ? 'save_on_solid' : 'save_off_solid'}
              size={24}
            />
          </Button>
        </div>
        <div
          className='text-[32px] font-bold'
          style={{ color: runddyColor[activeColor] }}
        >
          {(course.totalDistance / 1000).toFixed(1)}km
        </div>
      </div>

      <Tabs defaultValue={tab}>
        <TabsList className='border-g-20 grid w-full grid-cols-2 border-b-[1.2px] px-5'>
          <TabsTrigger value='detail'>
            <span>상세정보</span>
          </TabsTrigger>
          <TabsTrigger value='review'>
            <span>리뷰</span>
            <span className='text-contents-r15 ml-1'>{courseReviewCount}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value='detail' className='mt-6'>
          <CourseDetail />
        </TabsContent>
        <TabsContent value='review' className='mt-2'>
          <CourseReview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseInfo;
