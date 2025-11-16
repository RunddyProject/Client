import { useNavigate } from 'react-router';

import { GRADE_TO_NAME } from '@/features/course/model/constants';
import { useToggleBookmark } from '@/features/user/hooks/useToggleBookmark';
import CourseArtImageUrl from '@/shared/assets/course_art.png';
import CourseLinearImageUrl from '@/shared/assets/course_linear.png';
import CourseLoopImageUrl from '@/shared/assets/course_loop.png';
import CourseOutandbackImageUrl from '@/shared/assets/course_outandback.png';
import { Icon } from '@/shared/icons/icon';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';

import type { Course, GradeType } from '@/features/course/model/types';

interface CourseInfoCardProps {
  course: Course;
  onClick?: VoidFunction;
  className?: string;
}

const courseImageUrl = {
  LINEAR: CourseLinearImageUrl,
  LOOP: CourseLoopImageUrl,
  OUT_AND_BACK: CourseOutandbackImageUrl,
  ART: CourseArtImageUrl,
  ETC: ''
};

const CourseInfoCard = ({
  course,
  onClick,
  className
}: CourseInfoCardProps) => {
  const navigate = useNavigate();
  const { toggle, isSaving } = useToggleBookmark();

  const handleClick = () => {
    navigate(`/course/${course.uuid}`);
  };

  const handleClickBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle({ courseUuid: course.uuid, isBookmarked: !course.isBookmarked });
  };

  return (
    <div
      className={cn(
        'bg-w-100 pointer-events-auto flex cursor-pointer items-center justify-between gap-4',
        className
      )}
      onClick={onClick ?? handleClick}
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
            className='absolute inset-0'
            dangerouslySetInnerHTML={{ __html: course.svg }}
          />
        </div>
      ) : (
        <div className='bg-g-90 h-15 w-15 rounded-xl' />
      )}

      <div className='flex min-w-0 flex-1 flex-col gap-2 py-1'>
        <div className='flex items-center justify-between gap-1'>
          <div className='text-title-b18 truncate'>
            {course?.name || '코스이름'}
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={handleClickBookmark}
            disabled={isSaving}
            aria-label='Bookmark toggle'
          >
            <Icon
              name={course.isBookmarked ? 'save_on_solid' : 'save_off_solid'}
              size={24}
            />
          </Button>
        </div>
        <div className='flex items-center gap-1 overflow-x-auto'>
          <Badge>{GRADE_TO_NAME[(course?.grade || 1) as GradeType]}</Badge>
          <Badge>{course?.envTypeName || '공원'}</Badge>
          <Badge>{((course?.totalDistance || 5000) / 1000).toFixed(1)}km</Badge>
        </div>
      </div>
    </div>
  );
};

export default CourseInfoCard;
