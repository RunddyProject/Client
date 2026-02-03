import GPXParser from 'gpxparser';
import { useCallback, useState } from 'react';

import { calculateGPXStats } from '@/shared/lib/gpx';
import { getDistance } from '@/shared/lib/map';

import type {
  ElevationChartDataPoint,
  GpxBounds,
  GpxPoint,
  GpxStats,
  GpxUploadData
} from '../model/types';
import type { GradeType } from '@/features/course/model/types';

interface UseGpxUploadReturn {
  gpxData: GpxUploadData | null;
  isLoading: boolean;
  error: string | null;
  processFile: (file: File) => Promise<void>;
  reset: () => void;
  elevationChartData: ElevationChartDataPoint[];
}

export function useGpxUpload(): UseGpxUploadReturn {
  const [gpxData, setGpxData] = useState<GpxUploadData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elevationChartData, setElevationChartData] = useState<ElevationChartDataPoint[]>([]);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.gpx')) {
        throw new Error('GPX 파일만 업로드할 수 있습니다.');
      }

      // Read file content
      const text = await file.text();

      // Parse GPX
      const gpxParser = new GPXParser();
      gpxParser.parse(text);

      if (!gpxParser.tracks?.[0]?.points?.length) {
        throw new Error('유효한 트랙 데이터가 없습니다.');
      }

      const rawPoints = gpxParser.tracks[0].points;

      // Extract points with sequence
      const points: GpxPoint[] = rawPoints.map((point, index) => ({
        lat: point.lat,
        lng: point.lon,
        ele: point.ele || 0,
        pointSeq: index
      }));

      // Calculate bounds
      const bounds: GpxBounds = {
        minLat: Math.min(...points.map((p) => p.lat)),
        maxLat: Math.max(...points.map((p) => p.lat)),
        minLng: Math.min(...points.map((p) => p.lng)),
        maxLng: Math.max(...points.map((p) => p.lng))
      };

      // Calculate stats using existing utility
      const rawStats = calculateGPXStats(gpxParser);

      if (!rawStats) {
        throw new Error('GPX 통계 계산에 실패했습니다.');
      }

      // Calculate elevation loss
      let elevationLoss = 0;
      for (let i = 1; i < rawPoints.length; i++) {
        const prevEle = rawPoints[i - 1].ele || 0;
        const currEle = rawPoints[i].ele || 0;
        const diff = currEle - prevEle;
        if (diff < 0) {
          elevationLoss += Math.abs(diff);
        }
      }

      const stats: GpxStats = {
        totalDistance: rawStats.distance,
        elevationGain: rawStats.elevationGain,
        elevationLoss: Math.round(elevationLoss),
        minElevation: rawStats.minElevation,
        maxElevation: rawStats.maxElevation,
        duration: rawStats.duration,
        avgPace: rawStats.avgPace,
        grade: Math.min(rawStats.grade, 3) as GradeType // Clamp to 1-3
      };

      // Build elevation chart data
      const chartData: ElevationChartDataPoint[] = [];
      let cumulativeDistance = 0;

      for (let i = 0; i < rawPoints.length; i++) {
        if (i > 0) {
          const prev = rawPoints[i - 1];
          const curr = rawPoints[i];
          cumulativeDistance += getDistance(prev.lat, prev.lon, curr.lat, curr.lon);
        }

        chartData.push({
          dKm: cumulativeDistance / 1000,
          ele: rawPoints[i].ele || 0
        });
      }

      setElevationChartData(chartData);
      setGpxData({
        file,
        gpxParser,
        stats,
        points,
        bounds
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'GPX 파일 처리에 실패했습니다.';
      setError(message);
      setGpxData(null);
      setElevationChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setGpxData(null);
    setError(null);
    setElevationChartData([]);
  }, []);

  return {
    gpxData,
    isLoading,
    error,
    processFile,
    reset,
    elevationChartData
  };
}
