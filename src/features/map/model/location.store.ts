import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import {
  DEFAULT_CENTER,
  DEFAULT_RADIUS,
  DEFAULT_ZOOM
} from '@/features/course/model/constants';

import type { LatLng } from '@/features/map/hooks/useNaverMap';

interface Location {
  lat: number;
  lng: number;
}
interface LocationStore {
  userLocation: Location;
  lastSearchedCenter: Location;
  lastSearchedRadius: number;
  lastSearchedZoom: number;
  currentMapCenter: Location | null;
  currentMapZoom: number | null;
  activeCourseId: string | null;
  isLocationLoading: boolean;
  keywordCenter?: LatLng | null;
  setUserLocation: (location: Location | null) => void;
  setLastSearchedArea: (center: Location, radius: number, zoom: number) => void;
  setCurrentMapView: (center: Location, zoom: number) => void;
  setActiveCourseId: (id: string | null) => void;
  setIsLocationLoading: (loading: boolean) => void;
  setKeywordCenter: (center: LatLng | null) => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      userLocation: DEFAULT_CENTER,
      lastSearchedCenter: DEFAULT_CENTER,
      lastSearchedRadius: DEFAULT_RADIUS,
      lastSearchedZoom: DEFAULT_ZOOM,
      currentMapCenter: null,
      currentMapZoom: null,
      activeCourseId: null,
      isLocationLoading: false,
      setUserLocation: (location) =>
        set({ userLocation: location || DEFAULT_CENTER }),
      setLastSearchedArea: (center, radius, zoom) =>
        set({
          lastSearchedCenter: center || DEFAULT_CENTER,
          lastSearchedRadius: radius || DEFAULT_RADIUS,
          lastSearchedZoom: zoom || 12
        }),
      setCurrentMapView: (center, zoom) =>
        set({ currentMapCenter: center, currentMapZoom: zoom }),
      setActiveCourseId: (id) => set({ activeCourseId: id }),
      setIsLocationLoading: (loading) => set({ isLocationLoading: loading }),
      setKeywordCenter: (center) => set({ keywordCenter: center })
    }),
    {
      name: 'user-location',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
