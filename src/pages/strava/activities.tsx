import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { buildElevationChartData } from '@/features/course/lib/elevation';
import { StravaApi } from '@/features/strava/api/strava.api';
import { useStravaActivities } from '@/features/strava/hooks/useStravaActivities';
import { useStravaConnect } from '@/features/strava/hooks/useStravaConnect';
import { useStravaUploadStore } from '@/features/strava/model/strava-upload.store';
import { StravaActivityCard } from '@/features/strava/ui/StravaActivityCard';
import { ApiError } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

import type { StravaActivity } from '@/features/strava/model/types';

function StravaActivitiesPage() {
  const navigate = useNavigate();
  const { connect } = useStravaConnect();
  const setStravaPreview = useStravaUploadStore((state) => state.setStravaPreview);
  const clearStravaPreview = useStravaUploadStore((state) => state.clearStravaPreview);
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Clear any stale Strava preview from a previous session when this page mounts.
  // This is the correct place for cleanup because the CourseUpload cleanup effect
  // would fire on React StrictMode's artificial unmount, wiping the store while
  // the component is still alive and causing a white page.
  useEffect(() => {
    clearStravaPreview();
  }, [clearStravaPreview]);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useStravaActivities();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      observerRef.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const handleConfirm = useCallback(async () => {
    if (!selectedActivity || isConfirming) return;
    setIsConfirming(true);

    try {
      const gpxData = await StravaApi.getActivityGpx(selectedActivity.id);

      if (!gpxData.coursePointList?.length) {
        toast.error('해당 활동의 GPS 데이터를 불러올 수 없습니다.');
        return;
      }

      const elevationChartData = buildElevationChartData(
        gpxData.coursePointList
      );

      setStravaPreview({
        stravaActivityId: selectedActivity.id,
        activityName: selectedActivity.name,
        totalDistance: gpxData.totalDistance,
        svg: gpxData.svg,
        coursePointList: gpxData.coursePointList,
        elevationChartData
      });

      navigate('/course/upload');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error('Strava 연결이 해제되었습니다. 재연결합니다.');
        connect();
        return;
      }
      toast.error('활동 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsConfirming(false);
    }
  }, [selectedActivity, isConfirming, navigate, connect, setStravaPreview]);

  // Handle 401 → trigger reconnect
  if (isError) {
    const isUnauthorized =
      error instanceof ApiError && error.status === 401;
    const isNotConnected =
      error instanceof ApiError && error.status === 404;

    return (
      <div className='flex flex-col items-center justify-center gap-6 px-5 pt-20'>
        <p className='text-contents-r15 text-sec text-center'>
          {isNotConnected
            ? 'Strava 계정이 연결되어 있지 않습니다.'
            : isUnauthorized
              ? 'Strava 연결이 해제되었습니다. 재연결이 필요합니다.'
              : '활동 목록을 불러오는 데 실패했습니다.'}
        </p>
        <button
          type='button'
          onClick={connect}
          className='bg-runddy-blue text-w-100 text-contents-m15 rounded-xl px-6 py-3'
        >
          Strava 연결하기
        </button>
      </div>
    );
  }

  const activities = data?.pages.flatMap((p) => p.activityList) ?? [];

  return (
    <div className='relative'>
      <div className='px-5 pb-28'>
        {isLoading ? (
          <div className='flex items-center justify-center pt-20'>
            <div className='border-runddy-blue h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        ) : activities.length === 0 ? (
          <div className='pt-20 text-center'>
            <p className='text-contents-r15 text-sec'>
              Strava 활동이 없습니다.
            </p>
          </div>
        ) : (
          <div className='divide-g-20 divide-y'>
            {activities.map((activity) => (
              <StravaActivityCard
                key={activity.id}
                activity={activity}
                onClick={setSelectedActivity}
                isSelected={selectedActivity?.id === activity.id}
                isDisabled={isConfirming}
              />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} className='py-4 text-center'>
              {isFetchingNextPage && (
                <div className='border-runddy-blue mx-auto h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className='fixed bottom-0 left-0 right-0 mx-auto max-w-xl px-5 pb-8'>
        <button
          type='button'
          onClick={handleConfirm}
          disabled={!selectedActivity || isConfirming}
          className={cn(
            'text-contents-m15 w-full rounded-2xl py-[18px] transition-colors',
            selectedActivity && !isConfirming
              ? 'bg-g-100 text-white'
              : 'bg-g-20 text-g-50'
          )}
        >
          {isConfirming ? '불러오는 중...' : '다음'}
        </button>
      </div>
    </div>
  );
}

export default StravaActivitiesPage;
