import { api } from '@/shared/lib/http';
import { buildQuery } from '@/shared/lib/query';

import type {
  Course,
  CourseDetail,
  CoursePointResponse,
  CourseSearchParams,
  CoursesResponse
} from '@/features/course/model/types';

export const CoursesApi = {
  getCourses: async (
    lat: number,
    lng: number,
    params: CourseSearchParams = {}
  ): Promise<CoursesResponse> => {
    const query = buildQuery({
      lat,
      lng,
      dist: params.dist ?? 10,
      grade: params.grade,
      envType: params.envType,
      minDist: params.minDist,
      maxDist: params.maxDist,
      minEle: params.minEle,
      maxEle: params.maxEle,
      keyword: params.keyword
    });

    return api.get<CoursesResponse>(`/course?${query}`, {
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
