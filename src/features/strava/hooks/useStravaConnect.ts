import { useCallback, useState } from 'react';

import { ApiError } from '@/shared/lib/http';

import { StravaApi } from '../api/strava.api';

export function useStravaConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const { authUrl } = await StravaApi.getConnectUrl();
      window.location.href = authUrl;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.body || err.message
          : 'Strava 연결에 실패했어요';
      setError(message);
      setIsConnecting(false);
    }
  }, []);

  return { connect, isConnecting, error };
}
