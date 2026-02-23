import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('@/shared/lib/http', () => {
  class ApiError extends Error {
    status: number;
    statusText: string;
    body?: string;
    constructor(status: number, statusText: string, body?: string) {
      super(`${status}: ${statusText}`);
      this.name = 'ApiError';
      this.status = status;
      this.statusText = statusText;
      this.body = body;
    }
  }
  return {
    api: { get: vi.fn() },
    ApiError
  };
});

vi.mock('@/features/strava/api/strava.api', () => ({
  StravaApi: {
    getConnectUrl: vi.fn()
  }
}));

import { ApiError } from '@/shared/lib/http';
import { StravaApi } from '@/features/strava/api/strava.api';

import { useStravaConnect } from '../useStravaConnect';

const mockGetConnectUrl = vi.mocked(StravaApi.getConnectUrl);

describe('useStravaConnect', () => {
  let savedLocation: typeof window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    // window.location.href 를 제어 가능하게 교체
    savedLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' }
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: savedLocation
    });
  });

  it('초기 상태: isConnecting=false, error=null', () => {
    const { result } = renderHook(() => useStravaConnect());

    expect(result.current.isConnecting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('connect() 성공 시 authUrl로 리다이렉트', async () => {
    const authUrl = 'https://strava.com/oauth/authorize?client_id=123';
    mockGetConnectUrl.mockResolvedValue({ authUrl });

    const { result } = renderHook(() => useStravaConnect());

    await act(async () => {
      await result.current.connect();
    });

    expect(window.location.href).toBe(authUrl);
  });

  it('connect() 호출 중 isConnecting=true', async () => {
    let resolve!: (v: { authUrl: string }) => void;
    mockGetConnectUrl.mockReturnValue(new Promise((r) => (resolve = r)));

    const { result } = renderHook(() => useStravaConnect());

    act(() => {
      void result.current.connect();
    });

    expect(result.current.isConnecting).toBe(true);

    await act(async () => {
      resolve({ authUrl: 'https://strava.com' });
    });
  });

  it('ApiError 발생 시 body 메시지를 error 상태에 저장', async () => {
    mockGetConnectUrl.mockRejectedValue(
      new ApiError(500, 'Internal Server Error', '서버 오류가 발생했습니다.')
    );

    const { result } = renderHook(() => useStravaConnect());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.error).toBe('서버 오류가 발생했습니다.');
    expect(result.current.isConnecting).toBe(false);
  });

  it('ApiError에 body 없으면 message 사용', async () => {
    const err = new ApiError(500, 'Internal Server Error');
    mockGetConnectUrl.mockRejectedValue(err);

    const { result } = renderHook(() => useStravaConnect());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.error).toBe(err.message);
  });

  it('일반 Error 발생 시 기본 오류 메시지 설정', async () => {
    mockGetConnectUrl.mockRejectedValue(new Error('네트워크 오류'));

    const { result } = renderHook(() => useStravaConnect());

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.error).toBe('Strava 연결에 실패했습니다.');
    expect(result.current.isConnecting).toBe(false);
  });

  it('connect 함수 참조가 리렌더 간 안정적(useCallback)', () => {
    const { result, rerender } = renderHook(() => useStravaConnect());

    const firstConnect = result.current.connect;
    rerender();
    const secondConnect = result.current.connect;

    expect(firstConnect).toBe(secondConnect);
  });
});
