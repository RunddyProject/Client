import { memo } from 'react';
import { useNavigate } from 'react-router';

import { useSanitizedSvg } from '@/features/course/hooks/useSanitizedSvg';
import CourseArtImageUrl from '@/shared/assets/course_art.png';
import CourseLinearImageUrl from '@/shared/assets/course_linear.png';
import CourseLoopImageUrl from '@/shared/assets/course_loop.png';
import CourseOutandbackImageUrl from '@/shared/assets/course_outandback.png';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/primitives/badge';

import type { UserCourse } from '../model/types';

interface MyCourseInfoCardProps {
  course: UserCourse;
  onClick?: VoidFunction;
  className?: string;
}

const courseImageUrl: Record<string, string> = {
  LINEAR: CourseLinearImageUrl,
  LOOP: CourseLoopImageUrl,
  OUT_AND_BACK: CourseOutandbackImageUrl,
  ART: CourseArtImageUrl
};

export const MyCourseInfoCard = memo(function MyCourseInfoCard({
  course,
  onClick,
  className
}: MyCourseInfoCardProps) {
  const navigate = useNavigate();
  const sanitizedSvg = useSanitizedSvg(course.svg);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    navigate(`/course/${course.uuid}`, { state: { isUserCourse: true } });
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'bg-w-100 pointer-events-auto flex cursor-pointer items-center gap-4',
        className
      )}
    >
      {/* SVG thumbnail */}
      {courseImageUrl[course.shapeType] ? (
        <div className='relative h-[60px] w-[60px] shrink-0'>
          <img
            src={courseImageUrl[course.shapeType]}
            width='60'
            height='60'
            className='rounded-xl'
          />
          <div
            className='absolute inset-0'
            dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
          />
        </div>
      ) : (
        <div className='bg-g-90 h-15 w-15 shrink-0 rounded-xl' />
      )}

      {/* Course info */}
      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <div className='text-title-b18 truncate'>
          {course.name || '코스이름'}
        </div>
        <div className='no-scrollbar flex items-center gap-1 overflow-x-auto'>
          <Badge>{course.envTypeName}</Badge>
          <Badge>{(course.totalDistance / 1000).toFixed(1)}km</Badge>
          {course.isMarathon && <Badge>마라톤</Badge>}
        </div>
      </div>
    </div>
  );
});
