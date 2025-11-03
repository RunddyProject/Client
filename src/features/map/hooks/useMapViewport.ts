import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DEFAULT_CENTER,
  DEFAULT_RADIUS,
  DEFAULT_ZOOM
} from '@/features/course/model/constants';
import { getDistance } from '@/shared/lib/map';

interface ViewportInfo {
  center: { lat: number; lng: number };
  radius: number; // km
  zoom: number;
}

export const useMapViewport = (mapInstance: naver.maps.Map | null) => {
  const [viewport, setViewport] = useState<ViewportInfo>({
    center: DEFAULT_CENTER,
    radius: DEFAULT_RADIUS,
    zoom: DEFAULT_ZOOM
  });

  const [movedByUser, setMovedByUser] = useState(false);
  const userInteractingRef = useRef(false);
  const initializedRef = useRef(false);

  const updateViewport = useCallback(() => {
    if (!mapInstance) return;

    const bounds = mapInstance.getBounds() as naver.maps.LatLngBounds;
    const center = mapInstance.getCenter() as naver.maps.LatLng;
    const zoom = mapInstance.getZoom();
    if (!bounds || !center) return;

    const ne = bounds.getNE();
    const sw = bounds.getSW();

    const north = { lat: ne.lat(), lng: center.lng() };
    const south = { lat: sw.lat(), lng: center.lng() };
    const east = { lat: center.lat(), lng: ne.lng() };
    const west = { lat: center.lat(), lng: sw.lng() };

    const dN = getDistance(center.lat(), center.lng(), north.lat, north.lng);
    const dS = getDistance(center.lat(), center.lng(), south.lat, south.lng);
    const dE = getDistance(center.lat(), center.lng(), east.lat, east.lng);
    const dW = getDistance(center.lat(), center.lng(), west.lat, west.lng);

    const radiusKm = Math.ceil(Math.max(dN, dS, dE, dW) / 1000);

    setViewport({
      center: { lat: center.lat(), lng: center.lng() },
      radius: Math.max(0.1, Math.min(radiusKm, 200)),
      zoom
    });
  }, [mapInstance]);

  useEffect(() => {
    if (!mapInstance || !window.naver?.maps) return;

    naver.maps.Event.once(mapInstance, 'idle', () => {
      requestAnimationFrame(() => {
        updateViewport();
        initializedRef.current = true;
      });
    });

    const handleInteractionStart = () => {
      userInteractingRef.current = true;
    };

    const handleIdle = () => {
      requestAnimationFrame(() => {
        updateViewport();

        if (userInteractingRef.current) {
          setMovedByUser(true);
          userInteractingRef.current = false;
        }
      });
    };

    const listeners = [
      naver.maps.Event.addListener(
        mapInstance,
        'dragstart',
        handleInteractionStart
      ),
      naver.maps.Event.addListener(
        mapInstance,
        'touchstart',
        handleInteractionStart
      ),
      naver.maps.Event.addListener(
        mapInstance,
        'wheel',
        handleInteractionStart
      ),
      naver.maps.Event.addListener(
        mapInstance,
        'zoom_changed',
        handleInteractionStart
      ),
      naver.maps.Event.addListener(mapInstance, 'idle', handleIdle)
    ];

    return () => listeners.forEach((l) => naver.maps.Event.removeListener(l));
  }, [mapInstance, updateViewport]);

  const resetMovedByUser = useCallback(() => setMovedByUser(false), []);

  return { viewport, movedByUser, resetMovedByUser };
};
