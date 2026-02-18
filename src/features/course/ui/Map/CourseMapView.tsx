/**
 * CourseMapView - Presentational component for the Course Map
 *
 * This component is purely responsible for rendering the UI.
 * All business logic is handled by useCourseMapContainer hook.
 *
 * Performance Optimization:
 * - Wrapped with React.memo for shallow prop comparison
 * - Receives FLAT props (not nested objects) from Container
 * - This ensures memo works correctly - object identity doesn't change
 *   when individual values don't change
 *
 * Features:
 * - NaverMap with markers and polyline
 * - Search button (when map is moved)
 * - Search and filter controls
 * - Course card scroller
 * - Control buttons (location, list view)
 */

import { memo } from 'react';

import CourseFilter from '@/features/course/ui/Filter';
import CourseInfoCard from '@/features/course/ui/InfoCard';
import Search from '@/features/course/ui/Search';
import { NaverMap } from '@/features/map/ui/NaverMap';
import { Icon } from '@/shared/icons/icon';
import { Button } from '@/shared/ui/primitives/button';

import type { CourseMapViewProps } from '@/features/course/model/refactor-types';

/**
 * CourseMapView - Pure presentational component with React.memo
 *
 * Receives FLAT props (spread from grouped data in Container).
 * This ensures React.memo's shallow comparison works correctly.
 *
 * @param props - Flat view props from CourseMapContainer
 *
 * @example
 * ```tsx
 * // In CourseMapContainer:
 * <CourseMapView
 *   {...data}       // courses, activeCourseId, markers, etc.
 *   {...status}     // isFetching, isLocationLoading, showSearchButton
 *   {...mapConfig}  // initialCenter, initialZoom
 *   scrollerRef={refs.scrollerRef}
 *   handlers={handlers}
 * />
 * ```
 */
export const CourseMapView = memo(function CourseMapView({
  // Data (spread from data group)
  courses,
  activeCourseId,
  displayPoints,
  markers,
  activeColor,
  // Status (spread from status group)
  isFetching,
  isLocationLoading,
  showSearchButton,
  // Map config (spread from mapConfig group)
  initialCenter,
  initialZoom,
  // Refs
  scrollerRef,
  // Handlers
  handlers
}: CourseMapViewProps) {
  return (
    <div className='absolute inset-0 overflow-hidden'>
      {/* Naver Map */}
      <NaverMap
        key='runddy-naver-map'
        className='absolute inset-0'
        glassTopOverlay
        center={initialCenter ?? undefined}
        zoom={initialZoom}
        points={displayPoints}
        color={activeColor}
        markers={markers}
        focusKey={activeCourseId ?? undefined}
        fitEnabled={false}
        panEnabled={false}
        onInit={handlers.onMapInit}
        onMarkerClick={handlers.onMarkerClick}
      />

      {/* Search Here Button */}
      {showSearchButton && (
        <div className='fixed top-[calc(env(safe-area-inset-top)+178px)] left-1/2 z-50 -translate-x-1/2 transform'>
          <Button
            className='shadow-runddy gap-1.5 rounded-full px-3 py-2'
            onClick={handlers.onSearchHere}
            disabled={isFetching}
          >
            <Icon
              name='refresh'
              size={20}
              color={!isFetching ? 'var(--g-20)' : 'var(--text-placeholder)'}
              secondary='var(--g-90)'
            />
            현재 위치에서 검색
          </Button>
        </div>
      )}

      {/* Controls Overlay */}
      <div className='pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+52px)] bottom-[env(safe-area-inset-bottom)] z-10 grid grid-rows-[auto_auto_1fr] overflow-hidden'>
        {/* Search */}
        <div className='pointer-events-auto touch-none px-5 pt-3'>
          <Search className='shadow-runddy' />
        </div>

        {/* Filter */}
        <div className='no-scrollbar pointer-events-auto mt-3 touch-pan-x overflow-x-auto px-5'>
          <CourseFilter className='bg-w-100 shadow-runddy' />
        </div>

        {/* Bottom area - Controls and Course Cards */}
        <div className='relative touch-none overflow-y-hidden'>
          <div className='absolute inset-x-0 bottom-0'>
            <div className='space-y-2 px-5 pb-5'>
              <div className='flex items-end justify-between'>
                <div className='flex flex-col gap-2'>
                  {/* My Location Button */}
                  <Button
                    size='icon'
                    variant='secondary'
                    disabled={isLocationLoading}
                    className='shadow-runddy bg-w-100 pointer-events-auto h-9.5 w-9.5 rounded-full'
                    onClick={handlers.onSearchByCurrentLocation}
                  >
                    <Icon
                      name='my_location'
                      size={24}
                      color='currentColor'
                      className='text-g-60'
                    />
                  </Button>
                </div>

                {/* List View Button */}
                <Button
                  className='shadow-runddy bg-w-100 pointer-events-auto gap-1 rounded-full px-3'
                  onClick={() => handlers.onViewModeChange('list')}
                >
                  <Icon
                    name='list'
                    size={20}
                    color='currentColor'
                    className='text-g-60'
                  />
                  <span className='text-sec text-contents-r-14'>목록 보기</span>
                </Button>
              </div>
            </div>

            {/* Course Cards */}
            <CourseCardsSection courses={courses} scrollerRef={scrollerRef} />
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * CourseCardsSection - Renders the course cards based on count
 *
 * Memoized to prevent re-renders when parent re-renders with unchanged courses.
 */
const CourseCardsSection = memo(function CourseCardsSection({
  courses,
  scrollerRef
}: Pick<CourseMapViewProps, 'courses' | 'scrollerRef'>) {
  // Empty state
  if (courses.length === 0) {
    return (
      <div className='px-5 pb-5'>
        <div className='bg-w-100 pointer-events-auto flex items-center gap-4 rounded-2xl px-5 py-4.5 shadow-xl'>
          <Icon name='no_course' size={60} />
          <div className='flex flex-col space-y-1'>
            <div className='text-title-b18'>조건에 맞는 코스가 없어요</div>
            <div className='text-ter text-contents-r14'>
              설정된 필터를 변경해 보세요
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single course
  if (courses.length === 1) {
    return (
      <div className='px-4 pb-5'>
        <CourseInfoCard
          course={courses[0]}
          className='rounded-2xl px-5 py-4.5 shadow-xl'
        />
      </div>
    );
  }

  // Multiple courses - horizontal scroller
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
          <CourseInfoCard
            course={course}
            className='rounded-2xl px-5 py-4.5 shadow-xl'
          />
        </div>
      ))}
    </div>
  );
});

export default CourseMapView;