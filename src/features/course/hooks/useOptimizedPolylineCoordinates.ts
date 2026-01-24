import { useMemo } from 'react';

import type { PolylineCoordinatesOptions, PolylineCoordinates } from '@/features/course/model/refactor-types';

/**
 * Polyline 좌표 배열 메모이제이션 훅
 *
 * @description
 * - CoursePoint[] → naver.maps.LatLng[] 변환
 * - useMemo로 points 배열 변경 시에만 재생성
 * - 500개+ 포인트 코스에서 성능 개선 효과 큼
 *
 * @param options - Polyline 좌표 옵션
 * @returns Polyline 좌표 배열 및 메타 정보
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
  // 1. Polyline 경로 생성 (메모이제이션)
  const path = useMemo(() => {
    if (!shouldGenerate || !points?.length) {
      return [];
    }

    return points.map((p) => new naver.maps.LatLng(p.lat, p.lng));
  }, [points, shouldGenerate]);

  // 2. 경계 정보 계산 (메모이제이션)
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
