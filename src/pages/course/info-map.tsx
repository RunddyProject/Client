import { useNavigate, useParams } from 'react-router';

import { useCourseDetail } from '@/features/course/hooks/useCourseDetail';
import { SHAPE_TYPE_COLOR } from '@/features/course/model/constants';
import { useLocationStore } from '@/features/map/model/location.store';
import { NaverMap } from '@/features/map/ui/NaverMap';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';

import type { Course } from '@/features/course/model/types';
import type { MarkerInput } from '@/features/map/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

function CourseInfoMap() {
  const navigate = useNavigate();

  const { uuid } = useParams<{ uuid: Course['uuid'] }>();

  const { courseDetail: course, isLoading } = useCourseDetail(uuid ?? '');

  // Get saved map state from info page transition
  const courseDetailMapState = useLocationStore((s) => s.courseDetailMapState);

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

  // Use saved state if available for this course (seamless transition from info page)
  const hasSavedState = courseDetailMapState?.courseUuid === course.uuid;
  const center = hasSavedState
    ? courseDetailMapState.center
    : { lat: course.lat, lng: course.lng };
  const zoom = hasSavedState ? courseDetailMapState.zoom : undefined;

  return (
    <div className='relative h-[100dvh]'>
      <NaverMap
        key={`course-info-map-${course.uuid}`}
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
        focusKey={course.uuid}
        color={activeColor}
        fitEnabled={!hasSavedState}
        className='h-full w-full'
      />
    </div>
  );
}

export default CourseInfoMap;
