import { api } from '@/shared/lib/http';
import { buildQuery } from '@/shared/lib/query';

import type {
  StravaActivitiesParams,
  StravaActivitiesResponse,
  StravaActivityGpxResponse,
  StravaConnectResponse,
  StravaStatus
} from '@/features/strava/model/types';

export const StravaApi = {
  /**
   * GET /strava/status
   * Check if the current user has a connected Strava account.
   */
  getStatus: () => api.get<StravaStatus>('/strava/status'),

  /**
   * GET /strava/connect
   * Get the Strava OAuth authorization URL to initiate account linking.
   */
  getConnectUrl: () => api.get<StravaConnectResponse>('/strava/connect'),

  /**
   * GET /strava/activities?page=&perPage=
   * Fetch paginated list of Strava activities for the connected account.
   */
  getActivities: (params?: StravaActivitiesParams) => {
    const query = buildQuery({
      page: params?.page,
      perPage: params?.perPage
    });
    const endpoint = query
      ? `/strava/activities?${query}`
      : '/strava/activities';
    return api.get<StravaActivitiesResponse>(endpoint);
  },

  /**
   * GET /strava/activities/{activityId}/gpx
   * Fetch GPX data and SVG preview for a specific Strava activity.
   */
  getActivityGpx: (activityId: number) =>
    api.get<StravaActivityGpxResponse>(`/strava/activities/${activityId}/gpx`)
};
