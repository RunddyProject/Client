import { useMemo } from 'react';

import { ElevationChart } from '@/features/course/ui/ElevationChart';
import { NaverMap } from '@/features/map/ui/NaverMap';
import { runddyColor } from '@/shared/model/constants';
import { SelectButton } from '@/shared/ui/composites/select-button';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/ui/primitives/toggle-group';

import { ENV_TYPE_OPTIONS, SHAPE_TYPE_OPTIONS } from '../model/constants';

import type { ElevationChartData } from '@/features/course/lib/elevation';
import type { CoursePoint } from '@/features/course/model/types';
import type {
  CoursePreviewData,
  CourseUploadFormData
} from '@/features/course-upload/model/types';
import type { LatLngBounds, MarkerInput } from '@/features/map/model/types';

interface CourseUploadFormProps {
  previewData: CoursePreviewData;
  formData: CourseUploadFormData;
  onFormDataChange: (data: CourseUploadFormData) => void;
  startAddress: string;
  endAddress: string;
  isLoadingAddresses: boolean;
  elevationChartData: ElevationChartData;
  isFormValid: boolean;
  isUploading: boolean;
  onSubmit: () => void;
}

export function CourseUploadForm({
  previewData,
  formData,
  onFormDataChange,
  startAddress,
  endAddress,
  isLoadingAddresses,
  elevationChartData,
  isFormValid,
  isUploading,
  onSubmit
}: CourseUploadFormProps) {
  // Course points for the map
  const coursePoints: CoursePoint[] = previewData.coursePointList;

  // Create markers for start and end points
  // Use 'upload' as focusKey so markers get colored
  const FOCUS_KEY = 'upload';
  const markers: MarkerInput[] = useMemo(() => {
    if (!coursePoints.length) return [];

    const start = coursePoints[0];
    const end = coursePoints[coursePoints.length - 1];

    return [
      { id: FOCUS_KEY, lat: start.lat, lng: start.lng, kind: 'start' },
      { id: `${FOCUS_KEY}__end`, lat: end.lat, lng: end.lng, kind: 'end' }
    ];
  }, [coursePoints]);

  // Map bounds
  const bounds: LatLngBounds = useMemo(() => {
    if (!coursePoints.length) {
      return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
    }

    const lats = coursePoints.map((p) => p.lat);
    const lngs = coursePoints.map((p) => p.lng);

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs)
    };
  }, [coursePoints]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ ...formData, name: e.target.value });
  };

  const handleMarathonChange = (value: string) => {
    if (value === 'yes') {
      onFormDataChange({
        ...formData,
        isMarathon: true,
        envType: null,
        shapeType: null
      });
    } else if (value === 'no') {
      onFormDataChange({ ...formData, isMarathon: false });
    }
  };

  const handleEnvTypeChange = (value: string) => {
    if (value) {
      onFormDataChange({
        ...formData,
        envType: value as CourseUploadFormData['envType']
      });
    }
  };

  const handleShapeTypeChange = (value: string) => {
    if (value) {
      onFormDataChange({
        ...formData,
        shapeType: value as CourseUploadFormData['shapeType']
      });
    }
  };

  return (
    <div className='flex min-h-dvh flex-col'>
      {/* Map Section */}
      <div className='relative h-75 w-full px-5 pt-3'>
        <NaverMap
          className='h-full w-full rounded-xl'
          points={coursePoints}
          markers={markers}
          markerSize={32}
          bounds={bounds}
          focusKey={FOCUS_KEY}
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

        {/* Auto-filled fields (shown when marathon selection is made) */}
        {formData.isMarathon !== null && (
          <>
            {/* Start/End Address */}
            <div className='mb-8'>
              <Label className='text-contents-b15 text-pri mb-3'>출발지</Label>
              <div className='bg-g-10 text-sec text-contents-r15 flex h-14 items-center rounded-xl px-4'>
                {isLoadingAddresses ? (
                  <span className='text-ter'>주소 불러오는 중...</span>
                ) : (
                  startAddress || '주소 정보 없음'
                )}
              </div>
            </div>

            <div className='mb-8'>
              <Label className='text-contents-b15 text-pri mb-3'>도착지</Label>
              <div className='bg-g-10 text-sec text-contents-r15 flex h-14 items-center rounded-xl px-4'>
                {isLoadingAddresses ? (
                  <span className='text-ter'>주소 불러오는 중...</span>
                ) : (
                  endAddress || '주소 정보 없음'
                )}
              </div>
            </div>

            {/* Distance */}
            <div className='mb-8'>
              <Label className='text-contents-b15 text-pri mb-3'>
                코스 길이
              </Label>
              <div className='bg-g-10 text-sec text-contents-r15 flex h-14 items-center justify-between rounded-xl px-4'>
                <span>{(previewData.totalDistance / 1000).toFixed(1)}</span>
                <span className='text-ter'>km</span>
              </div>
            </div>

            {/* Elevation */}
            <div className='mb-8'>
              <div className='mb-3 flex items-center justify-between'>
                <Label className='text-contents-b15 text-pri'>고도</Label>
                <div className='text-contents-r13 text-sec flex gap-3'>
                  <span>상승 {elevationChartData.elevationGain}m</span>
                  <span>하강 {elevationChartData.elevationLoss}m</span>
                </div>
              </div>
              <div className='bg-g-10 rounded-xl p-4'>
                <ElevationChart
                  series={elevationChartData.series}
                  minEle={elevationChartData.minEle}
                  maxEle={elevationChartData.maxEle}
                  height={160}
                  color={runddyColor.blue}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className='bg-w-100 fixed right-0 bottom-0 left-0 mx-auto max-w-xl p-5'>
        <Button
          size='lg'
          className='w-full'
          disabled={!isFormValid || isUploading}
          onClick={onSubmit}
        >
          {isUploading ? (
            <div className='border-w-100 size-5 animate-spin rounded-full border-2 border-t-transparent' />
          ) : (
            '등록하기'
          )}
        </Button>
      </div>
    </div>
  );
}
