import { useRef, useEffect } from 'react';

import { useCourses } from '@/features/course/hooks/useCourses';
import CourseFilter from '@/features/course/ui/Filter';
import CourseInfoCard from '@/features/course/ui/InfoCard';
import Search from '@/features/course/ui/Search';
import { useLocationStore } from '@/features/map/model/location.store';
import { Icon } from '@/shared/icons/icon';
import { Button } from '@/shared/ui/primitives/button';

interface CourseListProps {
  onViewModeChange: (mode: 'map' | 'list') => void;
}

const CourseList = ({ onViewModeChange }: CourseListProps) => {
  const {
    lastSearchedCenter,
    lastSearchedRadius,
    lastListScrollPosition,
    setLastListScrollPosition
  } = useLocationStore();
  const { courses } = useCourses({
    userLocation: lastSearchedCenter,
    radius: lastSearchedRadius
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current && lastListScrollPosition > 0) {
      scrollContainerRef.current.scrollTop = lastListScrollPosition;
    }
  }, [lastListScrollPosition]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setLastListScrollPosition(scrollTop);
  };

  return (
    <div className='flex h-dvh flex-col overflow-hidden px-5 pt-[calc(env(safe-area-inset-top)+52px)]'>
      {/* Search bar */}
      <div className='pointer-events-auto pt-3'>
        <Search className='bg-g-10' />
      </div>

      {/* Filter */}
      <div className='no-scrollbar mt-3 mb-5.5 overflow-x-auto'>
        <CourseFilter />
      </div>

      {/* Course List */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className='no-scrollbar flex-1 overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+80px)]'
      >
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseInfoCard
              key={course.uuid}
              course={course}
              className='border-b-g-20 border-b py-5.5 first:pt-0 last:border-0'
            />
          ))
        ) : (
          <div className='flex flex-col items-center space-y-4 pt-[150px]'>
            <Icon name='empty_graphic' size={100} />
            <div className='text-placeholder'>조건에 맞는 코스가 없어요</div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className='fixed bottom-[calc(env(safe-area-inset-bottom)+20px)] left-1/2 z-50 -translate-x-1/2 transform'>
        <Button
          className='shadow-runddy gap-1 rounded-full px-3 py-[9px]'
          onClick={() => onViewModeChange('map')}
        >
          <Icon name='map' size={20} color='#E7E9F0' secondary='#272930' />
          <span className='text-contents-r14'>지도 보기</span>
        </Button>
      </div>
    </div>
    // </div>
  );
};

export default CourseList;
