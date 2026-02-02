import { useMemo } from 'react';

import type { MarkerGenerationOptions } from '@/features/course/model/refactor-types';
import type { MarkerInput } from '@/features/map/model/types';

/**
 * Marker array memoization hook
 *
 * @description
 * - Generates course start/end point markers
 * - Includes user current location marker
 * - Prevents unnecessary regeneration with useMemo
 * - Dependencies: courses, activeCourseId, coursePointList, userLocation
 *
 * @param options - Marker generation options
 * @returns Generated marker array
 *
 * @example
 * ```ts
 * const markers = useOptimizedMarkers({
 *   courses,
 *   activeCourseId,
 *   coursePointList,
 *   userLocation
 * });
 *
 * <NaverMap markers={markers} />
 * ```
 */
export function useOptimizedMarkers({
  courses,
  activeCourseId,
  coursePointList,
  userLocation
}: MarkerGenerationOptions): MarkerInput[] {
  return useMemo(() => {
    // 1. 코스 마커 생성 (시작점 + 활성 코스의 종료점)
    const courseMarkers = courses.flatMap((course) => {
      const startMarker: MarkerInput = {
        id: course.uuid,
        lat: course.lat,
        lng: course.lng,
        kind: 'start'
      };

      // 활성 코스의 경우 종료점 마커도 추가
      if (course.uuid === activeCourseId && coursePointList.length > 0) {
        const endPoint = coursePointList[coursePointList.length - 1];

        if (endPoint?.lat && endPoint?.lng) {
          const endMarker: MarkerInput = {
            id: `${course.uuid}__end`,
            lat: endPoint.lat,
            lng: endPoint.lng,
            kind: 'end'
          };
          return [startMarker, endMarker];
        }
      }

      return [startMarker];
    });

    // 2. 사용자 위치 마커 추가
    const locationMarkers: MarkerInput[] = userLocation
      ? [
          {
            id: 'user_current_location',
            lat: userLocation.lat,
            lng: userLocation.lng,
            kind: 'current_location'
          }
        ]
      : [];

    // 3. 모든 마커 결합
    return [...courseMarkers, ...locationMarkers];
  }, [courses, activeCourseId, coursePointList, userLocation]);
}
