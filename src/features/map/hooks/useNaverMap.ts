import { useEffect, useRef } from 'react';

import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM
} from '@/features/course/model/constants';

export type LatLng = { lat: number; lng: number };

export function useNaverMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);
  const markerMapRef = useRef(new Map<string, naver.maps.Marker>());
  const markerListenersRef = useRef(
    new Map<string, naver.maps.MapEventListener>()
  );

  useEffect(() => {
    if (!mapRef.current || !window.naver?.maps) return;

    const _mapEl = mapRef.current;
    const _markerMap = markerMapRef.current;
    const _listeners = markerListenersRef.current;
    const _polyline = polylineRef.current;

    if (!mapInstanceRef.current) {
      const map = new window.naver.maps.Map(_mapEl, {
        center: new window.naver.maps.LatLng(DEFAULT_CENTER),
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        mapTypeControl: false
      });
      mapInstanceRef.current = map;
    } else {
      const map = mapInstanceRef.current!;
      const currentZoom = map.getZoom();
      map.setCenter(new naver.maps.LatLng(DEFAULT_CENTER));
      const onceIdle = naver.maps.Event.once(map, 'idle', () => {
        if (map.getZoom() !== currentZoom) map.setZoom(currentZoom, true);
      });
      return () => naver.maps.Event.removeListener(onceIdle);
    }

    return () => {
      _listeners.forEach((l) => naver.maps.Event.removeListener(l));
      _listeners.clear();

      _markerMap.forEach((m) => m.setMap(null));
      _markerMap.clear();

      if (_polyline) _polyline.setMap(null);

      mapInstanceRef.current = null;
    };
  }, []);

  return {
    mapRef,
    map: mapInstanceRef,
    markerMapRef,
    markerListenersRef,
    polylineRef
  } as const;
}
