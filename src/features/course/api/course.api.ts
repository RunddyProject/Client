import { api } from '@/shared/lib/http';
import { buildQuery } from '@/shared/lib/query';

import type {
  Course,
  CourseDetail,
  CourseFilterPayload,
  CoursePointResponse,
  CourseReviewFormResponse,
  CourseReviewPatchRequest,
  CourseReviewResponse,
  CourseSearchParams,
  CoursesResponse,
  FilterCountResponse
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
      radius: params.radius ?? 10,
      grade: params.grade,
      shapeType: params.shapeType,
      envType: params.envType,
      minDist: params.minDist ? params.minDist * 1000 : undefined,
      maxDist: params.maxDist ? params.maxDist * 1000 : undefined,
      minEle: params.minEle ? params.minEle * 1000 : undefined,
      maxEle: params.maxEle ? params.maxEle * 1000 : undefined,
      keyword: params.keyword,
      isMarathon: params.isMarathon ? 'true' : undefined
    });

    return api.get<CoursesResponse>(`/course?${query}`);
  },
  getFilteredCourseCount(
    filter: CourseFilterPayload
  ): Promise<FilterCountResponse> {
    return api.post<FilterCountResponse>('/course/filter/count', filter);
  },
  getCoursePoint: async (
    uuid: Course['uuid']
  ): Promise<CoursePointResponse> => {
    return api.get<CoursePointResponse>(`/course/${uuid}/point`);
  },
  getCourseDetail: async (uuid: Course['uuid']): Promise<CourseDetail> => {
    return api.get<CourseDetail>(`/course/${uuid}`);
  },
  getCourseGpx: async (uuid: Course['uuid']): Promise<void> => {
    return api.download(`/course/${uuid}/gpx`, {
      headers: { Accept: 'application/gpx+xml' },
      fallbackName: 'route.gpx'
    });
  },
  getCourseReview: async (
    uuid: Course['uuid']
  ): Promise<CourseReviewResponse> => {
    return api.get<CourseReviewResponse>(`/course/${uuid}/review`);
  },
  getCourseReviewForm: async (
    uuid: Course['uuid']
  ): Promise<CourseReviewFormResponse> => {
    return api.get<CourseReviewFormResponse>(`/course/${uuid}/review/detail`);
  },
  patchCourseReview: async (
    uuid: Course['uuid'],
    body: CourseReviewPatchRequest
  ): Promise<void> => {
    return api.patch(`/course/${uuid}/review/detail`, body);
  },
  deleteCourseReview: async (uuid: Course['uuid']): Promise<void> => {
    return api.delete(`/course/${uuid}/review/detail`);
  }
};
