import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import {
  DEFAULT_CENTER,
  DEFAULT_RADIUS,
  DEFAULT_ZOOM
} from '@/features/course/model/constants';

interface Location {
  lat: number;
  lng: number;
}
interface LocationStore {
  userLocation: Location;
  lastSearchedCenter: Location;
  lastSearchedRadius: number;
  lastSearchedZoom: number;
  isLocationLoading: boolean;
  setUserLocation: (location: Location | null) => void;
  setLastSearchedArea: (center: Location, radius: number, zoom: number) => void;
  setIsLocationLoading: (loading: boolean) => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      userLocation: DEFAULT_CENTER,
      lastSearchedCenter: DEFAULT_CENTER,
      lastSearchedRadius: DEFAULT_RADIUS,
      lastSearchedZoom: DEFAULT_ZOOM,
      isLocationLoading: false,
      setUserLocation: (location) =>
        set({ userLocation: location || DEFAULT_CENTER }),
      setLastSearchedArea: (center, radius, zoom) =>
        set({
          lastSearchedCenter: center || DEFAULT_CENTER,
          lastSearchedRadius: radius || DEFAULT_RADIUS,
          lastSearchedZoom: zoom || 12
        }),
      setIsLocationLoading: (loading) => set({ isLocationLoading: loading })
    }),
    {
      name: 'user-location',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
