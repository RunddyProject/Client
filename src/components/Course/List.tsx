import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import CourseInfoCard from '@/components/Course/InfoCard';
import CourseDropdownMenu, { type SortType } from '@/components/Course/DropdownMenu';
import CourseFilter from '@/components/Course/Filter';
import { useCourses } from '@/hooks/useCourses';

interface CourseListProps {
  onViewModeChange: () => void;
}

const CourseList = ({ onViewModeChange }: CourseListProps) => {
  const { courses } = useCourses();
  const [sortBy, setSortBy] = useState<SortType>('distance');

  const handleChange = (value: SortType) => {
    // TODO: API
    setSortBy(value);
    toast('정렬 기능은 준비중입니다');
  };

  return (
    <div className='min-h-screen flex flex-col bg-background px-5 pt-[calc(env(safe-area-inset-top)+52px)]'>
      {/* <div className='left-0 right-0 bottom-0 z-10 pointer-events-none flex flex-col top-[calc(env(safe-area-inset-top)+52px)]'> */}
      {/* Search bar */}
      <div className='pt-[calc(env(safe-area-inset-top)+12px)] pointer-events-auto'>
        <div className='relative'>
          <Icon name='search' size={24} className='absolute left-4 top-1/2 -translate-y-1/2' />
          <Input placeholder='원하는 지역 검색' className='pl-13 bg-gray-100' />
        </div>
      </div>

      <div className='overflow-y-auto'>
        {/* Filter */}
        <div className='flex items-center gap-3 mt-3'>
          <CourseDropdownMenu checkedValue={sortBy} onCheckedChange={handleChange} />
          <span className='text-gray-200'>|</span>
          <CourseFilter initialCount={courses.length} />
        </div>

        {/* Course List */}
        <div>
          {courses.map((course) => (
            <CourseInfoCard
              key={course.courseUuid}
              course={course}
              className='py-5.5 border-b border-b-gray-200 last:border-0'
            />
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className='absolute bottom-5 left-1/2 transform -translate-x-1/2'>
        <Button className='rounded-full px-6 shadow-lg' onClick={onViewModeChange}>
          <Icon name='map' size={20} color='#E7E9F0' secondary='#272930' />
          지도 보기
        </Button>
      </div>
    </div>
    // </div>
  );
};

export default CourseList;
