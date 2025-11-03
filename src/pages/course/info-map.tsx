import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { useCourseDetail } from '@/features/course/hooks/useCourseDetail';
import { SHAPE_TYPE_COLOR } from '@/features/course/model/constants';
import { NaverMap } from '@/features/map/ui/NaverMap';
import { runddyColor } from '@/shared/model/constants';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';

import type { Course } from '@/features/course/model/types';
import type { MarkerInput } from '@/features/map/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

function CourseInfoMap() {
  const navigate = useNavigate();

  const { uuid } = useParams<{ uuid: Course['uuid'] }>();

  const { courseDetail: course, isLoading } = useCourseDetail(uuid ?? '');

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

  return (
    <div className='relative h-[100dvh]'>
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
        className='h-full w-full'
      />
    </div>
  );
}

export default CourseInfoMap;
