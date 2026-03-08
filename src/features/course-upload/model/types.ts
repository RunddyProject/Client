import type { ElevationChartData } from '@/features/course/lib/elevation';
import type { CoursePoint } from '@/features/course/model/types';

export type UploadMethod = 'direct' | 'strava';

// API Response for POST /course/preview
export interface CoursePreviewResponse {
  totalDistance: number;
  svg: string;
  coursePointList: CoursePoint[];
}

// Data structure for the upload form (direct GPX upload)
export interface CoursePreviewData {
  file: File;
  totalDistance: number;
  svg: string;
  coursePointList: CoursePoint[];
}

// Navigation state passed from Strava activities page to upload page
export interface StravaPreviewState {
  file: File;
  activityName: string;
  totalDistance: number;
  svg: string;
  coursePointList: CoursePoint[];
  elevationChartData: ElevationChartData;
}

export interface CourseUploadFormData {
  name: string;
  isMarathon: boolean | null;
  envType: CourseEnvType | null;
  shapeType: CourseShapeType | null;
  isShared: boolean;
}

// API Request for POST /course/user/upload (direct GPX)
export interface CourseUploadRequest {
  file: File;
  courseName: string;
  isMarathon: boolean;
  courseEnvType?: CourseEnvType;
  courseShapeType?: CourseShapeType;
  startAddress: string;
  endAddress: string;
  isShared: boolean;
}

// API Response for POST /course/user/upload
export interface CourseUploadResponse {
  courseUuid: string;
}

// Enum types matching API
export type CourseEnvType =
  | 'PARK'
  | 'TRAIL'
  | 'TRACK'
  | 'URBAN'
  | 'BEACH'
  | 'MOUNTAIN'
  | 'RIVER'
  | 'FOREST'
  | 'ETC';

export type CourseShapeType =
  | 'LOOP'
  | 'OUT_AND_BACK'
  | 'LINEAR'
  | 'ART'
  | 'ETC';
