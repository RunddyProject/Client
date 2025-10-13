import { useCourses } from '@/features/course/hooks/useCourses';
import CourseFilter from '@/features/course/ui/Filter';
import CourseInfoCard from '@/features/course/ui/InfoCard';
import { Icon } from '@/shared/icons/icon';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';

interface CourseListProps {
  onViewModeChange: () => void;
}

// TODO: revalidate courses when CourseMap courses change
const CourseList = ({ onViewModeChange }: CourseListProps) => {
  const { courses } = useCourses();

  return (
    <div className='bg-background flex min-h-screen flex-col px-5 pt-[calc(env(safe-area-inset-top)+52px)]'>
      {/* <div className='left-0 right-0 bottom-0 z-10 pointer-events-none flex flex-col top-[calc(env(safe-area-inset-top)+52px)]'> */}
      {/* Search bar */}
      <div className='pointer-events-auto pt-[calc(env(safe-area-inset-top)+12px)]'>
        <div className='relative'>
          <Icon
            name='search'
            size={24}
            className='absolute top-1/2 left-4 -translate-y-1/2'
          />
          <Input placeholder='원하는 지역 검색' className='bg-gray-100 pl-13' />
        </div>
      </div>

      <div className='overflow-y-auto'>
        {/* Filter */}
        <div className='mt-3 overflow-x-auto'>
          <CourseFilter />
        </div>

        {/* Course List */}
        <div>
          {courses.map((course) => (
            <CourseInfoCard
              key={course.uuid}
              course={course}
              className='border-b border-b-gray-200 py-5.5 last:border-0'
            />
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className='fixed bottom-5 left-1/2 z-50 -translate-x-1/2 transform'>
        <Button
          className='rounded-full px-6 shadow-lg'
          onClick={onViewModeChange}
        >
          <Icon name='map' size={20} color='#E7E9F0' secondary='#272930' />
          지도 보기
        </Button>
      </div>
    </div>
    // </div>
  );
};

export default CourseList;
