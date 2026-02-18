import type { CoursePoint } from '@/features/course-v1/model/types';

export type ElevationPoint = { dKm: number; ele: number };

export type ElevationBuildOptions = {
  /** moving-average window size (1 = no smoothing) */
  smoothWindow?: number;
  /** deadband (meters): ignore tiny up/down noise when accumulating gain/loss */
  minDeltaM?: number;
};

export type ElevationChartData = {
  series: ElevationPoint[];
  totalDistanceKm: number;
  elevationGain: number; // meters
  elevationLoss: number; // meters
  minEle: number;
  maxEle: number;
};

// Haversine distance (meters)
export function calculateDistance(
  { lat: lat1, lng: lng1 }: CoursePoint,
  { lat: lat2, lng: lng2 }: CoursePoint
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/** Build distance–elevation series + stats (gain/loss). */
export function buildElevationChartData(
  points: CoursePoint[] | undefined,
  { smoothWindow = 100, minDeltaM = 1 }: ElevationBuildOptions = {}
): ElevationChartData {
  if (!points?.length) {
    return {
      series: [],
      totalDistanceKm: 0,
      elevationGain: 0,
      elevationLoss: 0,
      minEle: 0,
      maxEle: 0
    };
  }

  // 1) sort by sequence to enforce path order
  const sorted = [...points].sort((a, b) => a.pointSeq - b.pointSeq);

  // 2) build the raw distance–elevation series
  //    - forward-fill missing elevations to avoid fake spikes
  //    - accumulate geodesic distance
  let accM = 0;
  let lastEle = toFinite(sorted[0].ele) ?? 0;

  const raw: ElevationPoint[] = [{ dKm: 0, ele: lastEle }];
  for (let i = 1; i < sorted.length; i++) {
    accM += calculateDistance(sorted[i - 1], sorted[i]);
    const ele = toFinite(sorted[i].ele);
    lastEle = ele ?? lastEle; // forward-fill if missing
    raw.push({ dKm: accM / 1000, ele: lastEle });
  }

  // 3) optional smoothing with moving average to reduce GPS noise
  const series = smoothWindow > 1 ? movingAverage(raw, smoothWindow) : raw;

  // 4) accumulate elevation gain/loss using a hysteresis (deadband) approach
  //    - accumulate within a trend (upBuf/downBuf)
  //    - confirm a trend when the opposite movement exceeds previous buffer + deadband
  let upBuf = 0;
  let downBuf = 0;
  let gain = 0;
  let loss = 0;

  let minEle = series[0].ele;
  let maxEle = series[0].ele;

  for (let i = 1; i < series.length; i++) {
    const cur = series[i].ele;
    const prev = series[i - 1].ele;
    const d = cur - prev;

    if (d > 0) {
      upBuf += d;
      if (downBuf > 0 && upBuf >= downBuf + minDeltaM) {
        if (downBuf >= minDeltaM) loss += downBuf;
        downBuf = 0; // switch confirmed to uphill
      }
    } else if (d < 0) {
      downBuf += -d;
      if (upBuf > 0 && downBuf >= upBuf + minDeltaM) {
        if (upBuf >= minDeltaM) gain += upBuf;
        upBuf = 0; // switch confirmed to downhill
      }
    }

    if (cur < minEle) minEle = cur;
    if (cur > maxEle) maxEle = cur;
  }

  // 5) close any remaining unfinished segment
  if (upBuf >= minDeltaM) gain += upBuf;
  if (downBuf >= minDeltaM) loss += downBuf;

  return {
    series,
    totalDistanceKm: accM / 1000,
    elevationGain: Math.round(gain),
    elevationLoss: Math.round(loss),
    minEle: Math.floor(minEle),
    maxEle: Math.ceil(maxEle)
  };
}

/** Simple centered moving average smoothing (window size = win). */
function movingAverage(arr: ElevationPoint[], win: number): ElevationPoint[] {
  const n = Math.max(1, Math.floor(win));
  const half = Math.floor(n / 2);

  return arr.map((p, i) => {
    const s = Math.max(0, i - half);
    const e = Math.min(arr.length - 1, i + half);
    let sum = 0;
    for (let k = s; k <= e; k++) sum += arr[k].ele;
    return { dKm: p.dKm, ele: sum / (e - s + 1) };
  });
}

/** Coerce to finite number or return undefined if NaN/Infinity/null/undefined. */
function toFinite(v: number | null | undefined): number | undefined {
  return Number.isFinite(v as number) ? (v as number) : undefined;
}
