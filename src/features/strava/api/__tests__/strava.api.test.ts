import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mock: @/shared/lib/http ──────────────────────────────────────────────────
vi.mock('@/shared/lib/http', () => ({
  api: {
    get: vi.fn()
  }
}));

// ─── Mock: @/shared/lib/query ────────────────────────────────────────────────
vi.mock('@/shared/lib/query', () => ({
  buildQuery: (params: Record<string, unknown>) => {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined);
    if (!entries.length) return '';
    return entries.map(([k, v]) => `${k}=${v}`).join('&');
  }
}));

import { api } from '@/shared/lib/http';

import { StravaApi } from '../strava.api';

const mockGet = vi.mocked(api.get);

// ─── Fixtures ────────────────────────────────────────────────────────────────
const mockActivity = {
  id: 1,
  name: 'Morning Run',
  sportType: 'Run',
  distance: 5000,
  movingTime: 1800,
  elapsedTime: 2000,
  totalElevationGain: 50,
  startDate: '2024-01-01T07:00:00Z',
  startDateLocal: '2024-01-01T16:00:00+09:00',
  timezone: 'Asia/Seoul',
  averageSpeed: 2.77,
  maxSpeed: 4.0,
  summaryPolyline: 'abc123'
};

const mockGpxResponse = {
  totalDistance: 5000,
  svg: '<svg>route</svg>',
  coursePointList: [
    { pointSeq: 1, lat: 37.5, lng: 127.0, ele: 10 },
    { pointSeq: 2, lat: 37.6, lng: 127.1, ele: 20 }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────

describe('StravaApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getStatus ──────────────────────────────────────────────────────────────
  describe('getStatus', () => {
    it('GET /strava/status 호출', async () => {
      mockGet.mockResolvedValueOnce({ connected: true });

      const result = await StravaApi.getStatus();

      expect(mockGet).toHaveBeenCalledWith('/strava/status');
      expect(result).toEqual({ connected: true });
    });

    it('연결되지 않은 경우 connected: false 반환', async () => {
      mockGet.mockResolvedValueOnce({ connected: false });

      const result = await StravaApi.getStatus();

      expect(result.connected).toBe(false);
    });
  });

  // ── getConnectUrl ──────────────────────────────────────────────────────────
  describe('getConnectUrl', () => {
    it('GET /strava/connect 호출 후 authUrl 반환', async () => {
      const authUrl = 'https://strava.com/oauth/authorize?client_id=123';
      mockGet.mockResolvedValueOnce({ authUrl });

      const result = await StravaApi.getConnectUrl();

      expect(mockGet).toHaveBeenCalledWith('/strava/connect');
      expect(result.authUrl).toBe(authUrl);
    });
  });

  // ── getActivities ──────────────────────────────────────────────────────────
  describe('getActivities', () => {
    it('params 없을 때 쿼리스트링 없이 호출', async () => {
      mockGet.mockResolvedValueOnce({ activityList: [] });

      await StravaApi.getActivities();

      expect(mockGet).toHaveBeenCalledWith('/strava/activities');
    });

    it('page + perPage 전달 시 쿼리스트링 포함하여 호출', async () => {
      mockGet.mockResolvedValueOnce({ activityList: [] });

      await StravaApi.getActivities({ page: 2, perPage: 30 });

      expect(mockGet).toHaveBeenCalledWith(
        '/strava/activities?page=2&perPage=30'
      );
    });

    it('활동 목록 반환', async () => {
      mockGet.mockResolvedValueOnce({ activityList: [mockActivity] });

      const result = await StravaApi.getActivities();

      expect(result.activityList).toHaveLength(1);
      expect(result.activityList[0].id).toBe(1);
      expect(result.activityList[0].name).toBe('Morning Run');
    });

    it('빈 활동 목록 반환', async () => {
      mockGet.mockResolvedValueOnce({ activityList: [] });

      const result = await StravaApi.getActivities();

      expect(result.activityList).toHaveLength(0);
    });
  });

  // ── getActivityGpx ─────────────────────────────────────────────────────────
  describe('getActivityGpx', () => {
    it('GET /strava/activities/:id/gpx 호출', async () => {
      mockGet.mockResolvedValueOnce(mockGpxResponse);

      await StravaApi.getActivityGpx(12345);

      expect(mockGet).toHaveBeenCalledWith('/strava/activities/12345/gpx');
    });

    it('GPX 응답 데이터 반환', async () => {
      mockGet.mockResolvedValueOnce(mockGpxResponse);

      const result = await StravaApi.getActivityGpx(12345);

      expect(result.totalDistance).toBe(5000);
      expect(result.svg).toBe('<svg>route</svg>');
      expect(result.coursePointList).toHaveLength(2);
    });

    it('서로 다른 activityId에 대해 다른 엔드포인트 호출', async () => {
      mockGet.mockResolvedValue(mockGpxResponse);

      await StravaApi.getActivityGpx(1);
      await StravaApi.getActivityGpx(9999);

      expect(mockGet).toHaveBeenNthCalledWith(1, '/strava/activities/1/gpx');
      expect(mockGet).toHaveBeenNthCalledWith(2, '/strava/activities/9999/gpx');
    });
  });
});
