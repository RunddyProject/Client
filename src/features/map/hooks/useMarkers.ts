import { useEffect, type RefObject } from 'react';

import { rawIcons } from '@/shared/icons/registryRaw';
import { runddyColor } from '@/shared/model/constants';

import type { Course } from '@/features/course/model/types';
import type { MarkerInput } from '@/features/map/model/types';

const BASE_Z = 100;
const ACTIVE_Z = 100000;
const ACTIVE_Z_START = ACTIVE_Z + 1;
const CURRENT_LOCATION_Z = ACTIVE_Z + 100;

export function useMarkers(
  mapRef: RefObject<naver.maps.Map | null>,
  markerMapRef: RefObject<Map<string, naver.maps.Marker>>,
  markerListenersRef: RefObject<Map<string, naver.maps.MapEventListener>>,
  markers: MarkerInput[],
  onMarkerClick?: (id: string) => void,
  options?: {
    focusKey?: Course['uuid'];
    focusColor?: string;
    size?: number;
  }
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const _markers = markerMapRef.current!;
    const _listeners = markerListenersRef.current!;
    const { focusKey, size = 42 } = options ?? {};

    const focusHex =
      options?.focusColor && options.focusColor.startsWith('#')
        ? options.focusColor
        : runddyColor[options?.focusColor ?? 'blue'];

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

      const isCurrentLocation = m.kind === 'current_location';

      const iconName =
        m.kind === 'end'
          ? 'active_end'
          : isCurrentLocation
            ? 'current_location'
            : isActiveStart
              ? 'active_start'
              : 'pin_default';

      const iconVars = {
        '--icon-primary': isActiveStart || isActiveEnd ? focusHex : undefined
        // '--icon-secondary': '#fff'
      } as any;

      const iconKey = `${iconName}|${size}|${iconVars['--icon-primary'] ?? ''}`;

      let mk = _markers.get(m.id);
      if (!mk) {
        mk = new naver.maps.Marker({
          position: pos,
          map,
          icon: makeDomIcon(iconName, {
            displaySize: size,
            vars: iconVars
          }),
          zIndex: BASE_Z
        });
        (mk as any).__iconKey = iconKey;

        _markers.set(m.id, mk);

        const l = naver.maps.Event.addListener(mk, 'click', () =>
          onMarkerClick?.(m.id.replace(/__end$/, ''))
        );
        _listeners.set(m.id, l);
      } else {
        if (!mk.getPosition().equals(pos)) {
          mk.setPosition(pos);
        }

        if ((mk as any).__iconKey !== iconKey) {
          mk.setIcon(
            makeDomIcon(iconName, {
              displaySize: size,
              vars: iconVars
            })
          );
          (mk as any).__iconKey = iconKey;
        }
      }

      if (isCurrentLocation) mk.setZIndex(CURRENT_LOCATION_Z);
      else if (isActiveStart) mk.setZIndex(ACTIVE_Z_START);
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

type DomIconVars = {
  '--icon-primary'?: string;
  '--icon-secondary'?: string;
};

export function makeDomIcon(
  name: keyof typeof rawIcons | string,
  {
    displaySize = 42,
    anchorCenter = true,
    vars,
    className
  }: {
    displaySize?: number;
    anchorCenter?: boolean;
    vars?: DomIconVars;
    className?: string;
  } = {}
) {
  const svg =
    rawIcons[name as keyof typeof rawIcons] ?? rawIcons['pin_default'];
  const styleVars = vars
    ? Object.entries(vars)
        .map(([k, v]) => (v ? `${k}:${v}` : ''))
        .filter(Boolean)
        .join(';')
    : '';

  const html = `
    <div class="${className ?? ''}"
         style="width:${displaySize}px;height:${displaySize}px;${styleVars}">
      ${svg}
    </div>
  `;

  const anchor = anchorCenter
    ? new naver.maps.Point(displaySize / 2, displaySize / 2)
    : new naver.maps.Point(0, displaySize);

  return {
    content: html,
    size: new naver.maps.Size(displaySize, displaySize),
    anchor
  };
}
