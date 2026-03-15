import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
const mockConnect = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('sonner', () => ({
  toast: { error: vi.fn() }
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

vi.mock('@/features/strava/hooks/useStravaActivities');
vi.mock('@/features/strava/hooks/useStravaConnect', () => ({
  useStravaConnect: () => ({
    connect: mockConnect,
    isConnecting: false,
    error: null
  })
}));
vi.mock('@/features/strava/api/strava.api', () => ({
  StravaApi: { getActivityGpx: vi.fn() }
}));
vi.mock('@/features/course/lib/elevation', () => ({
  buildElevationChartData: vi.fn().mockReturnValue({
    series: [],
    totalDistanceKm: 5,
    elevationGain: 100,
    elevationLoss: 50,
    minEle: 10,
    maxEle: 100
  })
}));

const mockSetStravaPreview = vi.fn();
vi.mock('@/features/strava/model/strava-upload.store', () => ({
  useStravaUploadStore: (selector: (state: unknown) => unknown) =>
    selector({
      stravaPreview: null,
      setStravaPreview: mockSetStravaPreview,
      clearStravaPreview: vi.fn()
    })
}));

import { toast } from 'sonner';

import { StravaApi } from '@/features/strava/api/strava.api';
import { useStravaActivities } from '@/features/strava/hooks/useStravaActivities';
import { ApiError } from '@/shared/lib/http';
import { render, screen, waitFor } from '@/test/utils';

import StravaActivitiesPage from '../activities';

const mockUseStravaActivities = vi.mocked(useStravaActivities);
const mockGetActivityGpx = vi.mocked(StravaApi.getActivityGpx);

// ─── Fixtures ────────────────────────────────────────────────────────────────
const makeActivity = (id: number) => ({
  id,
  name: `Run ${id}`,
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
});

const mockGpxResponse = {
  totalDistance: 5000,
  svg: '<svg></svg>',
  coursePointList: [
    { pointSeq: 1, lat: 37.5, lng: 127.0, ele: 10 },
    { pointSeq: 2, lat: 37.6, lng: 127.1, ele: 20 }
  ]
};

// useStravaActivities 기본 성공 응답
function mockActivitiesSuccess(
  activities = [makeActivity(1), makeActivity(2)]
) {
  mockUseStravaActivities.mockReturnValue({
    data: { pages: [{ activityList: activities }], pageParams: [1] },
    isLoading: false,
    isError: false,
    error: null,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false
  } as ReturnType<typeof useStravaActivities>);
}

// ─────────────────────────────────────────────────────────────────────────────

describe('StravaActivitiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 로딩 상태 ──────────────────────────────────────────────────────────────
  it('isLoading=true 시 스피너 표시', () => {
    mockUseStravaActivities.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false
    } as ReturnType<typeof useStravaActivities>);

    render(<StravaActivitiesPage />);

    // 스피너(animate-spin 클래스)가 존재해야 함
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  // ── 빈 상태 ───────────────────────────────────────────────────────────────
  it('활동 없을 때 빈 상태 메시지 표시', () => {
    mockActivitiesSuccess([]);

    render(<StravaActivitiesPage />);

    expect(screen.getByText('Strava 활동이 없어요')).toBeInTheDocument();
  });

  // ── 활동 목록 ──────────────────────────────────────────────────────────────
  it('활동 목록 렌더링', () => {
    mockActivitiesSuccess([makeActivity(1), makeActivity(2), makeActivity(3)]);

    render(<StravaActivitiesPage />);

    expect(screen.getByText('Run 1')).toBeInTheDocument();
    expect(screen.getByText('Run 2')).toBeInTheDocument();
    expect(screen.getByText('Run 3')).toBeInTheDocument();
  });

  // ── CTA 버튼 활성화 상태 ──────────────────────────────────────────────────
  it('활동 미선택 시 다음 버튼 비활성화', () => {
    mockActivitiesSuccess([makeActivity(1)]);

    render(<StravaActivitiesPage />);

    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled();
  });

  it('활동 선택 시 다음 버튼 활성화', async () => {
    const user = userEvent.setup();
    mockActivitiesSuccess([makeActivity(1)]);

    render(<StravaActivitiesPage />);

    await user.click(screen.getByRole('button', { name: /Run 1/i }));

    expect(screen.getByRole('button', { name: '다음' })).not.toBeDisabled();
  });

  // ── 활동 선택 → 다음 버튼 → 업로드 페이지 이동 ──────────────────────────
  it('카드 선택 후 다음 버튼 클릭 시 GPX 조회 후 /course/upload로 이동', async () => {
    const user = userEvent.setup();
    mockActivitiesSuccess([makeActivity(1)]);
    mockGetActivityGpx.mockResolvedValue(mockGpxResponse);

    render(<StravaActivitiesPage />);

    // 카드 클릭 → 선택만 됨 (GPX 조회 없음)
    await user.click(screen.getByRole('button', { name: /Run 1/i }));
    expect(mockGetActivityGpx).not.toHaveBeenCalled();

    // 다음 버튼 클릭 → GPX 조회 + store 저장 + 이동
    await user.click(screen.getByRole('button', { name: '다음' }));

    await waitFor(() => {
      expect(mockGetActivityGpx).toHaveBeenCalledWith(1);
      expect(mockSetStravaPreview).toHaveBeenCalledWith(
        expect.objectContaining({
          file: expect.any(File),
          activityName: 'Run 1'
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/course/upload');
    });
  });

  it('GPX coursePointList가 비어있으면 에러 토스트', async () => {
    const user = userEvent.setup();
    mockActivitiesSuccess([makeActivity(1)]);
    mockGetActivityGpx.mockResolvedValue({
      ...mockGpxResponse,
      coursePointList: []
    });

    render(<StravaActivitiesPage />);

    await user.click(screen.getByRole('button', { name: /Run 1/i }));
    await user.click(screen.getByRole('button', { name: '다음' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        '해당 활동의 GPX 데이터를 불러올 수 없습니다.'
      );
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('GPX 조회 중 401 에러 시 Strava 재연결', async () => {
    const user = userEvent.setup();
    mockActivitiesSuccess([makeActivity(1)]);
    mockGetActivityGpx.mockRejectedValue(new ApiError(401, 'Unauthorized'));

    render(<StravaActivitiesPage />);

    await user.click(screen.getByRole('button', { name: /Run 1/i }));
    await user.click(screen.getByRole('button', { name: '다음' }));

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        'Strava 연결이 해제되었습니다. 재연결합니다.'
      );
    });
  });

  it('GPX 조회 일반 에러 시 에러 토스트', async () => {
    const user = userEvent.setup();
    mockActivitiesSuccess([makeActivity(1)]);
    mockGetActivityGpx.mockRejectedValue(new Error('서버 오류'));

    render(<StravaActivitiesPage />);

    await user.click(screen.getByRole('button', { name: /Run 1/i }));
    await user.click(screen.getByRole('button', { name: '다음' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        '활동 데이터를 불러오는 데 실패했습니다.'
      );
    });
  });

  // ── 에러 상태 ──────────────────────────────────────────────────────────────
  it('isError + 401 시 재연결 UI 표시', () => {
    mockUseStravaActivities.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError(401, 'Unauthorized'),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false
    } as ReturnType<typeof useStravaActivities>);

    render(<StravaActivitiesPage />);

    expect(
      screen.getByText('Strava 연결이 해제되었습니다. 재연결이 필요합니다.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Strava 연결하기' })
    ).toBeInTheDocument();
  });

  it('isError + 404 시 미연결 UI 표시', () => {
    mockUseStravaActivities.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError(404, 'Not Found'),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false
    } as ReturnType<typeof useStravaActivities>);

    render(<StravaActivitiesPage />);

    expect(
      screen.getByText('Strava 계정이 연결되어 있지 않습니다.')
    ).toBeInTheDocument();
  });

  it('에러 화면의 "Strava 연결하기" 버튼 클릭 시 connect() 호출', async () => {
    const user = userEvent.setup();
    mockUseStravaActivities.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError(401, 'Unauthorized'),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false
    } as ReturnType<typeof useStravaActivities>);

    render(<StravaActivitiesPage />);

    await user.click(screen.getByRole('button', { name: 'Strava 연결하기' }));

    expect(mockConnect).toHaveBeenCalled();
  });

  // ── 무한 스크롤 ────────────────────────────────────────────────────────────
  it('isFetchingNextPage=true 시 하단 스피너 표시', () => {
    mockUseStravaActivities.mockReturnValue({
      data: { pages: [{ activityList: [makeActivity(1)] }], pageParams: [1] },
      isLoading: false,
      isError: false,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: true,
      isFetchingNextPage: true
    } as ReturnType<typeof useStravaActivities>);

    render(<StravaActivitiesPage />);

    // 하단 스피너가 렌더되어야 함
    const spinners = document.querySelectorAll('.animate-spin');
    expect(spinners.length).toBeGreaterThan(0);
  });
});
