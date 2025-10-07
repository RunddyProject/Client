import { useEffect, type RefObject } from 'react';

import type { Point } from 'gpxparser';
import type GPXParser from 'gpxparser';

export function useGpxPolyline(
  mapRef: RefObject<naver.maps.Map | null>,
  polylineRef: RefObject<naver.maps.Polyline | null>,
  gpxData?: GPXParser
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !gpxData) return;

    const _polylineRef = polylineRef;

    if (_polylineRef.current) {
      _polylineRef.current.setMap(null);
      _polylineRef.current = null;
    }

    const path =
      gpxData.tracks[0]?.points?.map(
        (p: Point) => new window.naver.maps.LatLng(p.lat, p.lon)
      ) ?? [];

    if (path.length === 0) return;

    _polylineRef.current = new window.naver.maps.Polyline({
      path,
      strokeColor: 'hsl(var(--primary))',
      strokeWeight: 4,
      strokeOpacity: 0.9,
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
  }, [gpxData, mapRef, polylineRef]);
}
