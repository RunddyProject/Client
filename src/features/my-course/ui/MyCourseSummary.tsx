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
    <div className='flex w-full justify-between gap-3'>
      <div
        className={cn(
          'bg-w-100 shadow-runddy flex flex-1 flex-col gap-1 rounded-[20px] p-5',
          className
        )}
      >
        <span className='text-contents-r14 text-sec'>내가 등록한 코스</span>
        <span className='text-title-b21 text-pri'>{myCourseCount}개</span>
      </div>
      <div
        className={cn(
          'bg-w-100 shadow-runddy flex flex-1 flex-col gap-1 rounded-[20px] p-5',
          className
        )}
      >
        <span className='text-contents-r14 text-sec'>지금까지 뛴 거리</span>
        <span className='text-title-b21 text-pri'>
          {Math.round(myTotalDistance)}km
        </span>
      </div>
    </div>
  );
}
