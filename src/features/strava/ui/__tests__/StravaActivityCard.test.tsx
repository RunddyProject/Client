import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { StravaActivityCard } from '../StravaActivityCard';

import type { StravaActivity } from '../../model/types';

const mockActivity: StravaActivity = {
  id: 42,
  name: '한강공원 새벽 러닝',
  sportType: 'Run',
  distance: 10200,
  movingTime: 3660,   // 1시간 1분
  elapsedTime: 3800,
  totalElevationGain: 80,
  startDate: '2024-06-01T22:00:00Z',
  startDateLocal: '2024-06-02T07:00:00+09:00',
  timezone: 'Asia/Seoul',
  averageSpeed: 2.78,
  maxSpeed: 4.5,
  summaryPolyline: 'abc'
};

describe('StravaActivityCard', () => {
  it('활동 이름 표시', () => {
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    expect(screen.getByText('한강공원 새벽 러닝')).toBeInTheDocument();
  });

  it('거리 km 변환 표시 (10200m → 10.2km)', () => {
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    expect(screen.getByText('10.2km')).toBeInTheDocument();
  });

  it('이동 시간 포맷 표시 (3660초 → 1시간 1분)', () => {
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    expect(screen.getByText('1시간 1분')).toBeInTheDocument();
  });

  it('이동 시간이 1시간 미만이면 분만 표시 (1800초 → 30분)', () => {
    const activity = { ...mockActivity, movingTime: 1800 };
    render(<StravaActivityCard activity={activity} onClick={vi.fn()} />);

    expect(screen.getByText('30분')).toBeInTheDocument();
  });

  it('고도 상승이 0보다 크면 ↑Xm 표시', () => {
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    expect(screen.getByText('↑80m')).toBeInTheDocument();
  });

  it('고도 상승이 0이면 고도 표시 없음', () => {
    const activity = { ...mockActivity, totalElevationGain: 0 };
    render(<StravaActivityCard activity={activity} onClick={vi.fn()} />);

    expect(screen.queryByText(/↑/)).not.toBeInTheDocument();
  });

  it('날짜 표시 (startDateLocal 기준)', () => {
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    // 날짜가 렌더링되었는지 확인 (정확한 포맷은 로케일 의존)
    const dateText = screen.getByText(/2024/);
    expect(dateText).toBeInTheDocument();
  });

  it('클릭 시 onClick에 activity 객체 전달', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<StravaActivityCard activity={mockActivity} onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(mockActivity);
  });

  it('isLoading=true 시 버튼 비활성화', () => {
    render(
      <StravaActivityCard activity={mockActivity} onClick={vi.fn()} isLoading />
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('isLoading=false(기본) 시 버튼 활성화', () => {
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('소수점 1자리로 거리 표시 (5000m → 5.0km)', () => {
    const activity = { ...mockActivity, distance: 5000 };
    render(<StravaActivityCard activity={activity} onClick={vi.fn()} />);

    expect(screen.getByText('5.0km')).toBeInTheDocument();
  });
});
