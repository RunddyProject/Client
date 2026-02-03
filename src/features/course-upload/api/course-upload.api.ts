import type { CourseUploadPayload, CourseUploadResponse } from '../model/types';

// Mock delay to simulate API latency
const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock implementation for course upload
// TODO: Replace with actual API endpoint when available
const mockUploadCourse = async (
  payload: CourseUploadPayload
): Promise<CourseUploadResponse> => {
  await mockDelay(1500); // Simulate network delay

  // Generate a mock UUID
  const uuid = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // In development, log the payload for debugging
  if (import.meta.env.DEV) {
    console.log('[Mock API] Course upload payload:', payload);
  }

  return {
    uuid,
    name: payload.name,
    success: true
  };
};

// Mock reverse geocoding for address lookup
// TODO: Replace with actual Naver Maps API or backend endpoint
const mockReverseGeocode = async (lat: number, _lng: number): Promise<string> => {
  await mockDelay(300);

  // Return a mock Korean address
  // In production, this would call Naver Maps Reverse Geocoding API
  return `서울특별시 임시구 임시동 ${Math.floor(lat * 100) % 100}번지`;
};

export const CourseUploadApi = {
  /**
   * Upload a new course
   * POST /course/upload
   */
  uploadCourse: async (payload: CourseUploadPayload): Promise<CourseUploadResponse> => {
    // TODO: When API is ready, uncomment and use actual endpoint
    // const formData = new FormData();
    // formData.append('gpxFile', payload.gpxFile);
    // formData.append('name', payload.name);
    // formData.append('isMarathon', String(payload.isMarathon));
    // if (payload.envType) formData.append('envType', payload.envType);
    // if (payload.shapeType) formData.append('shapeType', payload.shapeType);
    // formData.append('startAddress', payload.startAddress);
    // formData.append('endAddress', payload.endAddress);
    // formData.append('totalDistance', String(payload.totalDistance));
    // formData.append('elevationGain', String(payload.elevationGain));
    // formData.append('elevationLoss', String(payload.elevationLoss));
    // formData.append('grade', String(payload.grade));
    // formData.append('points', JSON.stringify(payload.points));
    // formData.append('bounds', JSON.stringify(payload.bounds));
    //
    // return api.post<CourseUploadResponse>('/course/upload', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // });

    // Use mock implementation for now
    return mockUploadCourse(payload);
  },

  /**
   * Reverse geocode coordinates to address
   * GET /geocode/reverse?lat={lat}&lng={lng}
   */
  reverseGeocode: async (lat: number, lng: number): Promise<string> => {
    // TODO: When API is ready, use actual endpoint
    // return api.get<{ address: string }>(`/geocode/reverse?lat=${lat}&lng=${lng}`)
    //   .then(res => res.address);

    // Use mock implementation for now
    return mockReverseGeocode(lat, lng);
  },

  /**
   * Import course from Strava
   * POST /course/import/strava
   */
  importFromStrava: async (_activityId: string): Promise<CourseUploadResponse> => {
    // TODO: Implement Strava integration
    // This would typically redirect to Strava OAuth flow first
    // return api.post<CourseUploadResponse>('/course/import/strava', { activityId });

    await mockDelay(1500);
    throw new Error('Strava 연동은 현재 준비 중입니다.');
  }
};
