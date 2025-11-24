import { Icon } from '@/shared/icons/icon';

function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-5'>
      <Icon name='error' size={60} />
      <div className='text-g-90 text-title-b21 text-center'>
        원하시는 페이지를
        <br />
        찾을 수 없어요
      </div>
    </div>
  );
}

export default NotFound;
