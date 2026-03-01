import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import LoadingSpinner from '@/shared/ui/composites/loading-spinner';

function StravaSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Strava OAuth completed — redirect to activities list
    navigate('/strava/activities', { replace: true });
  }, [navigate]);

  return (
    <div className='flex min-h-dvh items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <LoadingSpinner />
        <p className='text-contents-r15 text-sec'>Strava 연결 중...</p>
      </div>
    </div>
  );
}

export default StravaSuccess;
