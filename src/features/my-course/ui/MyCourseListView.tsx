import { useNavigate } from 'react-router';

import { MyCourseCard } from '@/features/my-course/ui/MyCourseCard';
import { MyCourseEmpty } from '@/features/my-course/ui/MyCourseEmpty';

import type { UserCourse } from '@/features/my-course/model/types';

interface MyCourseListViewProps {
  courses: UserCourse[];
}

export function MyCourseListView({ courses }: MyCourseListViewProps) {
  const navigate = useNavigate();

  if (courses.length === 0) {
    return <MyCourseEmpty />;
  }

  return (
    <div className='px-5'>
      {courses.map((course) => (
        <MyCourseCard
          key={course.uuid}
          course={course}
          onClick={() => navigate(`/my-courses/${course.uuid}`)}
          className='border-b-g-20 border-b py-5.5 last:border-0'
        />
      ))}
    </div>
  );
}
