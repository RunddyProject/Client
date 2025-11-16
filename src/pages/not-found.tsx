import { useNavigate } from 'react-router';

import { Button } from '@/shared/ui/primitives/button';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6'>
      <div className='mb-6'>
        <h1 className='text-g-80 mb-2 text-6xl font-bold'>404</h1>
        <div className='bg-runddy-blue mx-auto h-1 w-16'></div>
      </div>
      <h2 className='text-g-90 mb-4 text-2xl font-bold'>
        페이지를 찾을 수 없습니다
      </h2>
      <p className='text-g-60 mb-6'>
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <div className='flex flex-col gap-3'>
        <Button onClick={() => navigate(-1)} className='bg-g-70'>
          <div className='text-w-100 p-4'>이전 페이지로</div>
        </Button>
        <Button
          onClick={() => navigate('/', { replace: true })}
          className='bg-runddy-blue'
        >
          <div className='text-w-100 p-4'>홈으로 이동</div>
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
