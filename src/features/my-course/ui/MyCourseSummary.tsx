import { cn } from '@/shared/lib/utils';

interface MyCourseSummaryProps {
  myCourseCount: number;
  myTotalDistance: number; // km
  className?: string;
}

export function MyCourseSummary({
  myCourseCount,
  myTotalDistance,
  className
}: MyCourseSummaryProps) {
  return (
    <div
      className={cn('rounded-2xl px-5 py-4', className)}
      style={{
        background: 'linear-gradient(90deg, #D5F3FF 0%, #F2FBFF 100%)'
      }}
    >
      <div className='grid grid-cols-2 divide-x divide-g-20'>
        <div className='flex flex-col gap-1 pr-4'>
          <span className='text-caption-r12 text-sec'>내가 등록한 코스</span>
          <span className='text-title-b18 text-pri'>{myCourseCount}개</span>
        </div>
        <div className='flex flex-col gap-1 pl-4'>
          <span className='text-caption-r12 text-sec'>지금까지 뛴 거리</span>
          <span className='text-title-b18 text-pri'>
            {Math.round(myTotalDistance)}km
          </span>
        </div>
      </div>
    </div>
  );
}
