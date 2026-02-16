import type { CoursePoint } from '@/features/course/model/types';
import type {
  CourseEnvType,
  CourseShapeType
} from '@/features/course-upload/model/types';

// GET /course/user response item
export interface UserCourse {
  uuid: string;
  lat: number;
  lng: number;
  name: string;
  envType: CourseEnvType;
  envTypeName: string;
  shapeType: CourseShapeType;
  shapeTypeName: string;
  isMarathon: boolean;
  totalDistance: number; // meters
  svg: string;
}

export interface UserCoursesResponse {
  courseList: UserCourse[];
}

// GET /course/user/summary
export interface UserCourseSummaryResponse {
  myCourseCount: number;
  myTotalDistance: number; // km
}

// GET /course/user/gpx
export interface UserCourseGpxItem {
  courseUuid: string;
  courseShapeType: CourseShapeType;
  coursePointList: CoursePoint[];
}

export interface UserCourseGpxResponse {
  userCourseGpxList: UserCourseGpxItem[];
}

// PATCH /course/{uuid}
export interface CourseUpdateRequest {
  courseName: string;
  isMarathon: boolean;
  courseEnvType?: CourseEnvType;
  courseShapeType?: CourseShapeType;
  startAddress: string;
  endAddress: string;
}

// Edit form data (mirrors CourseUploadFormData)
export interface CourseEditFormData {
  name: string;
  isMarathon: boolean | null;
  envType: CourseEnvType | null;
  shapeType: CourseShapeType | null;
}
