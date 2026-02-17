import { useEffect, useCallback, useRef } from 'react';

import { SHAPE_TYPE_COLOR } from '@/features/course/model/constants';
import { runddyColor } from '@/shared/model/constants';

import type { UserCourseGpxItem } from '../model/types';

export function useMultiPolyline(
  map: naver.maps.Map | null,
  gpxList: UserCourseGpxItem[],
  onPolylineClick?: (courseUuid: string) => void
) {
  const onPolylineClickRef = useRef(onPolylineClick);
  onPolylineClickRef.current = onPolylineClick;

  const fitBoundsOnce = useRef(false);

  useEffect(() => {
    if (!map || gpxList.length === 0) {
      fitBoundsOnce.current = false;
      return;
    }

    const polylines = gpxList.map((gpx) => {
      const path = gpx.coursePointList.map(
        (p) => new naver.maps.LatLng(p.lat, p.lng)
      );
      const color =
        (runddyColor as Record<string, string>)[
          SHAPE_TYPE_COLOR[gpx.courseShapeType]
        ] ?? '#04aef1';

      const polyline = new naver.maps.Polyline({
        map,
        path,
        strokeColor: color,
        strokeWeight: 4,
        strokeOpacity: 0.8,
        strokeLineCap: 'round',
        strokeLineJoin: 'round'
      });

      if (onPolylineClickRef.current) {
        naver.maps.Event.addListener(polyline, 'click', () => {
          onPolylineClickRef.current?.(gpx.courseUuid);
        });
      }

      return polyline;
    });

    // Fit bounds to show all polylines (once)
    if (!fitBoundsOnce.current) {
      const allPoints = gpxList.flatMap((g) => g.coursePointList);
      if (allPoints.length > 0) {
        const lats = allPoints.map((p) => p.lat);
        const lngs = allPoints.map((p) => p.lng);
        const bounds = new naver.maps.LatLngBounds(
          new naver.maps.LatLng(Math.min(...lats), Math.min(...lngs)),
          new naver.maps.LatLng(Math.max(...lats), Math.max(...lngs))
        );
        map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
        fitBoundsOnce.current = true;
      }
    }

    return () => {
      polylines.forEach((p) => p.setMap(null));
    };
  }, [map, gpxList]);

  const resetFitBounds = useCallback(() => {
    fitBoundsOnce.current = false;
  }, []);

  return { resetFitBounds };
}
