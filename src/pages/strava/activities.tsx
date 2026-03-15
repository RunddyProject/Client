import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { buildElevationChartData } from '@/features/course/lib/elevation';
import { StravaApi } from '@/features/strava/api/strava.api';
import { useStravaActivities } from '@/features/strava/hooks/useStravaActivities';
import { useStravaConnect } from '@/features/strava/hooks/useStravaConnect';
import { useStravaUploadStore } from '@/features/strava/model/strava-upload.store';
import { StravaActivityCard } from '@/features/strava/ui/StravaActivityCard';
import { Icon } from '@/shared/icons/icon';
import { ApiError } from '@/shared/lib/http';
import { Button } from '@/shared/ui/primitives/button';

import type { CoursePoint } from '@/features/course/model/types';
import type { StravaActivity } from '@/features/strava/model/types';

function buildGpxFile(coursePointList: CoursePoint[], name: string): File {
  const trkpts = coursePointList
    .map(
      ({ lat, lng, ele }) =>
        `      <trkpt lat="${lat}" lon="${lng}"><ele>${ele}</ele></trkpt>`
    )
    .join('\n');
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Runddy">
  <trk>
    <name>${name}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
  return new File([gpx], `${name}.gpx`, { type: 'application/gpx+xml' });
}

function StravaActivitiesPage() {
  const navigate = useNavigate();
  const { connect } = useStravaConnect();
  const setStravaPreview = useStravaUploadStore(
    (state) => state.setStravaPreview
  );
  const clearStravaPreview = useStravaUploadStore(
    (state) => state.clearStravaPreview
  );
  const [selectedActivity, setSelectedActivity] =
    useState<StravaActivity | null>(null);
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
        toast.error('해당 활동의 GPX 데이터를 불러올 수 없어요');
        return;
      }

      const elevationChartData = buildElevationChartData(
        gpxData.coursePointList
      );
      const file = buildGpxFile(gpxData.coursePointList, selectedActivity.name);

      setStravaPreview({
        file,
        activityName: selectedActivity.name,
        totalDistance: gpxData.totalDistance,
        svg: gpxData.svg,
        coursePointList: gpxData.coursePointList,
        elevationChartData
      });

      navigate('/course/upload');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error('Strava 연결이 해제되었어요 재연결합니다');
        connect();
        return;
      }
      toast.error('활동 데이터를 불러오는 데 실패했어요');
    } finally {
      setIsConfirming(false);
    }
  }, [selectedActivity, isConfirming, navigate, connect, setStravaPreview]);

  // Handle 401 → trigger reconnect
  if (isError) {
    const isUnauthorized = error instanceof ApiError && error.status === 401;
    const isNotConnected = error instanceof ApiError && error.status === 404;

    return (
      <div className='flex flex-col items-center justify-center gap-6 px-5 pt-20'>
        <p className='text-contents-r15 text-sec text-center'>
          {isNotConnected
            ? 'Strava 계정이 연결되어 있지 않어요'
            : isUnauthorized
              ? 'Strava 연결이 해제되었어요 재연결이 필요합니다.'
              : '활동 목록을 불러오는 데 실패했어요'}
        </p>
        <Button onClick={connect} className='w-full max-w-xs' size='lg'>
          <span>Strava 연결하기</span>
        </Button>
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
          <div className='flex flex-col items-center space-y-4 pt-[150px]'>
            <Icon name='empty_graphic' size={100} />
            <div className='text-placeholder'>Strava 활동이 없어요</div>
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
      <div className='bg-w-100 fixed right-0 bottom-0 left-0 mx-auto max-w-xl px-5 pt-3 pb-5'>
        <Button
          onClick={handleConfirm}
          disabled={!selectedActivity || isConfirming}
          className='w-full'
          size='lg'
        >
          {isConfirming ? '불러오는 중...' : '다음'}
        </Button>
      </div>
    </div>
  );
}

export default StravaActivitiesPage;
