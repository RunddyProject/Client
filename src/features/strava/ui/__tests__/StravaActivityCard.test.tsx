import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@mapbox/polyline', () => ({
  default: {
    decode: (str: string) => {
      if (str === 'valid')
        return [
          [37.5, 127.0],
          [37.6, 127.1],
          [37.7, 127.2]
        ];
      if (str === 'single') return [[37.5, 127.0]];
      return [];
    }
  }
}));

import { StravaActivityCard } from '../StravaActivityCard';

import type { StravaActivity } from '../../model/types';

const mockActivity: StravaActivity = {
  id: 42,
  name: '한강공원 새벽 러닝',
  sportType: 'Run',
  distance: 10200,
  movingTime: 3660,
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

  it('날짜 표시 (YYYY.MM.DD. 오전/오후 h:mm 러닝 포맷)', () => {
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    // startDateLocal '2024-06-02T07:00:00+09:00' → '2024.06.02. 오전 7:00 러닝'
    expect(screen.getByText('2024.06.02. 오전 7:00 러닝')).toBeInTheDocument();
  });

  it('오후 시간 포맷 (13시 → 오후 1:00)', () => {
    const activity = {
      ...mockActivity,
      startDateLocal: '2024-06-02T13:30:00+09:00'
    };
    render(<StravaActivityCard activity={activity} onClick={vi.fn()} />);

    expect(screen.getByText('2024.06.02. 오후 1:30 러닝')).toBeInTheDocument();
  });

  it('거리 km 변환 표시 (10200m → 10.2km)', () => {
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    expect(screen.getByText('10.2km')).toBeInTheDocument();
  });

  it('소수점 1자리로 거리 표시 (5000m → 5.0km)', () => {
    const activity = { ...mockActivity, distance: 5000 };
    render(<StravaActivityCard activity={activity} onClick={vi.fn()} />);

    expect(screen.getByText('5.0km')).toBeInTheDocument();
  });

  it('평균 페이스 표시 (averageSpeed 2.78 m/s → 6\'00")', () => {
    // 1000 / 2.78 ≈ 360s → 6분 0초
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    expect(screen.getByText(`6'00"`)).toBeInTheDocument();
  });

  it('총 걸린 시간 표시 (3800초 → 01:03)', () => {
    // 3800s = 1h 3m 20s → 01:03
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    expect(screen.getByText('01:03')).toBeInTheDocument();
  });

  it('거리 라벨 표시', () => {
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    expect(screen.getByText('거리')).toBeInTheDocument();
  });

  it('평균 페이스 라벨 표시', () => {
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    expect(screen.getByText('평균 페이스')).toBeInTheDocument();
  });

  it('총 걸린 시간 라벨 표시', () => {
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    expect(screen.getByText('총 걸린 시간')).toBeInTheDocument();
  });

  it('클릭 시 onClick에 activity 객체 전달', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<StravaActivityCard activity={mockActivity} onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(mockActivity);
  });

  it('isDisabled=true 시 버튼 비활성화', () => {
    render(
      <StravaActivityCard
        activity={mockActivity}
        onClick={vi.fn()}
        isDisabled
      />
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('isDisabled=false(기본) 시 버튼 활성화', () => {
    render(<StravaActivityCard activity={mockActivity} onClick={vi.fn()} />);

    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('isSelected=true 시 선택된 라디오 버튼 렌더', () => {
    const { container } = render(
      <StravaActivityCard
        activity={mockActivity}
        onClick={vi.fn()}
        isSelected
      />
    );

    expect(container.querySelector('.text-runddy-blue')).toBeInTheDocument();
  });

  it('isSelected=false(기본) 시 미선택 라디오 버튼 렌더', () => {
    const { container } = render(
      <StravaActivityCard activity={mockActivity} onClick={vi.fn()} />
    );

    expect(
      container.querySelector('.text-runddy-blue')
    ).not.toBeInTheDocument();
  });

  it('summaryPolyline이 유효하면 SVG 경로 렌더', () => {
    const activity = { ...mockActivity, summaryPolyline: 'valid' };
    const { getByTestId } = render(
      <StravaActivityCard activity={activity} onClick={vi.fn()} />
    );

    expect(getByTestId('route-thumbnail')).toBeInTheDocument();
  });

  it('summaryPolyline이 비어있으면 폴백 placeholder 렌더', () => {
    const activity = { ...mockActivity, summaryPolyline: '' };
    const { queryByTestId } = render(
      <StravaActivityCard activity={activity} onClick={vi.fn()} />
    );

    expect(queryByTestId('route-thumbnail')).not.toBeInTheDocument();
  });

  it('summaryPolyline 좌표가 1개 미만이면 폴백 placeholder 렌더', () => {
    const activity = { ...mockActivity, summaryPolyline: 'single' };
    const { queryByTestId } = render(
      <StravaActivityCard activity={activity} onClick={vi.fn()} />
    );

    expect(queryByTestId('route-thumbnail')).not.toBeInTheDocument();
  });
});
