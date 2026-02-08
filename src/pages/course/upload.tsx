import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { useCourseUpload } from '@/features/course-upload/hooks/useCourseUpload';
import { useGpxUpload } from '@/features/course-upload/hooks/useGpxUpload';
import { CourseUploadForm } from '@/features/course-upload/ui/CourseUploadForm';
import { CourseUploadSuccess } from '@/features/course-upload/ui/CourseUploadSuccess';
import { UploadMethodSheet } from '@/features/course-upload/ui/UploadMethodSheet';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';

import type { UploadMethod } from '@/features/course-upload/model/types';

function CourseUpload() {
  const navigate = useNavigate();

  const [showMethodSheet, setShowMethodSheet] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    previewData,
    isLoading: isGpxLoading,
    error: gpxError,
    processFile,
    elevationChartData
  } = useGpxUpload();

  const {
    formData,
    setFormData,
    startAddress,
    endAddress,
    isLoadingAddresses,
    isFormValid,
    uploadCourseAsync,
    isUploading,
    uploadError,
    uploadResult
  } = useCourseUpload(previewData);

  // Show error toasts
  useEffect(() => {
    if (gpxError) {
      toast.error(gpxError);
    }
  }, [gpxError]);

  useEffect(() => {
    if (uploadError) {
      toast.error(uploadError.message || '코스 등록에 실패했습니다.');
    }
  }, [uploadError]);

  const handleSelectMethod = useCallback(
    async (method: UploadMethod, file?: File) => {
      if (method === 'direct' && file) {
        await processFile(file);
      }
      // Strava import is handled in the sheet component
    },
    [processFile]
  );

  const handleSubmit = useCallback(async () => {
    try {
      await uploadCourseAsync();
      setShowSuccess(true);
    } catch {
      // Error is already handled by the hook
    }
  }, [uploadCourseAsync]);

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    navigate(-1);
  }, [navigate]);

  const handleViewCourse = useCallback(() => {
    setShowSuccess(false);
    if (uploadResult?.uuid) {
      navigate(`/course/${uploadResult.uuid}`);
    } else {
      navigate('/');
    }
  }, [navigate, uploadResult]);

  // Show loading while processing GPX
  if (isGpxLoading) {
    return (
      <div className='flex h-dvh items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <LoadingSpinner />
          <p className='text-contents-r15 text-sec'>GPX 파일 처리 중...</p>
        </div>
      </div>
    );
  }

  // Show method selection if no preview data
  if (!previewData) {
    return (
      <UploadMethodSheet
        open={showMethodSheet}
        onOpenChange={(open) => {
          setShowMethodSheet(open);
          // Navigate back if sheet is closed without selecting
          if (!open) {
            navigate(-1);
          }
        }}
        onSelectMethod={handleSelectMethod}
      />
    );
  }

  return (
    <>
      <CourseUploadForm
        previewData={previewData}
        formData={formData}
        onFormDataChange={setFormData}
        startAddress={startAddress}
        endAddress={endAddress}
        isLoadingAddresses={isLoadingAddresses}
        elevationChartData={elevationChartData}
        isFormValid={isFormValid}
        isUploading={isUploading}
        onSubmit={handleSubmit}
      />

      <CourseUploadSuccess
        open={showSuccess}
        onClose={handleSuccessClose}
        onViewCourse={handleViewCourse}
      />
    </>
  );
}

export default CourseUpload;
