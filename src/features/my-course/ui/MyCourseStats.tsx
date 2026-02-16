import { Icon } from '@/shared/icons/icon';

interface MyCourseStatsProps {
  courseCount: number;
  totalDistance: number; // km
}

export function MyCourseStats({
  courseCount,
  totalDistance
}: MyCourseStatsProps) {
  return (
    <div className='flex items-center gap-6 px-5 py-4'>
      <div className='flex items-center gap-2'>
        <Icon name='map' size={18} className='text-g-60' />
        <span className='text-contents-r15 text-sec'>
          내가 등록한 코스{' '}
          <span className='text-contents-b15'>{courseCount}개</span>
        </span>
      </div>
      <div className='flex items-center gap-2'>
        <Icon name='active_start' size={18} className='text-g-60' />
        <span className='text-contents-r15 text-sec'>
          지금까지 뛴 거리{' '}
          <span className='text-contents-b15'>
            {totalDistance.toFixed(1)}km
          </span>
        </span>
      </div>
    </div>
  );
}
