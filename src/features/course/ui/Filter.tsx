import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { useCourseCount } from '@/features/course/hooks/useCourseCount';
import { useCourses } from '@/features/course/hooks/useCourses';
import {
  grades,
  envTypeNames,
  shapeTypeNames,
  ENV_NAME_TO_TYPE,
  SHAPE_NAME_TO_TYPE,
  GRADE_TO_NAME
} from '@/features/course/model/constants';
import { Icon } from '@/shared/icons/icon';
import { buildQuery } from '@/shared/lib/query';
import { cn, deepEqual } from '@/shared/lib/utils';
import Tooltip from '@/shared/ui/composites/tooltip';
import { Button } from '@/shared/ui/primitives/button';
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
} from '@/shared/ui/primitives/dialog';
import { Slider } from '@/shared/ui/primitives/slider';
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/ui/primitives/toggle-group';

import type {
  CourseFilterPayload,
  GradeType
} from '@/features/course/model/types';

type Tuple2 = [number, number];

interface FilterState {
  grade: string[];
  envType: string[];
  shapeType: string[];
  distanceRange: Tuple2;
  elevationRange: Tuple2;
}

const DEFAULTS: FilterState = {
  grade: [],
  envType: [],
  shapeType: [],
  distanceRange: [0, 40],
  elevationRange: [0, 1000]
};

const FilterChipsBar = ({
  applied,
  onRemove
}: {
  applied: FilterState;
  onRemove: (field: keyof FilterState, value?: string) => void;
}) => {
  const isSameRange = (a: [number, number], b: [number, number]) =>
    a[0] === b[0] && a[1] === b[1];

  const Chip = ({
    children,
    onClick
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <Button
      aria-label='remove'
      onClick={onClick}
      className='bg-g-90 pointer-events-auto flex h-8.5 items-center gap-1 rounded-full px-3 py-2'
    >
      <span className='text-contents-m14'>{children}</span>
      <Icon name='close' size={14} color='currentColor' className='text-g-20' />
    </Button>
  );

  return (
    <div className='flex items-center gap-2'>
      {applied.grade.map((g) => (
        <Chip key={`grade-${g}`} onClick={() => onRemove('grade', g)}>
          {GRADE_TO_NAME[Number(g) as GradeType]}
        </Chip>
      ))}

      {applied.envType.map((env) => (
        <Chip key={`env-${env}`} onClick={() => onRemove('envType', env)}>
          {env}
        </Chip>
      ))}

      {applied.shapeType.map((shape) => (
        <Chip
          key={`shape-${shape}`}
          onClick={() => onRemove('shapeType', shape)}
        >
          {shape}
        </Chip>
      ))}

      {!isSameRange(applied.distanceRange, DEFAULTS.distanceRange) && (
        <Chip onClick={() => onRemove('distanceRange')}>
          {applied.distanceRange[0]}–{applied.distanceRange[1]}km
        </Chip>
      )}

      {!isSameRange(applied.elevationRange, DEFAULTS.elevationRange) && (
        <Chip onClick={() => onRemove('elevationRange')}>
          {applied.elevationRange[0]}–{applied.elevationRange[1]}m
        </Chip>
      )}
    </div>
  );
};

const CourseFilter = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const applied: FilterState = useMemo(
    () => ({
      grade: params.getAll('grade'),
      envType: params
        .getAll('envType')
        .map(
          (code) =>
            Object.keys(ENV_NAME_TO_TYPE).find(
              (k) =>
                ENV_NAME_TO_TYPE[k as keyof typeof ENV_NAME_TO_TYPE] === code
            ) || code
        ),
      shapeType: params
        .getAll('shapeType')
        .map(
          (code) =>
            Object.keys(SHAPE_NAME_TO_TYPE).find(
              (k) =>
                SHAPE_NAME_TO_TYPE[k as keyof typeof SHAPE_NAME_TO_TYPE] ===
                code
            ) || code
        ),
      distanceRange: [
        Number(params.get('minDist') ?? 0),
        Number(params.get('maxDist') ?? 40)
      ],
      elevationRange: [
        Number(params.get('minEle') ?? 0),
        Number(params.get('maxEle') ?? 1000)
      ]
    }),
    [params]
  );

  const [draft, setDraft] = useState<FilterState>(applied);

  const payload: CourseFilterPayload = useMemo(
    () => ({
      envTypeList:
        draft.envType.length > 0
          ? draft.envType.map(
              (k) => ENV_NAME_TO_TYPE[k as keyof typeof ENV_NAME_TO_TYPE] ?? k
            )
          : undefined,
      shapeTypeList:
        draft.shapeType.length > 0
          ? draft.shapeType.map(
              (k) =>
                SHAPE_NAME_TO_TYPE[k as keyof typeof SHAPE_NAME_TO_TYPE] ?? k
            )
          : undefined,
      gradeList: draft.grade.length > 0 ? draft.grade.map(Number) : undefined,
      minDist: !deepEqual(draft.distanceRange, DEFAULTS.distanceRange)
        ? draft.distanceRange[0] * 1000
        : undefined,
      maxDist: !deepEqual(draft.distanceRange, DEFAULTS.distanceRange)
        ? draft.distanceRange[1] * 1000
        : undefined,
      minEle: !deepEqual(draft.elevationRange, DEFAULTS.elevationRange)
        ? draft.elevationRange[0] * 1000
        : undefined,
      maxEle: !deepEqual(draft.elevationRange, DEFAULTS.elevationRange)
        ? draft.elevationRange[1] * 1000
        : undefined
    }),
    [draft]
  );

  const { courses } = useCourses();
  const { count } = useCourseCount(payload);

  const isFilterChanged = !deepEqual(draft, applied);
  const displayCount = isFilterChanged ? count : courses.length;

  const setDistanceRange = (range: [number, number]) => {
    setDraft((prev) => ({ ...prev, distanceRange: range }));
  };

  const setElevationRange = (range: [number, number]) => {
    setDraft((prev) => ({ ...prev, elevationRange: range }));
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setDraft(applied);
  };

  const handleToggle = (field: keyof FilterState, value: string) => {
    setDraft((prev) => {
      const arr = prev[field] as string[];
      const nextArr = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...prev, [field]: nextArr };
    });
  };

  const handleApply = () => {
    const queryParams: Record<string, any> = {
      ...Object.fromEntries(params.entries())
    };

    if (draft.grade.length > 0) queryParams.grade = draft.grade;
    else delete queryParams.grade;

    if (draft.envType.length > 0)
      queryParams.envType = draft.envType.map(
        (k) => ENV_NAME_TO_TYPE[k as keyof typeof ENV_NAME_TO_TYPE] ?? k
      );
    else delete queryParams.envType;

    if (draft.shapeType.length > 0)
      queryParams.shapeType = draft.shapeType.map(
        (k) => SHAPE_NAME_TO_TYPE[k as keyof typeof SHAPE_NAME_TO_TYPE] ?? k
      );
    else delete queryParams.shapeType;

    if (!deepEqual(draft.distanceRange, DEFAULTS.distanceRange)) {
      queryParams.minDist = draft.distanceRange[0];
      queryParams.maxDist = draft.distanceRange[1];
    } else {
      delete queryParams.minDist;
      delete queryParams.maxDist;
    }

    if (!deepEqual(draft.elevationRange, DEFAULTS.elevationRange)) {
      queryParams.minEle = draft.elevationRange[0];
      queryParams.maxEle = draft.elevationRange[1];
    } else {
      delete queryParams.minEle;
      delete queryParams.maxEle;
    }

    const query = buildQuery(queryParams);
    navigate({ search: query });
    setOpen(false);
  };

  const handleRemove = (field: keyof FilterState, value?: string) => {
    const next = new URLSearchParams(params);

    switch (field) {
      case 'grade':
      case 'envType':
      case 'shapeType':
        next.delete(field);
        applied[field].forEach((v) => {
          if (v !== value) next.append(field, v);
        });
        break;
      case 'distanceRange':
        next.delete('minDist');
        next.delete('maxDist');
        break;
      case 'elevationRange':
        next.delete('minEle');
        next.delete('maxEle');
        break;
    }

    navigate({ search: next.toString() });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className='flex items-center gap-2'>
        <DialogTrigger asChild>
          {deepEqual(applied, DEFAULTS) ? (
            <Button
              size='icon'
              variant='secondary'
              className={cn(
                'pointer-events-auto flex h-8.5 w-fit items-center gap-1 rounded-full px-3',
                className
              )}
            >
              <Icon
                name='filter'
                size={18}
                color='currentColor'
                className='text-g-70'
              />
              <span className='text-sec text-contents-m14'>필터</span>
            </Button>
          ) : (
            <Button
              size='icon'
              variant='secondary'
              className={cn(
                'pointer-events-auto flex h-8.5 w-8.5 items-center gap-1 rounded-full',
                className
              )}
            >
              <Icon name='filter' size={18} />
            </Button>
          )}
        </DialogTrigger>

        {!open && !deepEqual(applied, DEFAULTS) && (
          <FilterChipsBar applied={applied} onRemove={handleRemove} />
        )}
      </div>

      <DialogPortal>
        <DialogOverlay className='fixed inset-0 z-[10000]' />
        <DialogContent
          fullWidth
          className='bg-w-100 z-[10001] flex h-full flex-col'
        >
          <DialogHeader>
            <DialogTitle>상세 필터</DialogTitle>
            <DialogClose className='col-start-3 justify-self-end rounded p-3'>
              <Button variant='ghost' size='icon' className='rounded p-3'>
                <Icon name='close' size={24} />
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className='flex-1 overflow-x-clip overflow-y-auto'>
            <div className='p-5'>
              <div className='text-contents-b16 mb-5'>난이도</div>
              <ToggleGroup
                type='multiple'
                value={draft.grade}
                className='no-scrollbar w-full overflow-x-auto'
              >
                {grades.map((grd) => (
                  <ToggleGroupItem
                    key={grd}
                    value={String(grd)}
                    onClick={() => handleToggle('grade', String(grd))}
                  >
                    {GRADE_TO_NAME[grd as GradeType]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className='p-5'>
              <div className='text-contents-b16 mb-5'>러닝 장소</div>
              <ToggleGroup
                type='multiple'
                value={draft.envType}
                className='no-scrollbar w-full overflow-x-auto'
              >
                {envTypeNames.map((env) => (
                  <ToggleGroupItem
                    key={env}
                    value={env}
                    onClick={() => handleToggle('envType', env)}
                    className='rounded-full'
                  >
                    {env}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className='p-5'>
              <div className='mb-5 flex items-center gap-1'>
                <div className='text-contents-b16'>코스 모양</div>
                <Tooltip
                  title={'코스 모양에 대해 설명해 드릴게요'}
                  body={
                    <ul className='text-w-100 marker:text-w-100/70 list-disc space-y-1 pl-5'>
                      <li>순환코스: 출발한 곳으로 돌아오는 원형 코스</li>
                      <li>
                        직선코스: 한방향으로 쭉 달리는 형태(출발, 도착 다름)
                      </li>
                      <li>왕복코스: 같은 길을 따라 갔다가 되돌아오는 코스</li>
                      <li>아트코스: 러닝 루트가 그림처럼 그려지는 코스</li>
                    </ul>
                  }
                />
              </div>
              <ToggleGroup
                type='multiple'
                value={draft.shapeType}
                className='no-scrollbar w-full overflow-x-auto'
              >
                {shapeTypeNames.map((shape) => (
                  <ToggleGroupItem
                    key={shape}
                    value={shape}
                    onClick={() => handleToggle('shapeType', shape)}
                    className='rounded-full'
                  >
                    {shape}코스
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className='p-5'>
              <div className='text-contents-b16 mb-5'>코스 길이</div>
              <Slider
                value={draft.distanceRange}
                onValueChange={setDistanceRange}
                min={0}
                max={40}
                step={1}
              />
              <div className='text-ter text-contents-r14 flex justify-between pt-2'>
                <span>0km</span>
                <span>20km</span>
                <span>40km 이상</span>
              </div>
            </div>

            <div className='p-5'>
              <div className='text-contents-b16 mb-5'>코스 경사</div>
              <Slider
                value={draft.elevationRange}
                onValueChange={setElevationRange}
                min={0}
                max={1000}
                step={10}
              />
              <div className='text-ter text-contents-r14 flex justify-between pt-2'>
                <span>0m</span>
                <span>500m</span>
                <span>1000m 이상</span>
              </div>
            </div>
          </div>

          <DialogFooter className='flex w-full gap-3 p-5'>
            <Button
              variant='secondary'
              size='lg'
              className='flex-1'
              onClick={() => setDraft(DEFAULTS)}
            >
              초기화
            </Button>
            <DialogClose asChild className='flex-2'>
              <Button type='button' size='lg' onClick={handleApply}>
                {displayCount}개의 코스 보기
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CourseFilter;
