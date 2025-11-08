import { useEffect } from 'react';

import { useFitLatLngBoundsScale } from '@/features/map/hooks/useFitLatLngBoundsScale';
import { useGpxPolyline } from '@/features/map/hooks/useGpxPolyline';
import { useMarkers } from '@/features/map/hooks/useMarkers';
import { useNaverMap } from '@/features/map/hooks/useNaverMap';
import { usePanToActiveMarker } from '@/features/map/hooks/usePanToActiveMarker';

import type { Course, CoursePoint } from '@/features/course/model/types';
import type { MarkerInput, LatLngBounds } from '@/features/map/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

type Props = {
  className?: string;
  glassTopOverlay?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
  points?: CoursePoint[];
  bounds?: LatLngBounds;
  color?: RUNDDY_COLOR;
  markers?: MarkerInput[];
  markerSize?: number;
  focusKey?: Course['uuid'];
  fitEnabled?: boolean;
  interactionsEnabled?: boolean;
  onInit?: (map: naver.maps.Map) => void;
  onMarkerClick?: (id: string) => void;
  onOverlayClick?: VoidFunction;
};

export function NaverMap({
  className,
  glassTopOverlay = false,
  points,
  bounds,
  color,
  markers = [],
  markerSize = 42,
  focusKey,
  fitEnabled = false,
  interactionsEnabled = true,
  onInit,
  onMarkerClick,
  onOverlayClick
}: Props) {
  const { mapRef, map, markerMapRef, markerListenersRef, polylineRef } =
    useNaverMap();

  useEffect(() => {
    if (!map.current) return;

    onInit?.(map.current);

    map.current.setOptions({
      draggable: interactionsEnabled,
      scrollWheel: interactionsEnabled,
      pinchZoom: interactionsEnabled,
      keyboardShortcuts: interactionsEnabled,
      disableDoubleTapZoom: !interactionsEnabled,
      disableDoubleClickZoom: !interactionsEnabled,
      disableTwoFingerTapZoom: !interactionsEnabled
    });
  }, [map, interactionsEnabled, onInit]);

  useGpxPolyline(map, polylineRef, points, color, { fit: 'never' });
  useMarkers(map, markerMapRef, markerListenersRef, markers, onMarkerClick, {
    focusKey,
    focusColor: color,
    size: markerSize
  });
  usePanToActiveMarker(map, markerMapRef, focusKey);
  useFitLatLngBoundsScale(
    map,
    fitEnabled ? bounds : undefined,
    fitEnabled
      ? {
          scale: 1.5,
          paddingPx: 0,
          maxZoom: 16,
          oncePerKey: focusKey ?? 'gpx',
          settleDelay: 120,
          durationMs: 400,
          disableTileFadeDuringMove: true,
          observeResize: true
        }
      : {}
  );

  return (
    <>
      <div
        ref={mapRef}
        className={className}
        style={{ width: '100%', height: '100%' }}
      />

      {!interactionsEnabled && (
        <div
          aria-hidden
          className='absolute inset-0 z-20'
          style={{
            pointerEvents: 'auto',
            touchAction: 'none',
            cursor: 'default',
            overscrollBehavior: 'none'
          }}
          onPointerUp={() => onOverlayClick?.()}
        />
      )}

      {glassTopOverlay && (
        <div className="absolute top-0 z-10 h-13 w-full bg-transparent pt-[env(safe-area-inset-top)] before:pointer-events-none before:absolute before:inset-0 before:[mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_100%)] before:backdrop-blur-[20px] before:content-[''] before:[-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_85%)] after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/60 after:via-white/15 after:to-transparent after:content-['']" />
      )}
    </>
  );
}
