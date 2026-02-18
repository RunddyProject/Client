import { api } from '@/shared/lib/http';

import type {
  EditUserCourseRequest,
  UserCourseGpxResponse,
  UserCourseSummary,
  UserCoursesResponse
} from '../model/types';

export const MyCourseApi = {
  /** 사용자 코스 목록 */
  getUserCourses: (): Promise<UserCoursesResponse> =>
    api.get<UserCoursesResponse>('/course/user'),

  /** 사용자 코스 통계 */
  getUserCourseSummary: (): Promise<UserCourseSummary> =>
    api.get<UserCourseSummary>('/course/user/summary'),

  /** 사용자 코스 GPX 일괄 조회 (지도용) */
  getUserCourseGpxList: (): Promise<UserCourseGpxResponse> =>
    api.get<UserCourseGpxResponse>('/course/user/gpx'),

  /** 사용자 코스 수정 */
  editUserCourse: (uuid: string, data: EditUserCourseRequest): Promise<void> =>
    api.patch(`/course/${uuid}`, data),

  /** 사용자 코스 삭제 */
  deleteUserCourse: (uuid: string): Promise<void> =>
    api.delete(`/course/${uuid}`)
};
