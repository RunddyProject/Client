/**
 * Reverse geocode coordinates to address using Naver Maps API
 * @param lat Latitude
 * @param lng Longitude
 * @returns Address string or null if failed
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  return new Promise((resolve) => {
    if (!window.naver?.maps?.Service) {
      resolve(null);
      return;
    }

    window.naver.maps.Service.reverseGeocode(
      {
        coords: new window.naver.maps.LatLng(lat, lng),
        orders: [
          window.naver.maps.Service.OrderType.ROAD_ADDR,
          window.naver.maps.Service.OrderType.ADDR
        ].join(',')
      },
      (status, response) => {
        if (status !== window.naver.maps.Service.Status.OK) {
          resolve(null);
          return;
        }

        const result = response?.v2?.address;
        if (!result) {
          resolve(null);
          return;
        }

        // Prefer road address, fallback to jibun address
        const address = result.roadAddress || result.jibunAddress || '';
        resolve(address || null);
      }
    );
  });
}
