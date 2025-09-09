import type { Point } from 'gpxparser';
import type GPXParser from 'gpxparser';
import { useEffect, useRef } from 'react';

interface NaverMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  gpxData?: GPXParser;
  className?: string;
}

export const NaverMap = ({ center = { lat: 37.5665, lng: 126.978 }, zoom = 12, gpxData, className }: NaverMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.naver?.maps) return;

    // Initialize map
    const mapOptions = {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom: zoom,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
        style: window.naver.maps.ZoomControlStyle.SMALL,
      },
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: window.naver.maps.Position.TOP_LEFT,
      },
    };

    mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, mapOptions);
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !gpxData) return;

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Create polyline from GPX data
    const path =
      gpxData.tracks[0]?.points?.map((point: Point) => new window.naver.maps.LatLng(point.lat, point.lon)) || [];

    if (path.length > 0) {
      polylineRef.current = new window.naver.maps.Polyline({
        path: path,
        strokeColor: 'hsl(var(--primary))',
        strokeWeight: 4,
        strokeOpacity: 0.9,
        map: mapInstanceRef.current,
      });

      // Fit map to track bounds with proper padding
      const bounds = new window.naver.maps.LatLngBounds();
      path.forEach((coord: naver.maps.LatLng) => bounds.extend(coord));

      // Use setTimeout to ensure map is fully rendered before fitting bounds
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
        }
      }, 100);
    }
  }, [gpxData]);

  return <div ref={mapRef} className={className} style={{ width: '100%', height: '100%' }} />;
};
