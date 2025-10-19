import { useEffect, useMemo, useRef } from 'react';

import { fitLatLngBoundsByScale } from '@/features/map/lib/fitLatLngBoundsByScale';

import type { LatLngBounds } from '@/features/map/model/types';

function debounce<T extends (...a: any[]) => void>(fn: T, wait = 120) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), wait) as unknown as number;
  };
}

export function useFitLatLngBoundsScale(
  mapRef: React.RefObject<naver.maps.Map | null>,
  bounds?: LatLngBounds,
  opts: {
    scale?: number;
    paddingPx?: number;
    maxZoom?: number;
    minZoom?: number;
    oncePerKey?: string;
    settleDelay?: number;
    durationMs?: number;
    disableTileFadeDuringMove?: boolean;
    observeResize?: boolean;
  } = {}
) {
  const {
    scale = 1.5,
    paddingPx = 0,
    maxZoom,
    minZoom,
    oncePerKey,
    settleDelay = 100,
    durationMs = 400,
    disableTileFadeDuringMove = true,
    observeResize = true
  } = opts;

  const ranKeyRef = useRef<string | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const lastSizeRef = useRef<{ w: number; h: number } | null>(null);

  const runFit = useMemo(
    () =>
      debounce(() => {
        const map = mapRef.current;
        if (!map || !bounds) return;

        const el = (map as any).getElement?.() as HTMLElement | undefined;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const proj = map.getProjection();

        if (!proj || rect.width < 2 || rect.height < 2) {
          naver.maps.Event.once(map, 'idle', () => {
            requestAnimationFrame(() =>
              fitLatLngBoundsByScale(map, bounds, {
                scale,
                paddingPx,
                maxZoom,
                minZoom,
                durationMs,
                disableTileFadeDuringMove
              })
            );
          });
          return;
        }

        window.setTimeout(
          () =>
            requestAnimationFrame(() =>
              fitLatLngBoundsByScale(map, bounds, {
                scale,
                paddingPx,
                maxZoom,
                minZoom,
                durationMs,
                disableTileFadeDuringMove
              })
            ),
          settleDelay
        );
      }, 120),
    [
      mapRef,
      bounds,
      scale,
      paddingPx,
      maxZoom,
      minZoom,
      settleDelay,
      durationMs,
      disableTileFadeDuringMove
    ]
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !bounds) return;
    if (oncePerKey && ranKeyRef.current === oncePerKey) return;

    const doOnce = () => {
      runFit();
      if (oncePerKey) ranKeyRef.current = oncePerKey;
    };

    naver.maps.Event.once(map, 'idle', doOnce);
  }, [mapRef, bounds, oncePerKey, runFit]);

  useEffect(() => {
    if (!observeResize) return;
    const map = mapRef.current;
    if (!map) return;

    const el = (map as any).getElement?.() as HTMLElement | undefined;
    if (!el) return;

    const handleResize = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      const prev = lastSizeRef.current;
      if (!prev || prev.w !== w || prev.h !== h) {
        lastSizeRef.current = { w, h };
        runFit();
      }
    };

    handleResize();

    const ro = new ResizeObserver(() => handleResize());
    ro.observe(el);
    roRef.current = ro;

    return () => {
      ro.disconnect();
      roRef.current = null;
    };
  }, [mapRef, observeResize, runFit]);
}
