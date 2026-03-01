import polyline from '@mapbox/polyline';

import { Icon } from '@/shared/icons/icon';

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

/** YYYY.MM.DD. 오전/오후 h:mm 러닝 — parsed directly from the ISO string to
 *  avoid timezone conversion issues in test/server environments. */
function formatDate(isoString: string): string {
  const [datePart, timePart] = isoString.split('T');
  const [year, month, day] = datePart.split('-');
  const [hourStr, minStr] = timePart.split(':');
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minStr, 10);
  const ampm = hours < 12 ? '오전' : '오후';
  const hour12 = hours % 12 || 12;
  return `${year}.${month}.${day}. ${ampm} ${hour12}:${String(minutes).padStart(2, '0')} 러닝`;
}

/** Pace in min'ss" per km from m/s */
function formatPace(averageSpeedMps: number): string {
  if (averageSpeedMps <= 0) return '-';
  const totalSec = Math.round(1000 / averageSpeedMps);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}'${String(sec).padStart(2, '0')}"`;
}

/** Elapsed time as HH:MM */
function formatElapsedTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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
      className='flex w-full items-start gap-3 py-[22px] text-left transition-opacity disabled:opacity-50'
    >
      <div className='flex min-w-0 flex-1 flex-col gap-4'>
        <div className='flex min-w-0 items-center gap-4'>
          {/* Left: Route SVG thumbnail */}
          <div className='flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl'>
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
                <div className='h-full w-full bg-[linear-gradient(180deg,rgba(var(--g-20-rgb),0.3)_0%,var(--g-20)_50%,rgba(var(--g-20-rgb),0.3)_100%)]' />
              );
            })()}
          </div>

          {/* Center: Activity info */}
          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <p className='text-title-b18 text-pri truncate'>{activity.name}</p>
            <p className='text-contents-r14 text-sec'>
              {formatDate(activity.startDateLocal)}
            </p>
          </div>
        </div>

        {/* Stats row: 거리 | 평균 페이스 | 총 걸린 시간 */}
        <div className='flex w-full items-center gap-4'>
          <div className='flex flex-1 flex-col gap-0.5'>
            <span className='text-contents-r14 text-ter'>거리</span>
            <span className='text-contents-b16 text-pri'>
              {formatDistance(activity.distance)}km
            </span>
          </div>
          <div className='flex flex-1 flex-col gap-0.5'>
            <span className='text-contents-r14 text-ter'>평균 페이스</span>
            <span className='text-contents-b16 text-pri'>
              {formatPace(activity.averageSpeed)}
            </span>
          </div>
          <div className='flex flex-1 flex-col gap-0.5'>
            <span className='text-contents-r14 text-ter'>총 걸린 시간</span>
            <span className='text-contents-b16 text-pri'>
              {formatElapsedTime(activity.elapsedTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Top-right: Radio button */}
      {isSelected ? (
        <Icon
          name='circle_check_on'
          color='currentColor'
          className='text-runddy-blue'
          size={24}
        />
      ) : (
        <Icon
          name='circle_check_off'
          color='currentColor'
          className='text-w-100'
          size={24}
        />
      )}
    </button>
  );
}
