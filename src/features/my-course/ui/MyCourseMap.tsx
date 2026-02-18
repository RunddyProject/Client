import { memo, useCallback, useRef, useState } from 'react';

import { RegisterCourseFAB } from '@/features/course/ui/RegisterCourseFAB';
import { NaverMap } from '@/features/map/ui/NaverMap';
import { useCenteredActiveByScroll } from '@/shared/hooks/useCenteredActiveByScroll';
import { useScrollItemToCenter } from '@/shared/hooks/useScrollItemToCenter';

import { MyCourseInfoCard } from './MyCourseInfoCard';
import { MyCourseSummary } from './MyCourseSummary';
import { useMultiPolyline } from '../hooks/useMultiPolyline';
import { useUserCourseGpxList } from '../hooks/useUserCourseGpxList';
import { useUserCourseSummary } from '../hooks/useUserCourseSummary';

import type { UserCourse } from '../model/types';

interface MyCourseMapProps {
  courses: UserCourse[];
}

export function MyCourseMap({ courses }: MyCourseMapProps) {
  const [mapInstance, setMapInstance] = useState<naver.maps.Map | null>(null);
  const [, setActiveCourseUuid] = useState<string | null>(
    courses[0]?.uuid ?? null
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollerRefAsElement = scrollerRef as React.RefObject<HTMLElement>;

  const { data: summary } = useUserCourseSummary();
  const { gpxList } = useUserCourseGpxList(true);

  // Scroll to card when polyline is clicked
  const scrollToItem = useScrollItemToCenter(scrollerRefAsElement);
  const handlePolylineClick = useCallback(
    (courseUuid: string) => {
      setActiveCourseUuid(courseUuid);
      scrollToItem(courseUuid);
    },
    [scrollToItem]
  );

  // Multi-polyline rendering
  useMultiPolyline(mapInstance, gpxList, handlePolylineClick);

  // Sync scroll → active course
  useCenteredActiveByScroll({
    container: scrollerRefAsElement,
    itemAttr: 'uuid',
    onChange: setActiveCourseUuid
  });

  const handleMapInit = useCallback((map: naver.maps.Map) => {
    setMapInstance(map);
  }, []);

  return (
    <div className='absolute inset-0 overflow-hidden'>
      {/* Naver Map */}
      <NaverMap
        key='my-course-naver-map'
        className='absolute inset-0'
        glassTopOverlay
        onInit={handleMapInit}
      />

      {/* Controls Overlay */}
      <div className='pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+52px)] bottom-[env(safe-area-inset-bottom)] z-10 grid grid-rows-[auto_1fr] overflow-hidden'>
        {/* Summary stats overlay */}
        {summary && (
          <div className='pointer-events-auto px-5 pt-6'>
            <MyCourseSummary
              myCourseCount={summary.myCourseCount}
              myTotalDistance={summary.myTotalDistance}
            />
          </div>
        )}

        {/* Bottom area */}
        <div className='relative touch-none overflow-y-hidden'>
          <div className='absolute inset-x-0 bottom-0'>
            <div className='space-y-2 px-5 pb-5'>
              <div className='flex items-end justify-end'>
                {/* Register Course FAB */}
                <RegisterCourseFAB />
              </div>
            </div>

            {/* Course Cards */}
            <MyCourseCardsSection courses={courses} scrollerRef={scrollerRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

const MyCourseCardsSection = memo(function MyCourseCardsSection({
  courses,
  scrollerRef
}: {
  courses: UserCourse[];
  scrollerRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (courses.length === 0) return null;

  if (courses.length === 1) {
    return (
      <div className='px-4 pb-5'>
        <MyCourseInfoCard
          course={courses[0]}
          className='rounded-2xl px-5 py-4.5 shadow-xl'
        />
      </div>
    );
  }

  return (
    <div
      ref={scrollerRef}
      className='no-scrollbar pointer-events-auto flex touch-pan-x snap-x snap-mandatory [scroll-padding-right:16px] [scroll-padding-left:16px] gap-4 overflow-x-auto [overscroll-behavior-x:contain] px-4 pb-5'
      onPointerDown={(e) => e.stopPropagation()}
    >
      {courses.map((course) => (
        <div
          key={course.uuid}
          data-uuid={course.uuid}
          className='w-[85%] max-w-[420px] shrink-0 snap-center'
        >
          <MyCourseInfoCard
            course={course}
            className='rounded-2xl px-5 py-4.5 shadow-xl'
          />
        </div>
      ))}
    </div>
  );
});
