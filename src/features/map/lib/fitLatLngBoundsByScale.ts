import type { LatLngBounds } from '@/features/map/model/types';

type Camera = { center: naver.maps.LatLng; zoom: number };

const animState = new WeakMap<naver.maps.Map, boolean>();
const isAnimating = (m: naver.maps.Map) => animState.get(m) === true;
const setAnimating = (m: naver.maps.Map, v: boolean) => animState.set(m, v);

function latToY(lat: number) {
  const s = Math.sin((lat * Math.PI) / 180);
  return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);
}
function lngToX(lng: number) {
  return (lng + 180) / 360; // [0..1]
}
function clampZoom(z: number, min?: number, max?: number) {
  let v = z;
  if (typeof min === 'number') v = Math.max(v, min);
  if (typeof max === 'number') v = Math.min(v, max);
  return v;
}

function computeCameraForScaledBounds(
  map: naver.maps.Map,
  b: LatLngBounds,
  opts: {
    scale: number;
    paddingPx: number;
    minZoom?: number;
    maxZoom?: number;
  }
): Camera | null {
  const el = (map as any).getElement?.() as HTMLElement | undefined;
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const vw = Math.max(0, Math.floor(rect.width - opts.paddingPx * 2));
  const vh = Math.max(0, Math.floor(rect.height - opts.paddingPx * 2));
  if (vw < 2 || vh < 2) return null;

  // scaling bounds
  const cx = (b.minLng + b.maxLng) / 2;
  const cy = (b.minLat + b.maxLat) / 2;
  const halfLng = ((b.maxLng - b.minLng) / 2) * opts.scale;
  const halfLat = ((b.maxLat - b.minLat) / 2) * opts.scale;

  const minLng = cx - halfLng;
  const maxLng = cx + halfLng;
  const minLat = cy - halfLat;
  const maxLat = cy + halfLat;

  const x1 = lngToX(minLng);
  const x2 = lngToX(maxLng);
  const y1 = latToY(maxLat);
  const y2 = latToY(minLat);
  const bw = Math.abs(x2 - x1);
  const bh = Math.abs(y2 - y1);

  const Zw = Math.log2(vw / (256 * Math.max(bw, 1e-12)));
  const Zh = Math.log2(vh / (256 * Math.max(bh, 1e-12)));
  const mapOpts: any = (map as any).getOptions?.() ?? {};
  const minZoom = mapOpts.minZoom ?? opts.minZoom;
  const maxZoom = opts.maxZoom ?? mapOpts.maxZoom;

  let zoom = Math.min(Zw, Zh);
  zoom = clampZoom(zoom, minZoom, maxZoom);

  const center = new naver.maps.LatLng(cy, cx);
  return { center, zoom };
}

// Minimize flickering
export function fitLatLngBoundsByScale(
  map: naver.maps.Map,
  b: LatLngBounds,
  opts: {
    scale?: number;
    paddingPx?: number;
    maxZoom?: number;
    minZoom?: number;
    durationMs?: number;
    disableTileFadeDuringMove?: boolean;
  } = {}
) {
  const {
    scale = 1.5,
    paddingPx = 0,
    maxZoom,
    minZoom,
    durationMs = 400,
    disableTileFadeDuringMove = true
  } = opts;

  if (isAnimating(map)) return;

  const cam = computeCameraForScaledBounds(map, b, {
    scale,
    paddingPx,
    minZoom,
    maxZoom
  });
  if (!cam) return;

  let restoreTileDuration: number | undefined;
  if (disableTileFadeDuringMove) {
    const cur: any = (map as any).getOptions?.() ?? {};
    if (typeof cur.tileDuration === 'number') {
      restoreTileDuration = cur.tileDuration;
      map.setOptions({ tileDuration: 0 } as any);
    }
  }

  setAnimating(map, true);

  const hasMorph = typeof (map as any).morph === 'function';
  if (hasMorph) {
    (map as any).morph(cam.center, cam.zoom, { duration: durationMs });
  } else {
    map.setCenter(cam.center);
    map.setZoom(cam.zoom, true);
  }

  naver.maps.Event.once(map, 'idle', () => {
    if (disableTileFadeDuringMove && typeof restoreTileDuration === 'number') {
      map.setOptions({ tileDuration: restoreTileDuration } as any);
    }
    setAnimating(map, false);
  });
}
