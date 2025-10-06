// import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { type Course } from '@/lib/api/course.api';
import CourseLinearImageUrl from '@/assets/course_linear.png';
import CourseLoopImageUrl from '@/assets/course_loop.png';
import CourseOutandbackImageUrl from '@/assets/course_outandback.png';
import CourseArtImageUrl from '@/assets/course_art.png';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CourseInfoCardProps {
  course: Course;
  className?: string;
}

const courseImageUrl = {
  LINEAR: CourseLinearImageUrl,
  LOOP: CourseLoopImageUrl,
  OUT_AND_BACK: CourseOutandbackImageUrl,
  ART: CourseArtImageUrl,
  ETC: '',
};

const CourseInfoCard = ({ course, className }: CourseInfoCardProps) => {
  // const navigate = useNavigate();

  const handleClick = () => {
    // navigate(`/course/${course.courseUuid}`)
    toast('코스 상세 기능은 준비중입니다');
  };

  return (
    <div className={cn('flex justify-between gap-4 bg-white cursor-pointer', className)} onClick={handleClick}>
      {courseImageUrl[course.courseType] ? (
        <img src={courseImageUrl[course.courseType]} width='60' height='60' className='rounded-xl' />
      ) : (
        <div className='w-15 h-15 rounded-xl bg-gray-900' />
      )}

      <div className='flex-1 min-w-0 flex flex-col gap-2'>
        <div className='flex items-center justify-between gap-1'>
          <h3 className='font-semibold text-md truncate'>{course?.name || '코스이름'}</h3>
          <Button variant='ghost' className='w-6 h-6 p-0'>
            <Icon name={course.isBookmarked ? 'save_on_solid' : 'save_off_solid'} size={24} />
          </Button>
        </div>
        <div className='flex items-center gap-1 text-sm overflow-x-auto'>
          <Badge>Lv. {course?.level || 1}</Badge>
          <Badge>{course?.category || '공원'}</Badge>
          <Badge>{((course?.distance || 5000) / 1000).toFixed(0)}km</Badge>
        </div>
      </div>
    </div>
  );
};

export default CourseInfoCard;
