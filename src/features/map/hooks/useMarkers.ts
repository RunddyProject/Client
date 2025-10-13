import { useEffect, type RefObject } from 'react';

import type { Course } from '@/features/course/model/types';
import type { MarkerInput } from '@/features/map/model/types';

const BASE_Z = 100;
const ACTIVE_Z = 100000;
const ACTIVE_Z_START = ACTIVE_Z + 1;

export function useMarkers(
  mapRef: RefObject<naver.maps.Map | null>,
  markerMapRef: RefObject<Map<string, naver.maps.Marker>>,
  markerListenersRef: RefObject<Map<string, naver.maps.MapEventListener>>,
  markers: MarkerInput[],
  onMarkerClick?: (id: string) => void,
  options?: {
    focusKey?: Course['uuid'];
    focusColor?: string;
  }
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const _markers = markerMapRef.current!;
    const _listeners = markerListenersRef.current!;
    const { focusKey, focusColor = 'blue' } = options ?? {};

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
      const isActiveStart = m.kind === 'start' && m.id === focusKey;
      const isActiveEnd = m.kind === 'end' && m.id.startsWith(`${focusKey}__`);

      let mk = _markers.get(m.id);
      const icon =
        m.kind === 'end'
          ? makeImageIcon(`/active_end_${focusColor}.svg`)
          : isActiveStart
            ? makeImageIcon(`/active_start_${focusColor}.svg`)
            : makeImageIcon('/pin_default.svg');

      if (!mk) {
        mk = new naver.maps.Marker({ position: pos, map, icon });
        _markers.set(m.id, mk);
        const l = naver.maps.Event.addListener(mk, 'click', () =>
          onMarkerClick?.(m.id.replace(/__end$/, ''))
        );
        _listeners.set(m.id, l);
      } else {
        mk.setPosition(pos);
        mk.setIcon(icon);
      }

      if (isActiveStart) mk.setZIndex(ACTIVE_Z_START);
      else if (isActiveEnd) mk.setZIndex(ACTIVE_Z);
      else mk.setZIndex(BASE_Z);
    });
  }, [
    markers,
    onMarkerClick,
    mapRef,
    markerMapRef,
    markerListenersRef,
    options
  ]);
}

function makeImageIcon(
  url: string,
  {
    displaySize = 52,
    sourceSize,
    origin = { x: 0, y: 0 }
  }: {
    displaySize?: number;
    sourceSize?: number;
    origin?: { x: number; y: number };
  } = {}
) {
  const src = sourceSize ?? displaySize;

  return {
    url,
    size: new naver.maps.Size(src, src),
    scaledSize: new naver.maps.Size(displaySize, displaySize),
    origin: new naver.maps.Point(origin.x, origin.y),
    anchor: new naver.maps.Point(displaySize / 2, displaySize / 2)
  };
}
