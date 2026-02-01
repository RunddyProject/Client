import { useMemo } from 'react';

import type { PolylineCoordinatesOptions, PolylineCoordinates } from '@/features/course/model/refactor-types';

/**
 * Polyline coordinate array memoization hook
 *
 * @description
 * - CoursePoint[] → naver.maps.LatLng[] conversion
 * - Regenerates only when points array changes using useMemo
 * - Significant performance improvement for courses with 500+ points
 *
 * @param options - Polyline coordinate options
 * @returns Polyline coordinate array and metadata
 *
 * @example
 * ```ts
 * const { path, pointCount, bounds } = useOptimizedPolylineCoordinates({
 *   points: coursePointList,
 *   shouldGenerate: !!activeCourseId
 * });
 *
 * polyline.setPath(path);
 * ```
 */
export function useOptimizedPolylineCoordinates({
  points,
  shouldGenerate
}: PolylineCoordinatesOptions): PolylineCoordinates {
  // 1. Generate Polyline path (memoized)
  const path = useMemo(() => {
    if (!shouldGenerate || !points?.length) {
      return [];
    }

    return points.map((p) => new naver.maps.LatLng(p.lat, p.lng));
  }, [points, shouldGenerate]);

  // 2. Calculate bounds (memoized)
  const bounds = useMemo(() => {
    if (!points?.length) {
      return null;
    }

    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs)
    };
  }, [points]);

  return {
    path,
    pointCount: points?.length ?? 0,
    bounds
  };
}
