import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { envTypeNames, grades, shapeTypeNames } from '@/lib/api/course.api';

type Tuple2 = [number, number];

interface FilterState {
  grade: string[];
  envType: string[];
  shapeType: string[];
  distanceRange: Tuple2; // [minKm, maxKm]
  elevationRange: Tuple2; // [min, max]
}

interface CourseFilterProps {
  initialCount: number;
}

const DEFAULTS: FilterState = {
  grade: [],
  envType: [],
  shapeType: [],
  distanceRange: [0, 40],
  elevationRange: [0, 1000]
};

const CourseFilter = ({ initialCount = 0 }: CourseFilterProps) => {
  const [applied, setApplied] = useState<FilterState>(DEFAULTS);
  const [draft, setDraft] = useState<FilterState>(DEFAULTS);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(initialCount);

  // ----- helpers -----
  const toggleInArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  // change only draft
  const toggleGrade = (grd: string) => {
    setDraft((prev) => {
      const next = { ...prev, grade: toggleInArray(prev.grade, grd) };
      handlePreviewCount(next);
      return next;
    });
  };

  const toggleEnvType = (env: string) => {
    setDraft((prev) => {
      const next = { ...prev, envType: toggleInArray(prev.envType, env) };
      handlePreviewCount(next);
      return next;
    });
  };

  const toggleShapeType = (shape: string) => {
    setDraft((prev) => {
      const next = { ...prev, shapeType: toggleInArray(prev.shapeType, shape) };
      handlePreviewCount(next);
      return next;
    });
  };

  const handleChangeDistanceRange = (range: number[]) => {
    const r: Tuple2 = [range[0], range[1]];
    setDraft((prev) => {
      const next = { ...prev, distanceRange: r };
      handlePreviewCount(next);
      return next;
    });
  };

  const handleChangeElevationRange = (range: number[]) => {
    const r: Tuple2 = [range[0], range[1]];
    setDraft((prev) => {
      const next = { ...prev, elevationRange: r };
      handlePreviewCount(next);
      return next;
    });
  };

  const handleReset = () => {
    setDraft(DEFAULTS);
    handlePreviewCount(DEFAULTS);
  };

  const handlePreviewCount = (f: FilterState) => {
    // TODO: GET /course/count
    // mock data
    const base = 10;
    const penalty =
      f.grade.length +
      f.envType.length +
      f.shapeType.length +
      Math.round((f.distanceRange[0] + f.distanceRange[1]) / 40) +
      Math.round((f.elevationRange[0] + f.elevationRange[1]) / 1000);
    const coursesCount = Math.max(0, base - penalty);
    setCount(coursesCount);
  };

  const handleSubmit = () => {
    setApplied(draft);
    toast('필터 기능은 준비중입니다');
    // TODO: GET /course using draft(applied)
    // e.g. onChange?.(draft) or liftup
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraft(applied);
      handlePreviewCount(applied);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size='icon'
          variant='secondary'
          className='pointer-events-auto flex h-8.5 w-fit items-center gap-1 rounded-full px-3'
        >
          <Icon name='filter' size={18} /> <span>필터</span>
        </Button>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay className='fixed inset-0 z-[10000]' />
        <DialogContent
          fullWidth
          className='z-[10001] flex min-h-screen flex-col bg-white'
        >
          <DialogHeader>
            <DialogTitle>상세 필터</DialogTitle>
            <DialogClose className='col-start-3 justify-self-end rounded p-3'>
              <Button variant='ghost' size='icon' className='rounded p-3'>
                <Icon name='close' size={24} />
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className='flex-1 overflow-y-auto'>
            <div className='p-5'>
              <h3 className='mb-5 text-base font-semibold'>난이도</h3>
              <div className='flex gap-2'>
                <ToggleGroup type='multiple' value={draft.grade}>
                  {grades
                    .map((grd) => String(grd))
                    .map((grd) => (
                      <ToggleGroupItem
                        key={grd}
                        value={grd}
                        aria-label={`Toggle Level ${grd}`}
                        onClick={() => toggleGrade(grd)}
                      >
                        Lv. {grd}
                      </ToggleGroupItem>
                    ))}
                </ToggleGroup>
              </div>
            </div>

            <div className='p-5'>
              <h3 className='mb-5 text-base font-semibold'>러닝 장소</h3>
              <div className='flex flex-wrap gap-2'>
                <ToggleGroup type='multiple' value={draft.envType}>
                  {envTypeNames.map((env) => (
                    <ToggleGroupItem
                      key={env}
                      value={env}
                      className='rounded-full'
                      onClick={() => toggleEnvType(env)}
                    >
                      {env}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>

            <div className='p-5'>
              <h3 className='mb-5 text-base font-semibold'>코스 모양</h3>
              <div className='flex flex-wrap gap-2'>
                <ToggleGroup type='multiple' value={draft.shapeType}>
                  {shapeTypeNames.map((shape) => (
                    <ToggleGroupItem
                      key={shape}
                      value={shape}
                      className='rounded-full'
                      onClick={() => toggleShapeType(shape)}
                    >
                      {shape}코스
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>

            <div className='p-5'>
              <div className='mb-5 flex items-center gap-1'>
                <h3 className='text-base font-semibold'>코스 길이</h3>
                <span className='text-text-secondary text-sm'>
                  {draft.distanceRange[0]}km - {draft.distanceRange[1]}km
                </span>
              </div>
              <Slider
                value={draft.distanceRange}
                onValueChange={handleChangeDistanceRange}
                min={0}
                max={40}
                step={1}
                className='mb-2'
              />
              <div className='text-text-tertiary flex justify-between text-sm'>
                <span>0km</span>
                <span>20km</span>
                <span>40km 이상</span>
              </div>
            </div>

            <div className='p-5'>
              <div className='mb-5 flex items-center gap-1'>
                <h3 className='text-base font-semibold'>코스 경사</h3>
                <span className='text-text-secondary text-sm'>
                  {draft.elevationRange[0]}km - {draft.elevationRange[1]}km
                </span>
              </div>
              <Slider
                value={draft.elevationRange}
                onValueChange={handleChangeElevationRange}
                min={0}
                max={1000}
                step={10}
                className='mb-2'
              />
              <div className='text-text-ter티ary flex justify-between text-sm'>
                <span>0km</span>
                <span>500km</span>
                <span>1000km 이상</span>
              </div>
            </div>
          </div>

          <DialogFooter className='flex w-full gap-3 p-5'>
            <Button
              variant='secondary'
              size='lg'
              className='flex-1'
              onClick={handleReset}
            >
              초기화
            </Button>

            <DialogClose asChild className='flex-2'>
              <Button type='button' size='lg' onClick={handleSubmit}>
                {count}개의 코스 보기
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CourseFilter;
