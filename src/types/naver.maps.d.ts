declare global {
  namespace naver {
    namespace maps {
      /* ========== Basic coordinate classes ========== */
      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }

      class LatLngBounds {
        constructor(sw?: LatLng, ne?: LatLng);
        extend(latlng: LatLng): void;
        getNE(): LatLng;
        getSW(): LatLng;
      }

      /* ========== Enums ========== */
      enum Position {
        TOP_LEFT,
        TOP_CENTER,
        TOP_RIGHT,
        LEFT_TOP,
        LEFT_CENTER,
        LEFT_BOTTOM,
        RIGHT_TOP,
        RIGHT_CENTER,
        RIGHT_BOTTOM,
        BOTTOM_LEFT,
        BOTTOM_CENTER,
        BOTTOM_RIGHT,
      }

      enum ZoomControlStyle {
        LARGE,
        SMALL,
      }

      /* ========== Map Options ========== */
      interface ZoomControlOptions {
        position?: Position;
        style?: ZoomControlStyle;
        // Extension point for extra undocumented properties
        [key: string]: unknown;
      }

      interface MapTypeControlOptions {
        position?: Position;
        // Extension point for extra undocumented properties
        [key: string]: unknown;
      }

      interface MapOptions {
        center?: LatLng;
        zoom?: number;
        zoomControl?: boolean;
        zoomControlOptions?: ZoomControlOptions;
        mapTypeControl?: boolean;
        mapTypeControlOptions?: MapTypeControlOptions;
        // Allow unknown extra properties from SDK updates
        [key: string]: unknown;
      }

      type BoundsPadding = number | { top: number; right: number; bottom: number; left: number };

      /* ========== Map ========== */
      class Map {
        constructor(el: HTMLElement | string, options?: MapOptions);
        fitBounds(bounds: LatLngBounds, padding?: BoundsPadding): void;
        setCenter(latlng: LatLng): void;
        setZoom(zoom: number, immediately?: boolean): void;
        getZoom(): number;
        getCenter(): LatLng;
      }

      /* ========== Polyline ========== */
      interface PolylineOptions {
        path: LatLng[];
        strokeColor?: string;
        strokeWeight?: number;
        strokeOpacity?: number;
        map?: Map;
        // Allow extension
        [key: string]: unknown;
      }

      class Polyline {
        constructor(options: PolylineOptions);
        setMap(map: Map | null): void;
        getPath(): LatLng[];
        setPath(path: LatLng[]): void;
      }

      /* ========== Marker (optional) ========== */
      interface MarkerOptions {
        position: LatLng;
        map?: Map;
        title?: string;
        icon?: string | { url: string };
        draggable?: boolean;
        visible?: boolean;
        zIndex?: number;
        [key: string]: unknown;
      }

      class Marker {
        constructor(options: MarkerOptions);
        setMap(map: Map | null): void;
        getPosition(): LatLng;
        setPosition(pos: LatLng): void;
      }
    }
  }
}

/* ========== Global declaration ========== */
declare global {
  interface Window {
    naver: typeof naver;
  }
}

export {};
