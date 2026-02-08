import { useCallback, useState } from 'react';

import { buildElevationChartData } from '@/features/course/lib/elevation';

import { CourseUploadApi } from '../api/course-upload.api';

import type { ElevationChartData } from '@/features/course/lib/elevation';
import type { CoursePreviewData } from '../model/types';

interface UseGpxUploadReturn {
  previewData: CoursePreviewData | null;
  isLoading: boolean;
  error: string | null;
  processFile: (file: File) => Promise<void>;
  reset: () => void;
  elevationChartData: ElevationChartData;
}

const EMPTY_ELEVATION_DATA: ElevationChartData = {
  series: [],
  totalDistanceKm: 0,
  elevationGain: 0,
  elevationLoss: 0,
  minEle: 0,
  maxEle: 0
};

export function useGpxUpload(): UseGpxUploadReturn {
  const [previewData, setPreviewData] = useState<CoursePreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elevationChartData, setElevationChartData] =
    useState<ElevationChartData>(EMPTY_ELEVATION_DATA);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.gpx')) {
        throw new Error('GPX 파일만 업로드할 수 있습니다.');
      }

      // Call preview API
      const response = await CourseUploadApi.previewCourse(file);

      if (!response.coursePointList?.length) {
        throw new Error('유효한 트랙 데이터가 없습니다.');
      }

      // Build elevation chart data using the utility
      const chartData = buildElevationChartData(response.coursePointList);

      setElevationChartData(chartData);
      setPreviewData({
        file,
        totalDistance: response.totalDistance,
        svg: response.svg,
        coursePointList: response.coursePointList
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'GPX 파일 처리에 실패했습니다.';
      setError(message);
      setPreviewData(null);
      setElevationChartData(EMPTY_ELEVATION_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPreviewData(null);
    setError(null);
    setElevationChartData(EMPTY_ELEVATION_DATA);
  }, []);

  return {
    previewData,
    isLoading,
    error,
    processFile,
    reset,
    elevationChartData
  };
}
