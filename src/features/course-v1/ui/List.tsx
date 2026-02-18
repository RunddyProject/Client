import { useRef, useEffect, useCallback } from 'react';

import { useCourses } from '@/features/course-v1/hooks/useCourses';
import CourseFilter from '@/features/course-v1/ui/Filter';
import CourseInfoCard from '@/features/course-v1/ui/InfoCard';
import { RegisterCourseFAB } from '@/features/course-v1/ui/RegisterCourseFAB';
import Search from '@/features/course-v1/ui/Search';
import { useLocationStore } from '@/features/map/model/location.store';
import { useVirtualScroll } from '@/shared/hooks/useVirtualScroll';
import { Icon } from '@/shared/icons/icon';

// Card height: 60px (image) + 22px (top padding) + 22px (bottom padding) + 1px (border)
const ITEM_HEIGHT = 105;

const CourseList = () => {
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

  const { visibleItems, totalSize, virtualizer } = useVirtualScroll(
    scrollContainerRef,
    {
      itemCount: courses.length,
      itemSize: ITEM_HEIGHT,
      overscan: 3,
      orientation: 'vertical'
    }
  );

  // Restore scroll position on mount
  useEffect(() => {
    if (scrollContainerRef.current && lastListScrollPosition > 0) {
      scrollContainerRef.current.scrollTop = lastListScrollPosition;
    }
  }, [lastListScrollPosition]);

  // Save scroll position on scroll
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      setLastListScrollPosition(scrollContainerRef.current.scrollTop);
    }
  }, [setLastListScrollPosition]);

  // Measure items after render for dynamic sizing
  const measureElement = useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        virtualizer.measureElement(element);
      }
    },
    [virtualizer]
  );

  return (
    <div className='flex h-dvh flex-col overflow-hidden px-5 pt-[calc(env(safe-area-inset-top)+52px)]'>
      {/* Search bar */}
      <div className='pointer-events-auto touch-none pt-3'>
        <Search className='bg-g-10' />
      </div>

      {/* Filter */}
      <div className='no-scrollbar mt-3 mb-5.5 touch-pan-x overflow-x-auto'>
        <CourseFilter />
      </div>

      {/* Course List - Virtualized */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className='no-scrollbar flex-1 touch-pan-y overflow-y-auto'
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {courses.length > 0 ? (
          <div
            className='relative w-full pb-[calc(env(safe-area-inset-bottom)+80px)]'
            style={{ height: totalSize }}
          >
            {visibleItems.map((virtualItem) => {
              const course = courses[virtualItem.index];
              const isFirst = virtualItem.index === 0;
              const isLast = virtualItem.index === courses.length - 1;

              return (
                <div
                  key={course.uuid}
                  ref={measureElement}
                  data-index={virtualItem.index}
                  className='absolute left-0 w-full'
                  style={{
                    top: virtualItem.start,
                    height: `${virtualItem.size}px`
                  }}
                >
                  <CourseInfoCard
                    course={course}
                    className={`border-b-g-20 h-full border-b py-5.5 ${isFirst ? 'pt-0' : ''} ${isLast ? 'border-0' : ''}`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className='flex flex-col items-center space-y-4 pt-[150px]'>
            <Icon name='empty_graphic' size={100} />
            <div className='text-placeholder'>조건에 맞는 코스가 없어요</div>
          </div>
        )}
      </div>

      {/* Register Course FAB */}
      <div className='fixed right-5 bottom-[calc(env(safe-area-inset-bottom)+20px)] z-50'>
        <RegisterCourseFAB />
      </div>
    </div>
  );
};

export default CourseList;
