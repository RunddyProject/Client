import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { useCourseDetail } from '@/features/course/hooks/useCourseDetail';
import {
  ENV_TYPE_OPTIONS,
  SHAPE_TYPE_OPTIONS
} from '@/features/course-upload/model/constants';
import { useEditCourse } from '@/features/my-course/hooks/useEditCourse';
import { deepEqual } from '@/shared/lib/utils';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';
import { SelectButton } from '@/shared/ui/composites/select-button';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/ui/primitives/toggle-group';

import type { CourseEditFormData, CourseUpdateRequest } from '@/features/my-course/model/types';

function MyCourseEdit() {
  const { uuid } = useParams<{ uuid: string }>();
  const { courseDetail: course, isLoading } = useCourseDetail(uuid ?? '');
  const { editCourse, isEditing } = useEditCourse();

  const [formData, setFormData] = useState<CourseEditFormData>({
    name: '',
    isMarathon: null,
    envType: null,
    shapeType: null
  });
  const [initialized, setInitialized] = useState(false);

  // Initial form data from course detail
  const initialFormData = useMemo<CourseEditFormData | null>(() => {
    if (!course) return null;
    return {
      name: course.name,
      isMarathon: course.isMarathon ?? false,
      envType: course.envType ?? null,
      shapeType: course.shapeType ?? null
    };
  }, [course]);

  // Set form data when course loads
  useEffect(() => {
    if (initialFormData && !initialized) {
      setFormData(initialFormData);
      setInitialized(true);
    }
  }, [initialFormData, initialized]);

  // Validation
  const isValid = useCallback(() => {
    if (!formData.name.trim()) return false;
    if (formData.isMarathon === null) return false;
    if (!formData.isMarathon) {
      if (!formData.envType) return false;
      if (!formData.shapeType) return false;
    }
    return true;
  }, [formData]);

  const isDirty = initialFormData ? !deepEqual(formData, initialFormData) : false;
  const canSubmit = isValid() && isDirty && !isEditing;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleMarathonChange = (value: string) => {
    if (value === 'yes') {
      setFormData({ ...formData, isMarathon: true, envType: null, shapeType: null });
    } else if (value === 'no') {
      setFormData({ ...formData, isMarathon: false });
    }
  };

  const handleEnvTypeChange = (value: string) => {
    if (value) {
      setFormData({
        ...formData,
        envType: value as CourseEditFormData['envType']
      });
    }
  };

  const handleShapeTypeChange = (value: string) => {
    if (value) {
      setFormData({
        ...formData,
        shapeType: value as CourseEditFormData['shapeType']
      });
    }
  };

  const handleSubmit = () => {
    if (!uuid || !course || !canSubmit) return;

    const request: CourseUpdateRequest = {
      courseName: formData.name.trim(),
      isMarathon: formData.isMarathon!,
      courseEnvType: formData.isMarathon ? undefined : (formData.envType ?? undefined),
      courseShapeType: formData.isMarathon ? undefined : (formData.shapeType ?? undefined),
      startAddress: course.startAddress,
      endAddress: course.endAddress
    };

    editCourse({ uuid, data: request });
  };

  if (isLoading || !initialized) {
    return <LoadingSpinner />;
  }

  return (
    <div className='flex min-h-dvh flex-col'>
      <div className='flex flex-1 flex-col px-5 pt-6 pb-24'>
        {/* Course Name */}
        <div className='mb-8'>
          <Label
            htmlFor='courseName'
            className='text-contents-b15 text-pri mb-2'
          >
            코스 제목<span className='text-state-error'>*</span>
          </Label>
          <Input
            id='courseName'
            value={formData.name}
            onChange={handleNameChange}
            placeholder='코스 모양, 특징 등으로 제목을 지어주세요'
            maxLength={50}
          />
        </div>

        {/* Marathon Check */}
        <div className='mb-8'>
          <Label className='text-contents-b15 text-pri mb-3'>
            이 코스는 마라톤 코스인가요?
            <span className='text-state-error'>*</span>
          </Label>
          <div className='flex gap-3'>
            <SelectButton
              selected={formData.isMarathon === true}
              onClick={() => handleMarathonChange('yes')}
            >
              네
            </SelectButton>
            <SelectButton
              selected={formData.isMarathon === false}
              onClick={() => handleMarathonChange('no')}
            >
              아니요
            </SelectButton>
          </div>
        </div>

        {/* Non-marathon specific fields */}
        {formData.isMarathon === false && (
          <>
            {/* Environment Type */}
            <div className='mb-8'>
              <Label className='text-contents-b15 text-pri mb-3'>
                장소 특성<span className='text-state-error'>*</span>
              </Label>
              <ToggleGroup
                type='single'
                value={formData.envType ?? ''}
                onValueChange={handleEnvTypeChange}
                className='flex flex-wrap gap-2.5'
              >
                {ENV_TYPE_OPTIONS.map((option) => (
                  <ToggleGroupItem key={option.value} value={option.value}>
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Shape Type */}
            <div className='mb-8'>
              <Label className='text-contents-b15 text-pri mb-3'>
                코스 모양<span className='text-state-error'>*</span>
              </Label>
              <ToggleGroup
                type='single'
                value={formData.shapeType ?? ''}
                onValueChange={handleShapeTypeChange}
                className='flex flex-wrap gap-2.5'
              >
                {SHAPE_TYPE_OPTIONS.map((option) => (
                  <ToggleGroupItem key={option.value} value={option.value}>
                    {option.label}코스
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </>
        )}
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className='bg-w-100 fixed right-0 bottom-0 left-0 mx-auto max-w-xl p-5'>
        <Button
          size='lg'
          className='w-full'
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {isEditing ? (
            <div className='border-w-100 size-5 animate-spin rounded-full border-2 border-t-transparent' />
          ) : (
            '완료'
          )}
        </Button>
      </div>
    </div>
  );
}

export default MyCourseEdit;
