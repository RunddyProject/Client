export type MarkerKind = 'start' | 'end';
export type MarkerInput = {
  id: string;
  lat: number;
  lng: number;
  kind: MarkerKind;
};
export type LatLngBounds = {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
};
