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
  panEnabled?: boolean;
  interactionsEnabled?: boolean;
  onInit?: (map: naver.maps.Map) => void;
  onMarkerClick?: (id: string) => void;
  onOverlayClick?: VoidFunction;
};

export function NaverMap({
  className,
  glassTopOverlay = false,
  center,
  zoom,
  points,
  bounds,
  color,
  markers = [],
  markerSize = 42,
  focusKey,
  fitEnabled = false,
  panEnabled = true,
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

  useEffect(() => {
    if (!map.current) return;

    if (center) {
      map.current.setCenter(new naver.maps.LatLng(center.lat, center.lng));
    }
    if (zoom !== undefined) {
      map.current.setZoom(zoom);
    }
  }, [map, center, zoom]);

  useGpxPolyline(map, polylineRef, points, color, { fit: 'never' });
  useMarkers(map, markerMapRef, markerListenersRef, markers, onMarkerClick, {
    focusKey,
    focusColor: color,
    size: markerSize
  });
  usePanToActiveMarker(map, markerMapRef, panEnabled ? focusKey : null);
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
        <div
          aria-hidden
          className='pointer-events-none absolute inset-x-0 top-0 z-10'
          style={{ height: 'calc(52px + env(safe-area-inset-top))' }}
        >
          {/* Backdrop blur covers the full area (status bar + header) */}
          <div
            className='absolute inset-0'
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              maskImage:
                'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)'
            }}
          />
          {/* White gradient only for header area — starts below the status bar */}
          <div
            className='absolute inset-x-0 bottom-0 bg-gradient-to-b from-white/60 via-white/15 to-transparent'
            style={{ height: '52px' }}
          />
        </div>
      )}
    </>
  );
}
