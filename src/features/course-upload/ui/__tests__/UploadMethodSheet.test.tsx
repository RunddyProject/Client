import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { act, render, screen, waitFor } from '@/test/utils';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
let mockIsAuthenticated = true;

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/app/providers/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: mockIsAuthenticated })
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() }
}));

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
  return { api: { get: vi.fn() }, ApiError };
});

vi.mock('@/features/strava/api/strava.api', () => ({
  StravaApi: {
    getStatus: vi.fn(),
    getConnectUrl: vi.fn()
  }
}));

vi.mock('@/shared/lib/show-login-dialog', () => ({
  showLoginDialog: vi.fn()
}));

import { toast } from 'sonner';
import { ApiError } from '@/shared/lib/http';
import { StravaApi } from '@/features/strava/api/strava.api';
import { showLoginDialog } from '@/shared/lib/show-login-dialog';

import { UploadMethodSheet } from '../UploadMethodSheet';

const mockGetStatus = vi.mocked(StravaApi.getStatus);
const mockGetConnectUrl = vi.mocked(StravaApi.getConnectUrl);

// ─── Helper ───────────────────────────────────────────────────────────────────
function renderSheet(
  overrides: { onSelectMethod?: (m: string, f?: File) => void } = {}
) {
  const onOpenChange = vi.fn();
  const onSelectMethod = overrides.onSelectMethod ?? vi.fn();

  render(
    <UploadMethodSheet
      open={true}
      onOpenChange={onOpenChange}
      onSelectMethod={onSelectMethod}
    />
  );

  return { onOpenChange, onSelectMethod };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('UploadMethodSheet', () => {
  let savedLocation: typeof window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = true;
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

  // ── 렌더링 ────────────────────────────────────────────────────────────────
  it('open=true 시 바텀시트 렌더', () => {
    renderSheet();

    expect(
      screen.getByText('GPX 업로드 방식을 선택해 주세요')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '직접 업로드하기' })
    ).toBeInTheDocument();
    // sr-only description에도 "Strava"가 포함되므로 버튼 role로 한정
    expect(screen.getByRole('button', { name: /Strava/i })).toBeInTheDocument();
  });

  it('open=false 시 콘텐츠 미렌더', () => {
    const { onOpenChange } = (() => {
      const onOpenChange = vi.fn();
      render(
        <UploadMethodSheet
          open={false}
          onOpenChange={onOpenChange}
          onSelectMethod={vi.fn()}
        />
      );
      return { onOpenChange };
    })();

    expect(
      screen.queryByText('GPX 업로드 방식을 선택해 주세요')
    ).not.toBeInTheDocument();
    void onOpenChange;
  });

  // ── 직접 업로드 ───────────────────────────────────────────────────────────
  it('미인증 시 직접 업로드 버튼 클릭 → 로그인 다이얼로그 표시', async () => {
    const user = userEvent.setup();
    mockIsAuthenticated = false;
    renderSheet();

    await user.click(screen.getByRole('button', { name: '직접 업로드하기' }));

    expect(showLoginDialog).toHaveBeenCalledOnce();
  });

  it('직접 업로드 선택 시 onSelectMethod("direct", file) 호출', async () => {
    const user = userEvent.setup();
    const onSelectMethod = vi.fn();
    renderSheet({ onSelectMethod });

    const file = new File(['<?xml version="1.0"?>'], 'route.gpx', {
      type: 'application/gpx+xml'
    });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(fileInput, file);

    expect(onSelectMethod).toHaveBeenCalledWith('direct', file);
  });

  // ── Strava 연결됨 → activities 페이지로 이동 ────────────────────────────
  it('Strava 이미 연결됨 → /strava/activities로 네비게이션 (onOpenChange 호출 없음)', async () => {
    const user = userEvent.setup();
    mockGetStatus.mockResolvedValue({ connected: true });

    const { onOpenChange } = renderSheet();

    const stravaBtn = screen.getByRole('button', { name: /Strava/i });
    await user.click(stravaBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/strava/activities');
    });
    // onOpenChange(false) 를 명시적으로 호출하지 않음:
    // 부모의 onOpenChange 핸들러는 navigate(-1)을 포함하고 있어
    // navigate('/strava/activities')와 충돌해 브라우저 히스토리가 꼬임.
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  // ── Strava 미연결 → OAuth 리다이렉트 ─────────────────────────────────────
  it('Strava 미연결 → authUrl로 window.location.href 변경', async () => {
    const user = userEvent.setup();
    const authUrl = 'https://strava.com/oauth/authorize?client_id=99';
    mockGetStatus.mockResolvedValue({ connected: false });
    mockGetConnectUrl.mockResolvedValue({ authUrl });

    renderSheet();

    const stravaBtn = screen.getByRole('button', { name: /Strava/i });
    await user.click(stravaBtn);

    await waitFor(() => {
      expect(window.location.href).toBe(authUrl);
    });
  });

  // ── 에러 처리 ─────────────────────────────────────────────────────────────
  it('401 에러 시 로그인 다이얼로그 표시', async () => {
    const user = userEvent.setup();
    mockGetStatus.mockRejectedValue(new ApiError(401, 'Unauthorized'));

    renderSheet();

    await user.click(screen.getByRole('button', { name: /Strava/i }));

    await waitFor(() => {
      expect(showLoginDialog).toHaveBeenCalledOnce();
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('일반 에러 시 연결 실패 토스트', async () => {
    const user = userEvent.setup();
    mockGetStatus.mockRejectedValue(new Error('네트워크 오류'));

    renderSheet();

    await user.click(screen.getByRole('button', { name: /Strava/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Strava 연결에 실패했어요 다시 시도해주세요'
      );
    });
  });

  // ── 로딩 중 다중 클릭 방지 ───────────────────────────────────────────────
  it('Strava 버튼 클릭 중 중복 호출 방지', async () => {
    const user = userEvent.setup();
    let resolveStatus!: (v: { connected: boolean }) => void;
    mockGetStatus.mockReturnValue(new Promise((r) => (resolveStatus = r)));
    // getStatus 이후 connected:false → getConnectUrl 호출됨
    mockGetConnectUrl.mockResolvedValue({
      authUrl: 'https://strava.com/oauth'
    });

    renderSheet();

    const stravaBtn = screen.getByRole('button', { name: /Strava/i });

    // 첫 번째 클릭 (프로미스 대기 상태 진입)
    await user.click(stravaBtn);

    // 버튼이 비활성화되어 두 번째 클릭 무시
    expect(stravaBtn).toBeDisabled();

    // 로딩 중 라벨 변경
    expect(stravaBtn).toHaveTextContent('연결 확인 중...');

    // 프로미스 해소 → 후속 처리를 act 안에서 완료
    await act(async () => {
      resolveStatus({ connected: false });
      // window.location.href 변경이 일어나도록 잠시 양보
      await Promise.resolve();
    });
  });
});
