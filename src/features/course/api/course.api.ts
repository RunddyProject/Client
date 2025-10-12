import { api } from '@/shared/lib/http';

import type {
  Course,
  CourseDetail,
  CoursePointResponse,
  CoursesResponse
} from '@/features/course/model/types';

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
  },
  getCoursePoint: async (
    uuid: Course['uuid']
  ): Promise<CoursePointResponse> => {
    return api.get<CoursePointResponse>(`/course/${uuid}/point`, {
      requiresAuth: false
    });
  },
  getCourseDetail: async (uuid: Course['uuid']): Promise<CourseDetail> => {
    return api.get<CourseDetail>(`/course/${uuid}`, {
      requiresAuth: false
    });
  },
  getCourseGpx: async (uuid: Course['uuid']): Promise<void> => {
    return api.download(`/course/${uuid}/gpx`, {
      headers: { Accept: 'application/gpx+xml' },
      fallbackName: 'route.gpx', // TODO: courseName
      requiresAuth: false
    });
  }
};
