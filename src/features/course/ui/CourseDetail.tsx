import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';

import { CoursesApi } from '@/features/course/api/course.api';
import { useCourseDetail } from '@/features/course/hooks/useCourseDetail';
import { buildElevationChartData } from '@/features/course/lib/elevation';
import {
  GRADE_TO_NAME,
  SHAPE_TYPE_COLOR,
  SHAPE_TYPE_TO_NAME
} from '@/features/course/model/constants';
import { ElevationChart } from '@/features/course/ui/ElevationChart';
import { Icon } from '@/shared/icons/icon';
import { runddyColor } from '@/shared/model/constants';
import Feedback from '@/shared/ui/actions/Feedback';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';
import Tooltip from '@/shared/ui/composites/tooltip';
import { Button } from '@/shared/ui/primitives/button';

import type { Course } from '@/features/course/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

const Chip = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='bg-g-10 text-sec text-contents-m15 min-w-0 shrink-0 rounded-full px-3 py-1.5'>
      {children}
    </div>
  );
};

interface CourseDetailProps {
  isUserCourse?: boolean;
}

const CourseDetail = ({ isUserCourse = false }: CourseDetailProps) => {
  const { uuid } = useParams<{ uuid: Course['uuid'] }>();

  const { courseDetail: course, isLoading } = useCourseDetail(uuid ?? '');
  const activeColor: RUNDDY_COLOR = course
    ? SHAPE_TYPE_COLOR[course.shapeType]
    : 'blue';

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

  const handleClickCopy = async (text: 'startAddress' | 'endAddress') => {
    setIsCopying({ ...isCopying, [text]: true });

    try {
      await navigator.clipboard.writeText(course[text]);
      toast('주소가 복사되었어요');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('주소 복사에 실패했어요');
    } finally {
      setTimeout(() => {
        setIsCopying({ ...isCopying, [text]: false });
      }, 1000);
    }
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
          {!isUserCourse && (
            <div className='flex items-center justify-between gap-1'>
              <div className='text-contents-b16'>난이도</div>
              <Chip>{GRADE_TO_NAME[course.grade]}</Chip>
            </div>
          )}
          <div className='flex items-center justify-between gap-1'>
            <div className='text-contents-b16'>러닝 장소</div>
            <Chip>{course.envTypeName}</Chip>
          </div>
          <div className='flex items-center justify-between gap-1'>
            <div className='flex items-center gap-1'>
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
            <Chip>{SHAPE_TYPE_TO_NAME[course.shapeType]}코스</Chip>
          </div>

          <div>
            <div className='flex items-center justify-between gap-1 pb-4'>
              <div className='text-contents-b16'>고도</div>
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
              color={runddyColor[activeColor]}
            />
          </div>
        </div>

        {/* Location Info */}
        <div className='pt-9 pb-10'>
          <div className='text-contents-b16 mb-4'>출발 · 도착지</div>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Icon
                name='active_start'
                size={24}
                color='currentColor'
                className='text-g-80 flex-shrink-0'
              />
              <span className='text-sec text-contents-m15 truncate'>
                {course.startAddress}
              </span>
              {!isCopying['startAddress'] ? (
                <Button
                  variant='ghost'
                  className='h-5 justify-start p-0'
                  onClick={() => handleClickCopy('startAddress')}
                >
                  <span
                    className='text-contents-r14'
                    style={{ color: runddyColor[activeColor] }}
                  >
                    복사
                  </span>
                </Button>
              ) : (
                <div className='text-runddy-green flex flex-shrink-0 items-center gap-1'>
                  <span className='text-contents-r14'>복사됨</span>
                  <Icon name='check' size={12} color='currentColor' />
                </div>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <Icon
                name='active_end'
                size={24}
                color='currentColor'
                className='text-g-80 flex-shrink-0'
              />
              <span className='text-sec text-contents-m15 truncate'>
                {course.endAddress}
              </span>
              {!isCopying['endAddress'] ? (
                <Button
                  variant='ghost'
                  className='h-5 p-0'
                  onClick={() => handleClickCopy('endAddress')}
                >
                  <span
                    className='text-contents-r14'
                    style={{ color: runddyColor[activeColor] }}
                  >
                    복사
                  </span>
                </Button>
              ) : (
                <div className='text-runddy-green flex flex-shrink-0 items-center gap-1'>
                  <span className='text-contents-r14'>복사됨</span>
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
              <Icon
                name='download'
                size={24}
                color='currentColor'
                className='text-g-70'
              />
              <span className='text-sec text-contents-m16'>GPX 다운로드</span>
            </Button>
          </div>
        </div>
      </div>

      {!isUserCourse && (
        <>
          <div className='bg-g-10 h-3 w-full' />

          <div className='space-y-8 px-5 py-10'>
            <Feedback feedbackType='COURSE' />
            <p className='text-ter text-contents-r14'>
              소개하고 싶은 코스가 있다면
              <br />
              <a
                href='mailto:runddyofficial@gmail.com'
                className='text-runddy-blue cursor-pointer underline hover:underline'
              >
                runddyofficial@gmail.com
              </a>
              로 GPX 파일을 전달해 주세요 :)
            </p>
          </div>
        </>
      )}
    </>
  );
};

export default CourseDetail;
