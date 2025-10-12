import { useEffect, type RefObject } from 'react';

import { runddyColor } from '@/shared/model/constants';

import type { CoursePoint } from '@/features/course/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

export function useGpxPolyline(
  mapRef: RefObject<naver.maps.Map | null>,
  polylineRef: RefObject<naver.maps.Polyline | null>,
  points?: CoursePoint[],
  color?: RUNDDY_COLOR
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !points) return;

    const _polylineRef = polylineRef;

    if (_polylineRef.current) {
      _polylineRef.current.setMap(null);
      _polylineRef.current = null;
    }

    const path =
      points?.map(
        (p: CoursePoint) => new window.naver.maps.LatLng(p.lat, p.lng)
      ) ?? [];

    if (path.length === 0) return;

    _polylineRef.current = new window.naver.maps.Polyline({
      path,
      strokeColor: runddyColor[color ?? 'blue'],
      strokeWeight: 7,
      map
    });

    const bounds = new window.naver.maps.LatLngBounds();
    path.forEach((c) => bounds.extend(c));

    const id = window.setTimeout(() => {
      map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
    }, 100);

    return () => {
      window.clearTimeout(id);
      if (_polylineRef.current) {
        _polylineRef.current.setMap(null);
        _polylineRef.current = null;
      }
    };
  }, [points, mapRef, polylineRef, color]);
}
