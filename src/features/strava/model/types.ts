import type { CoursePoint } from '@/features/course/model/types';

export interface StravaStatus {
  connected: boolean;
}

export interface StravaConnectResponse {
  authUrl: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  sportType: string;
  distance: number;
  movingTime: number;
  elapsedTime: number;
  totalElevationGain: number;
  startDate: string;
  startDateLocal: string;
  timezone: string;
  averageSpeed: number;
  maxSpeed: number;
  summaryPolyline: string;
}

export interface StravaActivitiesResponse {
  activityList: StravaActivity[];
}

export interface StravaActivityGpxResponse {
  totalDistance: number;
  svg: string;
  coursePointList: CoursePoint[];
}

export interface StravaActivitiesParams {
  page?: number;
  perPage?: number;
}
