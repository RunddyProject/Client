import { api } from '@/shared/lib/http';

import type { CoursesResponse } from '@/features/course/model/types';

export const CoursesApi = {
  getCourses: async (
    lat: number,
    lng: number,
    radius?: number
  ): Promise<CoursesResponse> => {
    const dist = Number.isFinite(radius) ? Math.max(0, Number(radius)) : 10;
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      dist: String(dist)
    });
    return api.get<CoursesResponse>(`/course?${params.toString()}`, {
      requiresAuth: false
    });
  }
};
