import { useState } from 'react';
import { toast } from 'sonner';

import { useLocationStore } from '@/features/map/model/location.store';

interface GeolocationResult {
  lat: number;
  lng: number;
}

export const useGeolocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUserLocation } = useLocationStore();

  const getCurrentLocation = (): Promise<GeolocationResult> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast('위치 서비스 미지원');
        reject(new Error('Geolocation not supported'));
        return;
      }

      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          const result = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(result);

          toast.success('현재 위치 설정 완료');
          resolve(result);
        },
        (error) => {
          setIsLoading(false);
          console.error('Failed to get location:', error);
          toast.error('위치 정보 가져오기 실패');
          reject(error);
        }
      );
    });
  };

  return {
    getCurrentLocation,
    isLoading
  };
};
