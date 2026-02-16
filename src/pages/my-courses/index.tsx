import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import { useUserCourseGpx } from '@/features/my-course/hooks/useUserCourseGpx';
import { useUserCourses } from '@/features/my-course/hooks/useUserCourses';
import { useUserCourseSummary } from '@/features/my-course/hooks/useUserCourseSummary';
import { MyCourseEmpty } from '@/features/my-course/ui/MyCourseEmpty';
import { MyCourseListView } from '@/features/my-course/ui/MyCourseListView';
import { MyCourseMapView } from '@/features/my-course/ui/MyCourseMapView';
import { MyCourseStats } from '@/features/my-course/ui/MyCourseStats';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';
import { Button } from '@/shared/ui/primitives/button';
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/ui/primitives/toggle-group';

type ViewMode = 'map' | 'list';

function MyCourses() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('map');

  const { myCourseCount, myTotalDistance, isLoading: isSummaryLoading } =
    useUserCourseSummary();
  const { courseList, isLoading: isCoursesLoading } = useUserCourses();
  const {
    gpxList,
    isLoading: isGpxLoading,
    isFetching: isGpxFetching
  } = useUserCourseGpx(viewMode === 'map');

  const handleViewModeChange = (value: string) => {
    if (value) setViewMode(value as ViewMode);
  };

  const handleCourseClick = useCallback(
    (courseUuid: string) => {
      navigate(`/my-courses/${courseUuid}`);
    },
    [navigate]
  );

  const handleRegister = () => {
    navigate('/course/upload');
  };

  const isLoading = isSummaryLoading || isCoursesLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const isEmpty = myCourseCount === 0;

  return (
    <div className='bg-background flex min-h-dvh flex-col pb-24'>
      {isEmpty ? (
        <MyCourseEmpty />
      ) : (
        <>
          {/* View Mode Toggle */}
          <div className='flex justify-center px-5 pt-3'>
            <ToggleGroup
              type='single'
              value={viewMode}
              onValueChange={handleViewModeChange}
            >
              <ToggleGroupItem value='map'>지도보기</ToggleGroupItem>
              <ToggleGroupItem value='list'>목록보기</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Stats Bar */}
          <MyCourseStats
            courseCount={myCourseCount}
            totalDistance={myTotalDistance}
          />

          {/* Content */}
          {viewMode === 'map' ? (
            <MyCourseMapView
              gpxList={gpxList}
              isLoading={isGpxLoading || isGpxFetching}
              onCourseClick={handleCourseClick}
            />
          ) : (
            <MyCourseListView courses={courseList} />
          )}
        </>
      )}

      {/* CTA Button - Fixed at bottom */}
      <div className='bg-w-100 fixed right-0 bottom-0 left-0 mx-auto max-w-xl p-5'>
        <Button size='lg' className='w-full' onClick={handleRegister}>
          코스 등록하기
        </Button>
      </div>
    </div>
  );
}

export default MyCourses;
