import type { CoursePoint, EnvType, ShapeType } from '@/features/course/model/types';

// ─── GET /course/user ────────────────────────────
export interface UserCourse {
  uuid: string;
  lat: number;
  lng: number;
  name: string;
  envType: EnvType;
  envTypeName: string;
  shapeType: ShapeType;
  shapeTypeName: string;
  isMarathon: boolean;
  totalDistance: number; // 미터(m)
  svg: string;
}

export interface UserCoursesResponse {
  courseList: UserCourse[];
}

// ─── GET /course/user/summary ────────────────────
export interface UserCourseSummary {
  myCourseCount: number;
  myTotalDistance: number; // km
}

// ─── GET /course/user/gpx ────────────────────────
export interface UserCourseGpxItem {
  courseUuid: string;
  courseShapeType: ShapeType;
  coursePointList: CoursePoint[];
}

export interface UserCourseGpxResponse {
  userCourseGpxList: UserCourseGpxItem[];
}

// ─── PATCH /course/{courseUuid} ───────────────────
export interface EditUserCourseRequest {
  courseName: string;
  isMarathon: boolean;
  courseEnvType: string | null;
  courseShapeType: string | null;
  startAddress: string;
  endAddress: string;
}
