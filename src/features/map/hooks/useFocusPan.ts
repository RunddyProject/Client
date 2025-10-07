import { useEffect, type RefObject } from 'react';

export function useFocusPan(
  mapRef: RefObject<naver.maps.Map | null>,
  markerMapRef: RefObject<Map<string, naver.maps.Marker>>,
  focusKey?: string,
  nudgeY: number = 60
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusKey) return;

    const mk = markerMapRef.current!.get(focusKey);
    if (!mk) return;

    const pos = mk.getPosition();
    const proj = map.getProjection();

    if (!proj) {
      map.panTo(pos, { duration: 300 });
      return;
    }
    const screen = proj.fromCoordToOffset(pos);
    const nudged = proj.fromOffsetToCoord(
      new naver.maps.Point(screen.x, screen.y - nudgeY)
    );
    map.panTo(nudged, { duration: 300 });
  }, [focusKey, mapRef, markerMapRef, nudgeY]);
}
