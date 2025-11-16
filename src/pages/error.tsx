import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';

import { Icon } from '@/shared/icons/icon';
import { Button } from '@/shared/ui/primitives/button';

import NotFound from './not-found';

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  if (isRouteErrorResponse(error)) {
    return (
      error.statusText ||
      error.data?.message ||
      '알 수 없는 에러가 발생했습니다.'
    );
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'statusText' in error) {
    return (
      String((error as { statusText: unknown }).statusText) ||
      '알 수 없는 에러가 발생했습니다.'
    );
  }
  return '알 수 없는 에러가 발생했습니다.';
}

function Error() {
  const error = useRouteError();
  const navigate = useNavigate();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  const errorMessage = getErrorMessage(error);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 px-6'>
      <div className='mb-6'>
        <Icon
          name='warning'
          size={60}
          color='currentColor'
          className='text-state-error'
        />
      </div>
      <div className='text-g-90 text-title-b23'>오류가 발생했습니다</div>
      {errorMessage && <p className='text-g-60'>{errorMessage}</p>}
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

export default Error;
