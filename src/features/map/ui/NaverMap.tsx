import { useFocusPan } from '@/features/map/hooks/useFocusPan';
import { useGpxPolyline } from '@/features/map/hooks/useGpxPolyline';
import { useMarkers, type MarkerInput } from '@/features/map/hooks/useMarkers';
import { useNaverMap } from '@/features/map/hooks/useNaverMap';

import type GPXParser from 'gpxparser';

type Props = {
  className?: string;
  glassTopOverlay?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
  gpxData?: GPXParser;
  markers?: MarkerInput[];
  focusKey?: string;
  onMarkerClick?: (id: string) => void;
};

const DEFAULT_CENTER = { lat: 37.575959, lng: 126.97679 };

export function NaverMap({
  className,
  glassTopOverlay = true,
  center = DEFAULT_CENTER,
  zoom = 12,
  gpxData,
  markers = [],
  focusKey,
  onMarkerClick
}: Props) {
  const { mapRef, map, markerMapRef, markerListenersRef, polylineRef } =
    useNaverMap(center, zoom);

  useGpxPolyline(map, polylineRef, gpxData);
  useMarkers(map, markerMapRef, markerListenersRef, markers, onMarkerClick);
  useFocusPan(map, markerMapRef, focusKey, 60);

  return (
    <>
      <div
        ref={mapRef}
        className={className}
        style={{ width: '100%', height: '100%' }}
      />
      {glassTopOverlay && (
        <div className="absolute top-0 z-10 h-13 w-full bg-transparent pt-[env(safe-area-inset-top)] before:pointer-events-none before:absolute before:inset-0 before:[mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_85%)] before:backdrop-blur-[20px] before:content-[''] before:[-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,0)_85%)] after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/60 after:via-white/15 after:to-transparent after:content-['']" />
      )}
    </>
  );
}
