import { api } from '@/shared/lib/http';

import type {
  CourseUpdateRequest,
  UserCourseGpxResponse,
  UserCourseSummaryResponse,
  UserCoursesResponse
} from '../model/types';

export const MyCourseApi = {
  getUserCourses: (): Promise<UserCoursesResponse> =>
    api.get<UserCoursesResponse>('/course/user'),

  getUserCourseSummary: (): Promise<UserCourseSummaryResponse> =>
    api.get<UserCourseSummaryResponse>('/course/user/summary'),

  getUserCourseGpx: (): Promise<UserCourseGpxResponse> =>
    api.get<UserCourseGpxResponse>('/course/user/gpx'),

  updateCourse: (uuid: string, data: CourseUpdateRequest): Promise<void> =>
    api.patch(`/course/${uuid}`, data),

  deleteCourse: (uuid: string): Promise<void> => api.delete(`/course/${uuid}`)
};
