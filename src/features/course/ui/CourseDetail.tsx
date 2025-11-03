import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';

import { CoursesApi } from '@/features/course/api/course.api';
import { useCourseDetail } from '@/features/course/hooks/useCourseDetail';
import { buildElevationChartData } from '@/features/course/lib/elevation';
import {
  GRADE_TO_NAME,
  SHAPE_TYPE_TO_NAME
} from '@/features/course/model/constants';
import { ElevationChart } from '@/features/course/ui/ElevationChart';
import { Icon } from '@/shared/icons/icon';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';
import Tooltip from '@/shared/ui/composites/tooltip';
import { Button } from '@/shared/ui/primitives/button';

import type { Course } from '@/features/course/model/types';

const Chip = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='min-w-0 shrink-0 rounded-full bg-gray-100 px-3 py-1.5 font-medium'>
      {children}
    </div>
  );
};

const CourseDetail = () => {
  const { uuid } = useParams<{ uuid: Course['uuid'] }>();

  const { courseDetail: course, isLoading } = useCourseDetail(uuid ?? '');

  const elevationChartData = useMemo(
    () => course && buildElevationChartData(course.coursePointList),
    [course]
  );

  const [isCopying, setIsCopying] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!course) {
    return null;
  }

  const handleClickCopy = (text: 'startAddress' | 'endAddress') => {
    setIsCopying({ ...isCopying, [text]: true });

    navigator.clipboard.writeText(course[text]);
    toast('주소가 복사되었어요');

    setTimeout(() => {
      setIsCopying({ ...isCopying, [text]: false });
    }, 1000);
  };

  const handleDownloadGPX = () => {
    if (!uuid) return;
    CoursesApi.getCourseGpx(uuid);
  };

  const { series, minEle, maxEle } = elevationChartData ?? {
    series: [],
    minEle: 0,
    maxEle: 0
  };

  return (
    <>
      <div className='px-5'>
        <div className='space-y-8'>
          <div className='flex items-center justify-between gap-1'>
            <div className='font-bold'>난이도</div>
            <Chip>{GRADE_TO_NAME[course.grade]}</Chip>
          </div>
          <div className='flex items-center justify-between gap-1'>
            <div className='font-bold'>러닝 장소</div>
            <Chip>{course.envTypeName}</Chip>
          </div>
          <div className='flex items-center justify-between gap-1'>
            <div className='flex items-center gap-1'>
              <div className='font-bold'>코스 모양</div>
              <Tooltip
                title={'코스 모양에 대해 설명해 드릴게요'}
                body={
                  <ul className='list-disc space-y-1 pl-4 marker:text-white/70'>
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
            <Chip>{SHAPE_TYPE_TO_NAME[course.shapeType]}코스</Chip>
          </div>

          <div>
            <div className='flex items-center justify-between gap-1 pb-4'>
              <div className='font-bold'>고도</div>
              <div className='flex gap-2'>
                <Chip>상승 {course.elevationGain.toFixed()}m</Chip>
                <Chip>하강 {course.elevationLoss.toFixed()}m</Chip>
              </div>
            </div>
            <ElevationChart
              series={series}
              minEle={minEle}
              maxEle={maxEle}
              height={192}
            />
          </div>
        </div>

        {/* Location Info */}
        <div className='pt-9 pb-10'>
          <div className='mb-4 font-bold'>출발 · 도착지</div>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Icon
                name='active_start'
                size={24}
                color='currentColor'
                className='flex-shrink-0 text-gray-800'
              />
              <span className='truncate'>{course.startAddress}</span>
              {!isCopying['startAddress'] ? (
                <Button
                  variant='ghost'
                  className='h-5 justify-start p-0'
                  onClick={() => handleClickCopy('startAddress')}
                >
                  <span className='text-blue text-sm'>복사</span>
                </Button>
              ) : (
                <div className='text-green flex flex-shrink-0 items-center gap-1'>
                  <span className='text-sm'>복사됨</span>
                  <Icon name='check' size={12} color='currentColor' />
                </div>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <Icon
                name='active_end'
                size={24}
                color='currentColor'
                className='flex-shrink-0 text-gray-800'
              />
              <span className='truncate'>{course.endAddress}</span>
              {!isCopying['endAddress'] ? (
                <Button
                  variant='ghost'
                  className='h-5 p-0'
                  onClick={() => handleClickCopy('endAddress')}
                >
                  <span className='text-blue text-sm'>복사</span>
                </Button>
              ) : (
                <div className='text-green flex flex-shrink-0 items-center gap-1'>
                  <span className='text-sm'>복사됨</span>
                  <Icon name='check' size={12} color='currentColor' />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className='items-col flex w-full pt-7.5'>
            <Button
              size='lg'
              variant='secondary'
              className='flex-1 rounded-tl-none rounded-bl-none shadow-none'
              onClick={handleDownloadGPX}
            >
              <Icon name='download' size={24} />
              GPX 다운로드
            </Button>
          </div>
        </div>
      </div>

      <div className='h-3 w-full bg-gray-100' />

      <div className='px-5 py-10'>
        <Link
          // TODO: course edit suggestion page
          to='/'
          className='flex items-center gap-3 rounded-xl bg-gray-200 p-4'
        >
          {/* <Icon name='' size={48} /> */}
          <div className='h-12 w-12 rounded-xl bg-gray-100' />
          <div className='flex-1 space-y-0.5'>
            <div className='text-text-secondary font-bold'>
              잘못된 정보가 있나요?
            </div>
            <div className='text-text-secondary text-xs'>
              수정이 필요하다면 알려주세요!
            </div>
          </div>
          <Icon
            name='chevron_right'
            size={16}
            color='currentColor'
            className='text-gray-400'
          />
        </Link>
      </div>
    </>
  );
};

export default CourseDetail;
