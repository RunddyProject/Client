import { useNavigate } from 'react-router';

import CourseArtImageUrl from '@/shared/assets/course_art.png';
import CourseLinearImageUrl from '@/shared/assets/course_linear.png';
import CourseLoopImageUrl from '@/shared/assets/course_loop.png';
import CourseOutandbackImageUrl from '@/shared/assets/course_outandback.png';
import { Icon } from '@/shared/icons/icon';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';

import type { Course } from '@/features/course/model/types';

interface CourseInfoCardProps {
  course: Course;
  className?: string;
}

const courseImageUrl = {
  LINEAR: CourseLinearImageUrl,
  LOOP: CourseLoopImageUrl,
  OUT_AND_BACK: CourseOutandbackImageUrl,
  ART: CourseArtImageUrl,
  ETC: ''
};

const CourseInfoCard = ({ course, className }: CourseInfoCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/course/${course.uuid}`);
  };

  return (
    <div
      className={cn(
        'flex cursor-pointer justify-between gap-4 bg-white',
        className
      )}
      onClick={handleClick}
    >
      {courseImageUrl[course.shapeType] ? (
        <div className='relative h-[60px] w-[60px]'>
          <img
            src={courseImageUrl[course.shapeType]}
            width='60'
            height='60'
            className='rounded-xl'
          />
          <div
            className='pointer-events-none absolute inset-0'
            dangerouslySetInnerHTML={{ __html: course.svg }}
          />
        </div>
      ) : (
        <div className='h-15 w-15 rounded-xl bg-gray-900' />
      )}

      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <div className='flex items-center justify-between gap-1'>
          <h3 className='text-md truncate font-semibold'>
            {course?.name || '코스이름'}
          </h3>
          <Button variant='ghost' className='h-6 w-6 p-0'>
            <Icon
              name={course.isBookmarked ? 'save_on_solid' : 'save_off_solid'}
              size={24}
            />
          </Button>
        </div>
        <div className='flex items-center gap-1 overflow-x-auto text-sm'>
          <Badge>Lv. {course?.grade || 1}</Badge>
          <Badge>{course?.envTypeName || '공원'}</Badge>
          <Badge>{((course?.totalDistance || 5000) / 1000).toFixed(0)}km</Badge>
        </div>
      </div>
    </div>
  );
};

export default CourseInfoCard;
