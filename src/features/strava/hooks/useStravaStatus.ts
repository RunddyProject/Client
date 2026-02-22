import { useQuery } from '@tanstack/react-query';

import { StravaApi } from '../api/strava.api';

export function useStravaStatus() {
  return useQuery({
    queryKey: ['strava', 'status'],
    queryFn: StravaApi.getStatus,
    staleTime: 30_000,
    retry: false
  });
}
