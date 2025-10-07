import { useEffect, useRef } from 'react';

import type { Point } from 'gpxparser';
import type GPXParser from 'gpxparser';

type MarkerInput = {
  id: string;
  lat: number;
  lng: number;
};

interface NaverMapProps {
  className?: string;
  glassTopOverlay?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
  gpxData?: GPXParser;
  markers?: MarkerInput[];
  focusKey?: string; // active course id
  onMarkerClick?: (id: string) => void;
}

// coordinate 광화문
const DEFAULT_CENTER = {
  lat: 37.575959,
  lng: 126.97679
};

export const NaverMap = ({
  className,
  glassTopOverlay = true,
  center = DEFAULT_CENTER,
  zoom = 12,
  gpxData,
  markers = [],
  focusKey,
  onMarkerClick
}: NaverMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);

  const markerMapRef = useRef<Map<string, naver.maps.Marker>>(new Map());
  const markerListenersRef = useRef<Map<string, naver.maps.EventListener>>(
    new Map()
  );

  // Map
  useEffect(() => {
    if (!mapRef.current || !window.naver?.maps) return;

    // Initialize map
    const mapOptions: naver.maps.MapOptions = {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom,
      zoomControl: false,
      mapTypeControl: false
    };

    mapInstanceRef.current = new window.naver.maps.Map(
      mapRef.current,
      mapOptions
    );

    return () => {
      markerListenersRef.current.forEach((l) =>
        naver.maps.Event.removeListener(l)
      );
      markerListenersRef.current.clear();
      markerMapRef.current.forEach((m) => m.setMap(null));
      markerMapRef.current.clear();
    };
  }, [center.lat, center.lng, zoom]);

  // GPX
  useEffect(() => {
    if (!mapInstanceRef.current || !gpxData) return;

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Create polyline from GPX data
    const path =
      gpxData.tracks[0]?.points?.map(
        (point: Point) => new window.naver.maps.LatLng(point.lat, point.lon)
      ) || [];

    if (path.length > 0) {
      polylineRef.current = new window.naver.maps.Polyline({
        path,
        strokeColor: 'hsl(var(--primary))',
        strokeWeight: 4,
        strokeOpacity: 0.9,
        map: mapInstanceRef.current
      });

      // Fit map to track bounds with proper padding
      const bounds = new window.naver.maps.LatLngBounds();
      path.forEach((coord) => bounds.extend(coord));

      // Use setTimeout to ensure map is fully rendered before fitting bounds
      setTimeout(() => {
        mapInstanceRef.current?.fitBounds(bounds, {
          top: 80,
          right: 80,
          bottom: 80,
          left: 80
        });
      }, 100);
    }
  }, [gpxData]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const existing = markerMapRef.current;
    const listeners = markerListenersRef.current;
    const incomingIds = new Set(markers.map((m) => m.id));

    for (const [id, mk] of existing) {
      if (!incomingIds.has(id)) {
        mk.setMap(null);
        existing.delete(id);
        const l = listeners.get(id);
        if (l) {
          naver.maps.Event.removeListener(l);
          listeners.delete(id);
        }
      }
    }

    markers.forEach((m) => {
      const pos = new naver.maps.LatLng(m.lat, m.lng);
      let mk = existing.get(m.id);

      if (!mk) {
        mk = new naver.maps.Marker({
          position: pos,
          map,
          icon: '/pin_default.svg'
        });
        existing.set(m.id, mk);

        const l = naver.maps.Event.addListener(mk, 'click', () =>
          onMarkerClick?.(m.id)
        );
        listeners.set(m.id, l);
      } else {
        mk.setPosition(pos);
        mk.setIcon('/pin_default.svg');
      }
    });
  }, [markers, onMarkerClick]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusKey) return;
    const mk = markerMapRef.current.get(focusKey);
    if (!mk) return;

    const pos = mk.getPosition();
    const proj = map.getProjection();
    if (!proj) {
      map.panTo(pos, { duration: 300 });
      return;
    }
    const screen = proj.fromCoordToOffset(pos);
    const nudgeY = 60; // px
    const nudged = proj.fromOffsetToCoord(
      new naver.maps.Point(screen.x, screen.y - nudgeY)
    );
    map.panTo(nudged, { duration: 300 });
  }, [focusKey]);

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
};
