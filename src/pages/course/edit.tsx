import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { useCourseDetail } from '@/features/course/hooks/useCourseDetail';
import {
  ENV_TYPE_OPTIONS,
  SHAPE_TYPE_OPTIONS
} from '@/features/course-upload/model/constants';
import { NaverMap } from '@/features/map/ui/NaverMap';
import { useEditUserCourse } from '@/features/my-course/hooks/useEditUserCourse';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';
import { SelectButton } from '@/shared/ui/composites/select-button';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/ui/primitives/toggle-group';

import type { LatLngBounds, MarkerInput } from '@/features/map/model/types';
import type { EditUserCourseRequest } from '@/features/my-course/model/types';

interface EditFormData {
  name: string;
  isMarathon: boolean;
  envType: string | null;
  shapeType: string | null;
}

function MyCourseEdit() {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const { courseDetail: course, isLoading } = useCourseDetail(uuid ?? '');
  const { mutateAsync: editAsync, isPending: isEditing } =
    useEditUserCourse();

  const [formData, setFormData] = useState<EditFormData | null>(null);

  // Initialize form with course data once loaded
  useEffect(() => {
    if (course && !formData) {
      setFormData({
        name: course.name,
        isMarathon: course.isMarathon ?? false,
        envType: course.envType ?? null,
        shapeType: course.shapeType ?? null
      });
    }
  }, [course, formData]);

  // Map bounds
  const bounds: LatLngBounds | undefined = useMemo(() => {
    if (!course?.coursePointList?.length) return undefined;
    return {
      minLat: course.minLat,
      maxLat: course.maxLat,
      minLng: course.minLng,
      maxLng: course.maxLng
    };
  }, [course]);

  // Map markers
  const markers: MarkerInput[] = useMemo(() => {
    if (!course?.coursePointList?.length) return [];
    const points = course.coursePointList;
    const start = points[0];
    const end = points[points.length - 1];
    const FOCUS_KEY = 'edit';
    return [
      { id: FOCUS_KEY, lat: start.lat, lng: start.lng, kind: 'start' },
      { id: `${FOCUS_KEY}__end`, lat: end.lat, lng: end.lng, kind: 'end' }
    ];
  }, [course]);

  const isFormValid = useMemo(() => {
    if (!formData) return false;
    if (!formData.name.trim()) return false;
    if (!formData.isMarathon && !formData.envType) return false;
    if (!formData.isMarathon && !formData.shapeType) return false;
    return true;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!uuid || !formData || !course) return;

    const payload: EditUserCourseRequest = {
      courseName: formData.name.trim(),
      isMarathon: formData.isMarathon,
      courseEnvType: formData.isMarathon ? null : formData.envType,
      courseShapeType: formData.isMarathon ? null : formData.shapeType,
      startAddress: course.startAddress,
      endAddress: course.endAddress
    };

    try {
      await editAsync({ uuid, data: payload });
      toast.success('코스가 수정되었어요');
      navigate(-1);
    } catch {
      // Error handled in mutation onError
    }
  }, [uuid, formData, course, editAsync, navigate]);

  if (isLoading || !course) return <LoadingSpinner />;
  if (!formData) return <LoadingSpinner />;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleMarathonChange = (value: string) => {
    if (value === 'yes') {
      setFormData({
        ...formData,
        isMarathon: true,
        envType: null,
        shapeType: null
      });
    } else if (value === 'no') {
      setFormData({ ...formData, isMarathon: false });
    }
  };

  const handleEnvTypeChange = (value: string) => {
    if (value) {
      setFormData({ ...formData, envType: value });
    }
  };

  const handleShapeTypeChange = (value: string) => {
    if (value) {
      setFormData({ ...formData, shapeType: value });
    }
  };

  return (
    <div className='flex min-h-dvh flex-col'>
      {/* Map Section */}
      <div className='relative h-75 w-full px-5 pt-3'>
        <NaverMap
          className='h-full w-full rounded-xl'
          points={course.coursePointList}
          markers={markers}
          markerSize={32}
          bounds={bounds}
          focusKey='edit'
          fitEnabled
          interactionsEnabled={false}
          color='blue'
        />
      </div>

      {/* Form Section */}
      <div className='flex flex-1 flex-col px-5 pt-6 pb-24'>
        {/* Course Title */}
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

        {/* Start/End Address (read-only) */}
        <div className='mb-8'>
          <Label className='text-contents-b15 text-pri mb-3'>출발지</Label>
          <div className='bg-g-10 text-sec text-contents-r15 flex h-14 items-center rounded-xl px-4'>
            {course.startAddress || '주소 정보 없음'}
          </div>
        </div>

        <div className='mb-8'>
          <Label className='text-contents-b15 text-pri mb-3'>도착지</Label>
          <div className='bg-g-10 text-sec text-contents-r15 flex h-14 items-center rounded-xl px-4'>
            {course.endAddress || '주소 정보 없음'}
          </div>
        </div>

        {/* Distance (read-only) */}
        <div className='mb-8'>
          <Label className='text-contents-b15 text-pri mb-3'>코스 길이</Label>
          <div className='bg-g-10 text-sec text-contents-r15 flex h-14 items-center justify-between rounded-xl px-4'>
            <span>{(course.totalDistance / 1000).toFixed(1)}</span>
            <span className='text-ter'>km</span>
          </div>
        </div>
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className='bg-w-100 fixed right-0 bottom-0 left-0 mx-auto max-w-xl p-5'>
        <Button
          size='lg'
          className='w-full'
          disabled={!isFormValid || isEditing}
          onClick={handleSubmit}
        >
          {isEditing ? (
            <div className='border-w-100 size-5 animate-spin rounded-full border-2 border-t-transparent' />
          ) : (
            '수정하기'
          )}
        </Button>
      </div>
    </div>
  );
}

export default MyCourseEdit;
