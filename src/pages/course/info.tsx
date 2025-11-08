import { useEffect } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { useHeader } from '@/app/providers/HeaderContext';
import { useCourseDetail } from '@/features/course/hooks/useCourseDetail';
import { useCourseReview } from '@/features/course/hooks/useCourseReview';
import { useToggleBookmark } from '@/features/course/hooks/useToggleBookmark';
import { SHAPE_TYPE_COLOR } from '@/features/course/model/constants';
import CourseDetail from '@/features/course/ui/CourseDetail';
import CourseReview from '@/features/course/ui/CourseReview';
import { NaverMap } from '@/features/map/ui/NaverMap';
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

  const { uuid } = useParams<{
    uuid: Course['uuid'];
  }>();

  const { courseDetail: course, isLoading } = useCourseDetail(uuid ?? '');
  const { courseReviewCount } = useCourseReview(uuid ?? '');
  const { toggle, isSaving } = useToggleBookmark();

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
    toast.error('코스 불러오기 실패');
    navigate('/');
    return null;
  }

  const activeColor: RUNDDY_COLOR = course
    ? SHAPE_TYPE_COLOR[course.shapeType]
    : runddyColor['blue'];

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

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      <div className='relative'>
        <div className='h-78 px-5 pt-3'>
          <NaverMap
            center={{ lat: course.lat, lng: course.lng }}
            points={course.coursePointList}
            bounds={{
              minLat: course.minLat,
              maxLat: course.maxLat,
              minLng: course.minLng,
              maxLng: course.maxLng
            }}
            markers={[startMarker, endMarker]}
            focusKey={course.uuid}
            color={activeColor}
            fitEnabled
            interactionsEnabled={false}
            onOverlayClick={() =>
              navigate(generatePath('/course/:uuid/map', { uuid: course.uuid }))
            }
            className='h-full w-full rounded-xl'
          />
        </div>
      </div>

      <div className='space-y-1 px-5 pt-6 pb-7.5'>
        <div className='flex items-center justify-between gap-1'>
          <h3 className='text-md truncate font-semibold'>
            {course?.name || '코스이름'}
          </h3>
          <Button
            variant='ghost'
            className='h-6 w-6 p-0'
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
        <div className='text-blue text-3xl font-bold'>
          {(course.totalDistance / 1000).toFixed(1)}km
        </div>
      </div>

      <Tabs defaultValue='detail'>
        <TabsList className='grid w-full grid-cols-2 border-b-[1.2px] border-gray-200 px-5'>
          <TabsTrigger value='detail'>상세정보</TabsTrigger>
          <TabsTrigger value='review'>
            <span>리뷰</span>
            <span className='font-regular ml-1 text-sm'>
              {courseReviewCount}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value='detail' className='mt-6'>
          <CourseDetail />
        </TabsContent>
        <TabsContent value='review' className='mt-7'>
          <CourseReview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseInfo;
