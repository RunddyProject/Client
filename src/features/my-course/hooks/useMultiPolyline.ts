import { useEffect, useCallback, useRef } from 'react';

import { SHAPE_TYPE_COLOR } from '@/features/course/model/constants';
import { makeDomIcon } from '@/features/map/hooks/useMarkers';
import { runddyColor } from '@/shared/model/constants';

import type { UserCourseGpxItem } from '../model/types';

const MARKER_SIZE = 32;

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

    const polylines: naver.maps.Polyline[] = [];
    const markers: naver.maps.Marker[] = [];

    gpxList.forEach((gpx) => {
      const points = gpx.coursePointList;
      if (points.length === 0) return;

      const path = points.map((p) => new naver.maps.LatLng(p.lat, p.lng));
      const colorHex = (runddyColor as Record<string, string>)[
        SHAPE_TYPE_COLOR[gpx.courseShapeType] ?? 'default'
      ];

      // Polyline
      const polyline = new naver.maps.Polyline({
        map,
        path,
        strokeColor: colorHex,
        strokeWeight: 7,
        strokeLineCap: 'round',
        strokeLineJoin: 'round'
      });

      if (onPolylineClickRef.current) {
        naver.maps.Event.addListener(polyline, 'click', () => {
          onPolylineClickRef.current?.(gpx.courseUuid);
        });
      }

      polylines.push(polyline);

      // Start marker
      const startPoint = points[0];
      const startMarker = new naver.maps.Marker({
        position: new naver.maps.LatLng(startPoint.lat, startPoint.lng),
        map,
        icon: makeDomIcon('active_start', {
          displaySize: MARKER_SIZE,
          vars: { '--icon-primary': colorHex }
        }),
        zIndex: 100
      });

      if (onPolylineClickRef.current) {
        naver.maps.Event.addListener(startMarker, 'click', () => {
          onPolylineClickRef.current?.(gpx.courseUuid);
        });
      }

      markers.push(startMarker);

      // End marker
      const endPoint = points[points.length - 1];
      const endMarker = new naver.maps.Marker({
        position: new naver.maps.LatLng(endPoint.lat, endPoint.lng),
        map,
        icon: makeDomIcon('active_end', {
          displaySize: MARKER_SIZE,
          vars: { '--icon-primary': colorHex }
        }),
        zIndex: 100
      });

      if (onPolylineClickRef.current) {
        naver.maps.Event.addListener(endMarker, 'click', () => {
          onPolylineClickRef.current?.(gpx.courseUuid);
        });
      }

      markers.push(endMarker);
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
      markers.forEach((m) => m.setMap(null));
    };
  }, [map, gpxList]);

  const resetFitBounds = useCallback(() => {
    fitBoundsOnce.current = false;
  }, []);

  return { resetFitBounds };
}
