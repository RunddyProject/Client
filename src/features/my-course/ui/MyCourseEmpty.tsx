import { Icon } from '@/shared/icons/icon';

export function MyCourseEmpty() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-4 pt-30'>
      <Icon name='empty_graphic' size={100} />
      <p className='text-contents-r15 text-placeholder'>
        아직 등록한 코스가 없어요
      </p>
    </div>
  );
}
