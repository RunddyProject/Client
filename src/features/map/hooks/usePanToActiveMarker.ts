import { useEffect, useRef } from 'react';

type Opts = {
  /** vertical offset in screen pixels (moves target up) */
  offsetY?: number;
  /** pan animation duration (ms) */
  duration?: number;
  /** debounce before panning (ms) */
  debounce?: number;
};

export function usePanToActiveMarker(
  mapRef: React.RefObject<naver.maps.Map | null>,
  markerMapRef: React.RefObject<Map<string, naver.maps.Marker>>,
  focusKey?: string | null,
  { offsetY = 60, duration = 350, debounce = 80 }: Opts = {}
) {
  const timerRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusKey) return;

    const marker = markerMapRef.current?.get(focusKey);
    if (!marker) return;

    const clearTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const panOnce = () => {
      if (busyRef.current) return;
      if (lastIdRef.current === focusKey) return;
      lastIdRef.current = focusKey;

      const pos = marker.getPosition();
      const proj = map.getProjection();

      // apply vertical screen offset if projection is available
      const target = proj
        ? proj.fromOffsetToCoord(
            (() => {
              const p = proj.fromCoordToOffset(pos);
              return new naver.maps.Point(p.x, p.y - offsetY);
            })()
          )
        : pos;

      busyRef.current = true;
      map.panTo(target, { duration });

      // release busy when map finishes animating (fallback timeout as safety)
      const idleListener = naver.maps.Event.addListener(map, 'idle', () => {
        busyRef.current = false;
        naver.maps.Event.removeListener(idleListener);
      });
      window.setTimeout(() => {
        busyRef.current = false;
      }, duration + 50);
    };

    clearTimer();
    timerRef.current = window.setTimeout(() => {
      // wait one frame so marker/map state is committed
      requestAnimationFrame(panOnce);
    }, debounce);

    return clearTimer;
  }, [mapRef, markerMapRef, focusKey, offsetY, duration, debounce]);
}
