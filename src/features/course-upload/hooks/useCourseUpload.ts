import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { CourseUploadApi } from '@/features/course-upload/api/course-upload.api';
import { reverseGeocode } from '@/features/map/lib/geocode';

import type {
  CoursePreviewData,
  CourseUploadFormData,
  CourseUploadRequest,
  CourseUploadResponse
} from '@/features/course-upload/model/types';

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
  shapeType: null
};

export function useCourseUpload(
  previewData: CoursePreviewData | null
): UseCourseUploadReturn {
  const queryClient = useQueryClient();

  const [formData, setFormData] =
    useState<CourseUploadFormData>(initialFormData);
  const [startAddress, setStartAddress] = useState<string>('');
  const [endAddress, setEndAddress] = useState<string>('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Fetch addresses when preview data is loaded
  useEffect(() => {
    if (!previewData?.coursePointList.length) {
      setStartAddress('');
      setEndAddress('');
      return;
    }

    const fetchAddresses = async () => {
      setIsLoadingAddresses(true);

      const startPoint = previewData.coursePointList[0];
      const endPoint =
        previewData.coursePointList[previewData.coursePointList.length - 1];

      try {
        const [start, end] = await Promise.all([
          reverseGeocode(startPoint.lat, startPoint.lng),
          reverseGeocode(endPoint.lat, endPoint.lng)
        ]);

        setStartAddress(start || '주소를 불러올 수 없습니다');
        setEndAddress(end || '주소를 불러올 수 없습니다');
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
        setStartAddress('주소를 불러올 수 없습니다');
        setEndAddress('주소를 불러올 수 없습니다');
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [previewData]);

  // Validate form
  const isFormValid = useCallback(() => {
    if (!previewData) return false;
    if (!formData.name.trim()) return false;
    if (formData.isMarathon === null) return false;

    // If not marathon, envType and shapeType are required
    if (!formData.isMarathon) {
      if (!formData.envType) return false;
      if (!formData.shapeType) return false;
    }

    return true;
  }, [formData, previewData]);

  // Upload mutation
  const mutation = useMutation({
    mutationFn: async (): Promise<CourseUploadResponse> => {
      if (!previewData) {
        throw new Error('GPX 파일을 먼저 업로드해주세요.');
      }

      const request: CourseUploadRequest = {
        file: previewData.file,
        courseName: formData.name.trim(),
        isMarathon: formData.isMarathon!,
        courseEnvType: formData.envType ?? undefined,
        courseShapeType: formData.shapeType ?? undefined,
        startAddress,
        endAddress
      };

      return CourseUploadApi.uploadCourse(request);
    },
    onSuccess: () => {
      // Invalidate courses query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
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
