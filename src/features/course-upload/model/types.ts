import type { EnvType, GradeType, ShapeType } from '@/features/course/model/types';
import type GPXParser from 'gpxparser';

export type UploadMethod = 'direct' | 'strava';

export interface GpxUploadData {
  file: File;
  gpxParser: GPXParser;
  stats: GpxStats;
  points: GpxPoint[];
  bounds: GpxBounds;
}

export interface GpxPoint {
  lat: number;
  lng: number;
  ele: number;
  pointSeq: number;
}

export interface GpxBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface GpxStats {
  totalDistance: number; // meters
  elevationGain: number; // meters
  elevationLoss: number; // meters
  minElevation: number;
  maxElevation: number;
  duration: number; // seconds
  avgPace: string;
  grade: GradeType;
}

export interface CourseUploadFormData {
  name: string;
  isMarathon: boolean | null;
  envType: EnvType | null;
  shapeType: ShapeType | null;
  runningPace?: string;
}

export interface CourseUploadPayload {
  name: string;
  isMarathon: boolean;
  envType?: EnvType;
  shapeType?: ShapeType;
  runningPace?: string;
  gpxFile: File;
  startAddress: string;
  endAddress: string;
  totalDistance: number;
  elevationGain: number;
  elevationLoss: number;
  grade: GradeType;
  points: GpxPoint[];
  bounds: GpxBounds;
}

export interface CourseUploadResponse {
  uuid: string;
  name: string;
  success: boolean;
}

export interface ElevationChartDataPoint {
  dKm: number;
  ele: number;
}
