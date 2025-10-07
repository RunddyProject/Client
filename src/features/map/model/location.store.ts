import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { DEFAULT_CENTER } from '@/features/course/model/contants';

interface Location {
  lat: number;
  lng: number;
}

interface LocationStore {
  userLocation: Location;
  setUserLocation: (location: Location | null) => void;
  isLocationLoading: boolean;
  setIsLocationLoading: (loading: boolean) => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      userLocation: DEFAULT_CENTER,
      isLocationLoading: false,
      setUserLocation: (location) =>
        set({ userLocation: location || DEFAULT_CENTER }),
      setIsLocationLoading: (loading) => set({ isLocationLoading: loading })
    }),
    {
      name: 'user-location',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
