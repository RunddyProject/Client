import { useRef, useCallback } from 'react';

import { RegisterCourseFAB } from '@/features/course/ui/RegisterCourseFAB';
import { useVirtualScroll } from '@/shared/hooks/useVirtualScroll';
import { Icon } from '@/shared/icons/icon';

import { MyCourseInfoCard } from './MyCourseInfoCard';
import { MyCourseSummary } from './MyCourseSummary';
import { useUserCourseSummary } from '../hooks/useUserCourseSummary';

import type { UserCourse } from '../model/types';

const ITEM_HEIGHT = 105;

interface MyCourseListProps {
  courses: UserCourse[];
}

export function MyCourseList({ courses }: MyCourseListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data: summary } = useUserCourseSummary();

  const { visibleItems, totalSize, virtualizer } = useVirtualScroll(
    scrollContainerRef,
    {
      itemCount: courses.length,
      itemSize: ITEM_HEIGHT,
      overscan: 3,
      orientation: 'vertical'
    }
  );

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
      {/* Scrollable content */}
      <div
        ref={scrollContainerRef}
        className='no-scrollbar flex-1 touch-pan-y overflow-y-auto pt-3'
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Summary stats */}
        {summary && (
          <div className='pt-3 pb-[30px]'>
            <MyCourseSummary
              myCourseCount={summary.myCourseCount}
              myTotalDistance={summary.myTotalDistance}
              className='bg-g-10'
            />
          </div>
        )}

        {/* Course list - virtualized */}
        {visibleItems.length > 0 ? (
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
                  <MyCourseInfoCard
                    course={course}
                    className={`border-b-g-20 h-full border-b py-5.5 ${isFirst ? 'pt-0' : ''} ${isLast ? 'border-0' : ''}`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className='flex flex-col items-center space-y-4 pt-[128px]'>
            <Icon name='empty_graphic' size={100} />
            <div className='text-placeholder'>등록된 코스가 없어요</div>
          </div>
        )}
      </div>
      {/* Register Course FAB */}
      <div className='fixed right-5 bottom-[calc(env(safe-area-inset-bottom)+20px)] z-50'>
        <RegisterCourseFAB />
      </div>
    </div>
  );
}
