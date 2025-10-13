import { useEffect, useMemo, useRef, type RefObject } from 'react';

import { runddyColor } from '@/shared/model/constants';

import type { CoursePoint } from '@/features/course/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

type FitBehavior = 'never' | 'once' | 'auto';

type Options = {
  /** course identity key; if omitted, derived from pathSig */
  trackKey?: string;
  /** 'once' (default): fit once per track, 'auto': refit when path goes out of view, 'never': no fit */
  fit?: FitBehavior;
  /** padding (px) when fitting bounds */
  padding?: number;
  /** debounce before fit (ms) */
  settleDelay?: number;
};

export function useGpxPolyline(
  mapRef: RefObject<naver.maps.Map | null>,
  polylineRef: RefObject<naver.maps.Polyline | null>,
  points?: CoursePoint[],
  color?: RUNDDY_COLOR,
  opts: Options = {}
) {
  const { trackKey, fit = 'once', padding = 80, settleDelay = 120 } = opts;

  // Signature to detect path changes (length + endpoints)
  const pathSig = useMemo(() => {
    if (!points?.length) return '0';
    const f = points[0];
    const l = points[points.length - 1];
    return `${points.length}:${f.lat.toFixed(5)},${f.lng.toFixed(5)}-${l.lat.toFixed(5)},${l.lng.toFixed(5)}`;
  }, [points]);

  const fittedKeyRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const interactingRef = useRef(false);
  const lastFitAtRef = useRef(0);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !points?.length) return;

    const path = points.map((p) => new naver.maps.LatLng(p.lat, p.lng));
    const strokeColor = runddyColor[color ?? 'blue'];

    // Create or update polyline
    if (!polylineRef.current) {
      polylineRef.current = new naver.maps.Polyline({
        path,
        strokeColor,
        strokeWeight: 7,
        map
      });
    } else {
      polylineRef.current.setPath(path);
      (polylineRef.current as any).setOptions?.({ strokeColor });
    }

    if (fit === 'never') return;

    // Temporarily block fit while interacting
    const setInteractingTrue = () => (interactingRef.current = true);
    const setInteractingFalse = () => (interactingRef.current = false);

    const listeners = [
      naver.maps.Event.addListener(map, 'dragstart', setInteractingTrue),
      naver.maps.Event.addListener(
        map,
        'zoom_start',
        setInteractingTrue as any
      ),
      naver.maps.Event.addListener(
        map,
        'pinchstart',
        setInteractingTrue as any
      ),
      naver.maps.Event.addListener(map, 'idle', setInteractingFalse)
    ];

    const clearTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const runFit = () => {
      if (!polylineRef.current || interactingRef.current) return;
      const now = performance.now();
      if (now - lastFitAtRef.current < 300) return; // avoid rapid consecutive fits
      lastFitAtRef.current = now;

      const b = boundsFromPath(path);
      requestAnimationFrame(() => {
        map.fitBounds(b, {
          top: padding,
          right: padding,
          bottom: padding,
          left: padding
        });
      });
    };

    const scheduleFit = () => {
      clearTimer();
      timerRef.current = window.setTimeout(runFit, settleDelay);
    };

    if (fit === 'once') {
      const key = trackKey ?? pathSig;
      if (fittedKeyRef.current !== key) {
        fittedKeyRef.current = key;
        scheduleFit();
      }
    } else if (fit === 'auto') {
      // Refit only when the path is out of the padded viewport
      if (!isPathWithinPadding(path, map, padding)) {
        scheduleFit();
      }
    }

    return () => {
      clearTimer();
      listeners.forEach((l) => naver.maps.Event.removeListener(l));
    };
  }, [
    mapRef,
    polylineRef,
    pathSig,
    points,
    color,
    fit,
    trackKey,
    padding,
    settleDelay
  ]);
}

/** Build bounds from a path. */
function boundsFromPath(latlngs: naver.maps.LatLng[]) {
  const bounds = new (naver.maps as any).LatLngBounds();
  for (const ll of latlngs) bounds.extend(ll);
  return bounds;
}

/** Returns true if all points lie within the map viewport minus padding. */
function isPathWithinPadding(
  latlngs: naver.maps.LatLng[],
  map: naver.maps.Map,
  pad: number
) {
  const proj = map.getProjection();
  const el = (map as any).getElement?.() as HTMLElement | undefined;
  if (!proj || !el) return false;

  const rect = el.getBoundingClientRect();
  const left = pad;
  const top = pad;
  const right = rect.width - pad;
  const bottom = rect.height - pad;

  for (const ll of latlngs) {
    const pt = proj.fromCoordToOffset(ll);
    if (pt.x < left || pt.x > right || pt.y < top || pt.y > bottom) {
      return false; // any point outside → not within
    }
  }
  return true;
}
