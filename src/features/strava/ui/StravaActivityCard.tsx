import polyline from '@mapbox/polyline';
import { Check } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

import type { StravaActivity } from '../model/types';

interface StravaActivityCardProps {
  activity: StravaActivity;
  onClick: (activity: StravaActivity) => void;
  isSelected?: boolean;
  isDisabled?: boolean;
}

function polylineToSvgPath(encodedPolyline: string): string | null {
  if (!encodedPolyline) return null;
  try {
    const coords = polyline.decode(encodedPolyline);
    if (coords.length < 2) return null;

    const lats = coords.map(([lat]) => lat);
    const lngs = coords.map(([, lng]) => lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    const points = coords.map(([lat, lng]) => {
      const x = ((lng - minLng) / lngRange) * 100;
      const y = 100 - ((lat - minLat) / latRange) * 100; // invert y axis
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${points.join(' L ')}`;
  } catch {
    return null;
  }
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
  isSelected = false,
  isDisabled = false
}: StravaActivityCardProps) {
  return (
    <button
      type='button'
      onClick={() => onClick(activity)}
      disabled={isDisabled}
      className='flex w-full items-start gap-4 py-4 text-left transition-opacity disabled:opacity-50'
    >
      {/* Left: Route SVG thumbnail */}
      <div className='bg-g-10 flex h-15 w-15 shrink-0 items-center justify-center overflow-hidden rounded-xl'>
        {(() => {
          const d = polylineToSvgPath(activity.summaryPolyline);
          return d ? (
            <svg
              data-testid='route-thumbnail'
              viewBox='0 0 100 100'
              xmlns='http://www.w3.org/2000/svg'
              className='text-runddy-blue h-12 w-12'
              preserveAspectRatio='xMidYMid meet'
            >
              <path
                d={d}
                fill='none'
                stroke='currentColor'
                strokeWidth='6'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          ) : (
            <div className='bg-g-20 h-full w-full' />
          );
        })()}
      </div>

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

      {/* Top-right: Radio button */}
      <div
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full',
          isSelected ? 'bg-runddy-blue' : 'border border-g-30 bg-white'
        )}
      >
        <Check
          className={cn('size-3.5', isSelected ? 'text-white' : 'text-g-40')}
          strokeWidth={2.5}
        />
      </div>
    </button>
  );
}
