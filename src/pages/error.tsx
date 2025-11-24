import { isRouteErrorResponse, useRouteError } from 'react-router';

import { Icon } from '@/shared/icons/icon';

import NotFound from './not-found';

function Error() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-5'>
      <Icon name='error' size={60} />
      <div className='text-g-90 text-title-b21 text-center'>
        화면을 불러오지 못했어요
        <br />
        잠시 후 다시 시도해 주세요
      </div>
    </div>
  );
}

export default Error;
