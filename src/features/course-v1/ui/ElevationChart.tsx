import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';

import { runddyColor } from '@/shared/model/constants';

import type { ElevationPoint } from '@/features/course-v1/lib/elevation';

type Props = {
  series: ElevationPoint[];
  minEle: number;
  maxEle: number;
  height?: number;
  highlightRangeKm?: [number, number];
  /** line color */
  color?: string;
  /** curve type: 'linear' | 'monotone' | 'basis' | 'natural' ... */
  curve?: 'linear' | 'monotone' | 'basis' | 'natural' | 'step' | 'monotoneX';
  /** keep Recharts default animation but allow tuning */
  animationDurationMs?: number;
  animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
};

const fmtKm = (v: number) => `${v.toFixed(1)} km`;
const fmtM = (v: number) => `${Math.round(v)} m`;

export function ElevationChart({
  series,
  minEle,
  maxEle,
  height = 260,
  highlightRangeKm,
  color = runddyColor.blue,
  curve = 'basis',
  animationDurationMs = 900,
  animationEasing = 'ease-out'
}: Props) {
  const [yMin, yMax] = useMemo(() => {
    if (!series.length) return [0, 0] as const;
    const pad = Math.max(3, (maxEle - minEle) * 0.1);
    return [Math.floor(minEle - pad), Math.ceil(maxEle + pad)] as const;
  }, [minEle, maxEle, series.length]);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart
          data={series}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          {highlightRangeKm && (
            <ReferenceArea
              x1={highlightRangeKm[0]}
              x2={highlightRangeKm[1]}
              fillOpacity={0.08}
            />
          )}

          <XAxis
            dataKey='dKm'
            type='number'
            domain={['dataMin', 'dataMax']}
            tickFormatter={fmtKm}
            allowDecimals
            fontSize={14}
          />
          <YAxis
            dataKey='ele'
            domain={[yMin, yMax]}
            tickFormatter={fmtM}
            width={52}
            fontSize={14}
            padding={{ top: 12, bottom: 12 }}
          />

          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 12,
              border: 'none',
              boxShadow: 'var(--shadow-runddy)'
            }}
            formatter={(v) => [fmtM(v as number), '고도']}
            labelFormatter={(label) => fmtKm(label as number)}
          />

          <Line
            type={curve}
            dataKey='ele'
            stroke={color}
            strokeWidth={3}
            dot={false}
            isAnimationActive
            animationDuration={animationDurationMs}
            animationEasing={animationEasing}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
