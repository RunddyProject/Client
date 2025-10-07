import { useState } from 'react';

import { useCourses } from '@/features/course/hooks/useCourses';
import CourseFilter from '@/features/course/ui/Filter';
import CourseInfoCard from '@/features/course/ui/InfoCard';
import { useGeolocation } from '@/features/map/hooks/useGeolocation';
import { useLocationStore } from '@/features/map/model/location.store';
import { NaverMap } from '@/features/map/ui/NaverMap';
import { Icon } from '@/shared/icons/icon';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';

interface CourseMapProps {
  onViewModeChange: () => void;
}

const CourseMap = ({ onViewModeChange }: CourseMapProps) => {
  const { userLocation, isLocationLoading } = useLocationStore();
  const { getCurrentLocation } = useGeolocation();

  const { courses } = useCourses(userLocation);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(
    courses[0]?.uuid ?? null
  );
  // const activeCourse = courses.find((c) => c.uuid === activeCourseId) ?? courses[0];

  // TODO: set userLocation when activeCourseId changes
  const handleActiveCourseId = (uuid: string) => {
    setActiveCourseId(uuid);
  };

  return (
    <div className='relative h-[100dvh]'>
      <NaverMap
        className='absolute inset-0'
        center={userLocation}
        markers={courses.map((c) => ({
          id: c.uuid,
          lat: c.lat,
          lng: c.lng
        }))}
        focusKey={activeCourseId ?? undefined}
        onMarkerClick={handleActiveCourseId}
      />

      {/* TODO: add button 현재 위치에서 검색 */}

      <div className='pointer-events-none absolute top-[calc(env(safe-area-inset-top)+52px)] right-0 bottom-0 left-0 z-10 grid grid-rows-[auto_1fr_auto]'>
        {/* Search bar */}
        <div className='pointer-events-auto px-5 pt-[calc(env(safe-area-inset-top)+12px)]'>
          <div className='relative'>
            <Icon
              name='search'
              size={24}
              className='absolute top-1/2 left-4 -translate-y-1/2'
            />
            <Input
              placeholder='원하는 지역 검색'
              className='bg-white pl-13'
              onClick={onViewModeChange}
              readOnly
            />
          </div>
        </div>

        {/* Filter */}
        <div className='mt-3 px-5'>
          <CourseFilter initialCount={courses.length} />
        </div>

        {/* Bottom */}
        <div className='space-y-2 px-5 pb-[calc(env(safe-area-inset-bottom)+20px)]'>
          {/* Controls */}
          <div className='flex items-end justify-between'>
            <div className='flex flex-col gap-2'>
              {/* <Button
                size='icon'
                variant='secondary'
                className='rounded-full w-9.5 h-9.5 shadow-lg bg-white'
                onClick={handleWeather}
              >
                <Icon name='weather' size={24} />
              </Button> */}
              <Button
                size='icon'
                variant='secondary'
                disabled={isLocationLoading}
                className='pointer-events-auto h-9.5 w-9.5 rounded-full bg-white shadow-lg'
                onClick={getCurrentLocation}
              >
                <Icon name='my_location' size={24} />
              </Button>
            </div>

            <Button
              variant='secondary'
              className='pointer-events-auto rounded-full bg-white px-3 shadow-lg'
              onClick={onViewModeChange}
            >
              <Icon
                name='list'
                size={20}
                color='currentColor'
                className='text-gray-600'
              />
              목록 보기
            </Button>
          </div>
        </div>

        {/* Course info card */}
        {courses.length === 0 && (
          <div className='px-4 pb-5'>
            <div className='flex [touch-action:none] gap-4 rounded-2xl bg-white p-5 shadow-xl'>
              <div className='bg-muted/60 flex h-12 w-12 items-center justify-center rounded-xl'>
                course
              </div>
              <div className='flex-1'>
                <p className='font-semibold'>조건에 맞는 코스가 없어요</p>
                <p className='text-muted-foreground text-sm'>
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
                className='w-[85%] max-w-[420px] shrink-0 snap-start'
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
