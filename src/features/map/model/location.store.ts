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

interface CourseMapState {
  courseUuid: string;
  center: Location;
  zoom: number;
}

interface LocationStore {
  userLocation: Location | null;
  lastSearchedCenter: Location;
  lastSearchedRadius: number;
  lastSearchedZoom: number;
  currentMapCenter: Location | null;
  currentMapZoom: number | null;
  activeCourseId: string | null;
  isLocationLoading: boolean;
  keywordCenter?: LatLng | null;
  lastViewMode: 'map' | 'list';
  lastListScrollPosition: number;
  courseDetailMapState: CourseMapState | null;
  setUserLocation: (location: Location | null) => void;
  setLastSearchedArea: (center: Location, radius: number, zoom: number) => void;
  setCurrentMapView: (center: Location, zoom: number) => void;
  setActiveCourseId: (id: string | null) => void;
  setIsLocationLoading: (loading: boolean) => void;
  setKeywordCenter: (center: LatLng | null) => void;
  setLastViewMode: (mode: 'map' | 'list') => void;
  setLastListScrollPosition: (position: number) => void;
  setCourseDetailMapState: (state: CourseMapState | null) => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      userLocation: null,
      lastSearchedCenter: DEFAULT_CENTER,
      lastSearchedRadius: DEFAULT_RADIUS,
      lastSearchedZoom: DEFAULT_ZOOM,
      currentMapCenter: null,
      currentMapZoom: null,
      activeCourseId: null,
      isLocationLoading: false,
      lastViewMode: 'map' as 'map' | 'list',
      lastListScrollPosition: 0,
      courseDetailMapState: null,
      setUserLocation: (location) => set({ userLocation: location }),
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
      setKeywordCenter: (center) => set({ keywordCenter: center }),
      setLastViewMode: (mode) => set({ lastViewMode: mode }),
      setLastListScrollPosition: (position) =>
        set({ lastListScrollPosition: position }),
      setCourseDetailMapState: (state) => set({ courseDetailMapState: state })
    }),
    {
      name: 'user-location',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
