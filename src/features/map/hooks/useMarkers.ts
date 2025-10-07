import { useEffect, type RefObject } from 'react';

export type MarkerInput = { id: string; lat: number; lng: number };

export function useMarkers(
  mapRef: RefObject<naver.maps.Map | null>,
  markerMapRef: RefObject<Map<string, naver.maps.Marker>>,
  markerListenersRef: RefObject<Map<string, naver.maps.EventListener>>,
  markers: MarkerInput[],
  onMarkerClick?: (id: string) => void
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const _markers = markerMapRef.current!;
    const _listeners = markerListenersRef.current!;

    const incomingIds = new Set(markers.map((m) => m.id));

    for (const [id, mk] of _markers) {
      if (!incomingIds.has(id)) {
        mk.setMap(null);
        _markers.delete(id);
        const l = _listeners.get(id);
        if (l) {
          naver.maps.Event.removeListener(l);
          _listeners.delete(id);
        }
      }
    }

    markers.forEach((m) => {
      const pos = new naver.maps.LatLng(m.lat, m.lng);
      let mk = _markers.get(m.id);

      if (!mk) {
        mk = new naver.maps.Marker({
          position: pos,
          map,
          icon: '/pin_default.svg'
        });
        _markers.set(m.id, mk);

        const l = naver.maps.Event.addListener(mk, 'click', () =>
          onMarkerClick?.(m.id)
        );
        _listeners.set(m.id, l);
      } else {
        mk.setPosition(pos);
        mk.setIcon('/pin_default.svg');
      }
    });
  }, [markers, onMarkerClick, mapRef, markerMapRef, markerListenersRef]);
}
