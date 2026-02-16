import type { CoursePoint } from '@/features/course/model/types';

export type UploadMethod = 'direct' | 'strava';

// API Response for POST /course/preview
export interface CoursePreviewResponse {
  totalDistance: number;
  svg: string;
  coursePointList: CoursePoint[];
}

// Data structure for the upload form
export interface CoursePreviewData {
  file: File;
  totalDistance: number;
  svg: string;
  coursePointList: CoursePoint[];
}

export interface CourseUploadFormData {
  name: string;
  isMarathon: boolean | null;
  envType: CourseEnvType | null;
  shapeType: CourseShapeType | null;
}

// API Request for POST /course/user/upload
export interface CourseUploadRequest {
  file: File;
  courseName: string;
  isMarathon: boolean;
  courseEnvType?: CourseEnvType;
  courseShapeType?: CourseShapeType;
  startAddress: string;
  endAddress: string;
}

// API Response for POST /course/user/upload
export interface CourseUploadResponse {
  uuid: string;
  name: string;
  success: boolean;
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
  | 'FOREST';

export type CourseShapeType =
  | 'LOOP'
  | 'OUT_AND_BACK'
  | 'LINEAR'
  | 'ART';
