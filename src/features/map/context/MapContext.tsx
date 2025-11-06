import { createContext, useContext, useRef } from 'react';

type MapContextType = {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  mapInstanceRef: React.RefObject<naver.maps.Map | null>;
  polylineRef: React.RefObject<naver.maps.Polyline | null>;
};

const MapContext = createContext<MapContextType | null>(null);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);

  return (
    <MapContext.Provider
      value={{ mapContainerRef, mapInstanceRef, polylineRef }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useSharedMap = () => {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useSharedMap must be used within MapProvider');
  return ctx;
};
