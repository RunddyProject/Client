import { useEffect, useRef } from 'react';

export type LatLng = { lat: number; lng: number };

export function useNaverMap(center: LatLng, zoom = 12) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);
  const markerMapRef = useRef(new Map<string, naver.maps.Marker>());
  const markerListenersRef = useRef(
    new Map<string, naver.maps.EventListener>()
  );

  useEffect(() => {
    if (!mapRef.current || !window.naver?.maps) return;

    const _mapEl = mapRef.current;
    const _markerMap = markerMapRef.current;
    const _listeners = markerListenersRef.current;

    const mapOptions: naver.maps.MapOptions = {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom,
      zoomControl: false,
      mapTypeControl: false
    };

    const map = new window.naver.maps.Map(_mapEl, mapOptions);
    mapInstanceRef.current = map;

    return () => {
      _listeners.forEach((l) => naver.maps.Event.removeListener(l));
      _listeners.clear();

      _markerMap.forEach((m) => m.setMap(null));
      _markerMap.clear();

      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }

      mapInstanceRef.current = null;
    };
  }, [center.lat, center.lng, zoom]);

  return {
    mapRef,
    map: mapInstanceRef,
    markerMapRef,
    markerListenersRef,
    polylineRef
  } as const;
}
