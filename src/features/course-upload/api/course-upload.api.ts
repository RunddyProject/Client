import { api } from '@/shared/lib/http';

import type {
  CoursePreviewResponse,
  CourseUploadRequest,
  CourseUploadResponse,
  StravaUploadRequest
} from '@/features/course-upload/model/types';

export const CourseUploadApi = {
  /**
   * Preview course from GPX file
   * POST /course/preview
   */
  previewCourse: async (file: File): Promise<CoursePreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return api.postForm<CoursePreviewResponse>('/course/preview', formData);
  },

  /**
   * Upload user course
   * POST /course/user/upload
   */
  uploadCourse: async (
    request: CourseUploadRequest
  ): Promise<CourseUploadResponse> => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('courseName', request.courseName);
    formData.append('isMarathon', String(request.isMarathon));
    if (request.courseEnvType) {
      formData.append('courseEnvType', request.courseEnvType);
    }
    if (request.courseShapeType) {
      formData.append('courseShapeType', request.courseShapeType);
    }
    formData.append('startAddress', request.startAddress);
    formData.append('endAddress', request.endAddress);

    return api.postForm<CourseUploadResponse>('/course/user/upload', formData);
  },

  /**
   * Register course from a connected Strava activity
   * POST /strava/activities/{activityId}/register
   */
  uploadStravaActivity: (
    request: StravaUploadRequest
  ): Promise<CourseUploadResponse> =>
    api.post<CourseUploadResponse>(
      `/strava/activities/${request.stravaActivityId}/register`,
      {
        courseName: request.courseName,
        isMarathon: request.isMarathon,
        courseEnvType: request.courseEnvType,
        courseShapeType: request.courseShapeType,
        startAddress: request.startAddress,
        endAddress: request.endAddress
      }
    )
};
