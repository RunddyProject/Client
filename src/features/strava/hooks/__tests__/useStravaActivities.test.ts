import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/features/strava/api/strava.api', () => ({
  StravaApi: {
    getActivities: vi.fn()
  }
}));

import { StravaApi } from '@/features/strava/api/strava.api';

import { useStravaActivities } from '../useStravaActivities';

const mockGetActivities = vi.mocked(StravaApi.getActivities);

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

const makeActivities = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Run ${i + 1}`,
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
    summaryPolyline: ''
  }));

describe('useStravaActivities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('첫 번째 페이지를 page=1, perPage=30으로 요청', async () => {
    mockGetActivities.mockResolvedValue({ activityList: [] });

    const { result } = renderHook(() => useStravaActivities(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetActivities).toHaveBeenCalledWith({ page: 1, perPage: 30 });
  });

  it('활동 목록을 data.pages에서 반환', async () => {
    const activities = makeActivities(2);
    mockGetActivities.mockResolvedValue({ activityList: activities });

    const { result } = renderHook(() => useStravaActivities(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const all = result.current.data?.pages.flatMap((p) => p.activityList) ?? [];
    expect(all).toHaveLength(2);
    expect(all[0].id).toBe(1);
  });

  it('페이지가 가득 찼을 때(30개) hasNextPage=true', async () => {
    mockGetActivities.mockResolvedValue({ activityList: makeActivities(30) });

    const { result } = renderHook(() => useStravaActivities(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('페이지가 30개 미만이면 hasNextPage=false', async () => {
    mockGetActivities.mockResolvedValue({ activityList: makeActivities(5) });

    const { result } = renderHook(() => useStravaActivities(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('빈 목록이면 hasNextPage=false', async () => {
    mockGetActivities.mockResolvedValue({ activityList: [] });

    const { result } = renderHook(() => useStravaActivities(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('에러 발생 시 retry 없이 isError=true', async () => {
    mockGetActivities.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useStravaActivities(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    // retry: false → 딱 1회만 호출
    expect(mockGetActivities).toHaveBeenCalledTimes(1);
  });

  it('로딩 중에는 isLoading=true', async () => {
    let resolvePromise!: (v: { activityList: never[] }) => void;
    mockGetActivities.mockReturnValue(
      new Promise((r) => {
        resolvePromise = r;
      })
    );

    const { result } = renderHook(() => useStravaActivities(), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(true);

    resolvePromise({ activityList: [] });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
