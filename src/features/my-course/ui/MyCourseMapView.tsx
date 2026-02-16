import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useOptimizedPolylineCoordinates } from '@/features/course/hooks/useOptimizedPolylineCoordinates';
import { SHAPE_TYPE_COLOR } from '@/features/course/model/constants';
import { MyCourseEmpty } from '@/features/my-course/ui/MyCourseEmpty';
import { useNaverMap } from '@/features/map/hooks/useNaverMap';
import { runddyColor } from '@/shared/model/constants';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';

import type { CoursePoint } from '@/features/course/model/types';
import type { UserCourseGpxItem } from '@/features/my-course/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

interface MyCourseMapViewProps {
  gpxList: UserCourseGpxItem[];
  isLoading: boolean;
  onCourseClick: (courseUuid: string) => void;
}

export function MyCourseMapView({
  gpxList,
  isLoading,
  onCourseClick
}: MyCourseMapViewProps) {
  const { mapRef, map } = useNaverMap();
  const polylinesRef = useRef<naver.maps.Polyline[]>([]);
  const listenersRef = useRef<naver.maps.MapEventListener[]>([]);

  // Cleanup polylines
  const cleanup = useCallback(() => {
    listenersRef.current.forEach((l) => naver.maps.Event.removeListener(l));
    listenersRef.current = [];
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
  }, []);

  // Compute all bounds for fitBounds
  const allBounds = useMemo(() => {
    if (!gpxList.length) return null;

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    for (const item of gpxList) {
      for (const pt of item.coursePointList) {
        if (pt.lat < minLat) minLat = pt.lat;
        if (pt.lat > maxLat) maxLat = pt.lat;
        if (pt.lng < minLng) minLng = pt.lng;
        if (pt.lng > maxLng) maxLng = pt.lng;
      }
    }

    if (!isFinite(minLat)) return null;
    return { minLat, maxLat, minLng, maxLng };
  }, [gpxList]);

  // Render polylines
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || !gpxList.length) {
      cleanup();
      return;
    }

    cleanup();

    for (const item of gpxList) {
      if (!item.coursePointList.length) continue;

      const color: RUNDDY_COLOR =
        SHAPE_TYPE_COLOR[
          item.courseShapeType as keyof typeof SHAPE_TYPE_COLOR
        ] ?? 'blue';

      const path = item.coursePointList.map(
        (p: CoursePoint) => new naver.maps.LatLng(p.lat, p.lng)
      );

      const polyline = new naver.maps.Polyline({
        map: mapInstance,
        path,
        strokeColor: runddyColor[color] as unknown as string,
        strokeWeight: 5,
        strokeOpacity: 0.8
      });

      const listener = naver.maps.Event.addListener(
        polyline,
        'click',
        () => {
          onCourseClick(item.courseUuid);
        }
      );

      polylinesRef.current.push(polyline);
      listenersRef.current.push(listener);
    }

    // Fit to all polylines
    if (allBounds) {
      const bounds = new naver.maps.LatLngBounds(
        new naver.maps.LatLng(allBounds.minLat, allBounds.minLng),
        new naver.maps.LatLng(allBounds.maxLat, allBounds.maxLng)
      );
      mapInstance.fitBounds(bounds, {
        top: 60,
        right: 40,
        bottom: 60,
        left: 40
      });
    }

    return cleanup;
  }, [map, gpxList, allBounds, onCourseClick, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  if (isLoading) {
    return (
      <div className='flex h-80 items-center justify-center'>
        <LoadingSpinner />
      </div>
    );
  }

  if (gpxList.length === 0) {
    return <MyCourseEmpty />;
  }

  return (
    <div className='relative h-[calc(100dvh-280px)] w-full'>
      <div
        ref={mapRef}
        className='h-full w-full'
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
