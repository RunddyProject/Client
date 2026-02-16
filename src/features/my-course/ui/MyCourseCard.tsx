import { memo } from 'react';

import { useSanitizedSvg } from '@/features/course/hooks/useSanitizedSvg';
import CourseArtImageUrl from '@/shared/assets/course_art.png';
import CourseLinearImageUrl from '@/shared/assets/course_linear.png';
import CourseLoopImageUrl from '@/shared/assets/course_loop.png';
import CourseOutandbackImageUrl from '@/shared/assets/course_outandback.png';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/primitives/badge';

import type { UserCourse } from '@/features/my-course/model/types';

interface MyCourseCardProps {
  course: UserCourse;
  onClick?: () => void;
  className?: string;
}

const courseImageUrl: Record<string, string> = {
  LINEAR: CourseLinearImageUrl,
  LOOP: CourseLoopImageUrl,
  OUT_AND_BACK: CourseOutandbackImageUrl,
  ART: CourseArtImageUrl
};

export const MyCourseCard = memo(function MyCourseCard({
  course,
  onClick,
  className
}: MyCourseCardProps) {
  const sanitizedSvg = useSanitizedSvg(course.svg);

  const imageUrl = courseImageUrl[course.shapeType];

  return (
    <div
      className={cn(
        'bg-w-100 flex cursor-pointer items-center gap-4',
        className
      )}
      onClick={onClick}
    >
      {imageUrl ? (
        <div className='relative h-[60px] w-[60px] shrink-0'>
          <img src={imageUrl} width='60' height='60' className='rounded-xl' />
          <div
            className='absolute inset-0'
            dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
          />
        </div>
      ) : (
        <div className='bg-g-90 h-15 w-15 shrink-0 rounded-xl' />
      )}

      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <div className='text-title-b18 truncate'>{course.name}</div>
        <div className='no-scrollbar flex items-center gap-1 overflow-x-auto'>
          <Badge>{course.envTypeName}</Badge>
          <Badge>{(course.totalDistance / 1000).toFixed(1)}km</Badge>
          {course.isMarathon && <Badge>마라톤</Badge>}
        </div>
      </div>
    </div>
  );
});
