import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { CourseUploadApi } from '../api/course-upload.api';

import type {
  CourseUploadFormData,
  CourseUploadPayload,
  CourseUploadResponse,
  GpxUploadData
} from '../model/types';

interface UseCourseUploadReturn {
  formData: CourseUploadFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseUploadFormData>>;
  startAddress: string;
  endAddress: string;
  isLoadingAddresses: boolean;
  isFormValid: boolean;
  uploadCourse: () => void;
  uploadCourseAsync: () => Promise<CourseUploadResponse>;
  isUploading: boolean;
  uploadError: Error | null;
  uploadResult: CourseUploadResponse | null;
  resetUpload: () => void;
}

const initialFormData: CourseUploadFormData = {
  name: '',
  isMarathon: null,
  envType: null,
  shapeType: null,
  runningPace: undefined
};

export function useCourseUpload(gpxData: GpxUploadData | null): UseCourseUploadReturn {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CourseUploadFormData>(initialFormData);
  const [startAddress, setStartAddress] = useState<string>('');
  const [endAddress, setEndAddress] = useState<string>('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Fetch addresses when GPX data is loaded
  useEffect(() => {
    if (!gpxData?.points.length) {
      setStartAddress('');
      setEndAddress('');
      return;
    }

    const fetchAddresses = async () => {
      setIsLoadingAddresses(true);

      const startPoint = gpxData.points[0];
      const endPoint = gpxData.points[gpxData.points.length - 1];

      try {
        const [start, end] = await Promise.all([
          CourseUploadApi.reverseGeocode(startPoint.lat, startPoint.lng),
          CourseUploadApi.reverseGeocode(endPoint.lat, endPoint.lng)
        ]);

        setStartAddress(start);
        setEndAddress(end);
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
        setStartAddress('주소를 불러올 수 없습니다');
        setEndAddress('주소를 불러올 수 없습니다');
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [gpxData]);

  // Validate form
  const isFormValid = useCallback(() => {
    if (!gpxData) return false;
    if (!formData.name.trim()) return false;
    if (formData.isMarathon === null) return false;

    // If not marathon, envType and shapeType are required
    if (!formData.isMarathon) {
      if (!formData.envType) return false;
      if (!formData.shapeType) return false;
    }

    return true;
  }, [formData, gpxData]);

  // Upload mutation
  const mutation = useMutation({
    mutationFn: async (): Promise<CourseUploadResponse> => {
      if (!gpxData) {
        throw new Error('GPX 파일을 먼저 업로드해주세요.');
      }

      const payload: CourseUploadPayload = {
        name: formData.name.trim(),
        isMarathon: formData.isMarathon!,
        envType: formData.envType ?? undefined,
        shapeType: formData.shapeType ?? undefined,
        runningPace: formData.runningPace,
        gpxFile: gpxData.file,
        startAddress,
        endAddress,
        totalDistance: gpxData.stats.totalDistance,
        elevationGain: gpxData.stats.elevationGain,
        elevationLoss: gpxData.stats.elevationLoss,
        grade: gpxData.stats.grade,
        points: gpxData.points,
        bounds: gpxData.bounds
      };

      return CourseUploadApi.uploadCourse(payload);
    },
    onSuccess: () => {
      // Invalidate courses query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });

  const resetUpload = useCallback(() => {
    setFormData(initialFormData);
    setStartAddress('');
    setEndAddress('');
    mutation.reset();
  }, [mutation]);

  return {
    formData,
    setFormData,
    startAddress,
    endAddress,
    isLoadingAddresses,
    isFormValid: isFormValid(),
    uploadCourse: mutation.mutate,
    uploadCourseAsync: mutation.mutateAsync,
    isUploading: mutation.isPending,
    uploadError: mutation.error,
    uploadResult: mutation.data ?? null,
    resetUpload
  };
}
