import { ChevronRight } from 'lucide-react';

import type { StravaActivity } from '../model/types';

interface StravaActivityCardProps {
  activity: StravaActivity;
  onClick: (activity: StravaActivity) => void;
  isLoading?: boolean;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(1);
}

export function StravaActivityCard({
  activity,
  onClick,
  isLoading
}: StravaActivityCardProps) {
  return (
    <button
      type='button'
      onClick={() => onClick(activity)}
      disabled={isLoading}
      className='flex w-full items-center gap-4 py-4 text-left transition-opacity disabled:opacity-50'
    >
      {/* Left: Placeholder for future SVG thumbnail */}
      <div className='bg-g-20 h-15 w-15 shrink-0 rounded-xl' />

      {/* Center: Activity info */}
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        <p className='text-contents-m15 text-pri truncate'>{activity.name}</p>
        <p className='text-caption-r13 text-ter'>
          {formatDate(activity.startDateLocal)}
        </p>
        <div className='text-caption-r13 text-sec flex gap-2'>
          <span>{formatDistance(activity.distance)}km</span>
          <span>·</span>
          <span>{formatDuration(activity.movingTime)}</span>
          {activity.totalElevationGain > 0 && (
            <>
              <span>·</span>
              <span>↑{Math.round(activity.totalElevationGain)}m</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Chevron */}
      <ChevronRight className='text-g-50 size-5 shrink-0' />
    </button>
  );
}
