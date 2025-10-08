import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { CoursesApi } from '@/features/course/api/course.api';
import { useCourses } from '@/features/course/hooks/useCourses';
import { NaverMap } from '@/features/map/ui/NaverMap';
import { Icon } from '@/shared/icons/icon';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';
import Tooltip from '@/shared/ui/composites/tooltip';
import { Button } from '@/shared/ui/primitives/button';

import type { Course } from '@/features/course/model/types';

const CourseDetail = () => {
  const { uuid } = useParams<{ uuid: Course['uuid'] }>();
  const navigate = useNavigate();
  const { courses } = useCourses();
  const course = courses.find((c) => c.uuid === uuid) ?? null;
  const mockCourse = {
    ...course,
    elevationAsc: 30,
    elevationDesc: 20,
    startName: '서울 용산구 대사관로34길 12 1, 2층',
    endName: '서울시 중랑구',
    recommendedCount: 20
  };

  const [isCopying, setIsCopying] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCourse = async () => {
      if (!uuid) return;

      try {
        // const detail = await CoursesApi.getCourseDetail(uuid);
        // setCourse(detail);
      } catch (error) {
        console.error('Failed to fetch course detail:', error);
        toast.error('코스 불러오기 실패');
        navigate('/');
      }
    };

    fetchCourse();
  }, [uuid, navigate]);

  const handleClickBookmark = () => {
    toast('북마크 기능은 준비중입니다.');
    // TODO: API
  };

  const handleClickCopy = (text: 'startName' | 'endName') => {
    setIsCopying({ ...isCopying, [text]: true });

    navigator.clipboard.writeText(mockCourse[text]);
    toast('주소가 복사되었습니다.');

    setTimeout(() => {
      setIsCopying({ ...isCopying, [text]: false });
    }, 1000);
  };

  const handleLike = () => {
    // toast(isLiked ? '좋아요를 취소했습니다.' : '좋아요를 눌렀습니다.');
    toast('좋아요 기능은 준비중입니다.');
    // TODO: API
  };

  const handleDownloadGPX = () => {
    if (!uuid) return;
    CoursesApi.getCourseGpx(uuid);
  };

  if (!course) {
    return <LoadingSpinner />;
  }

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      {/* Header */}
      <div className='relative'>
        {/* Map */}
        <div className='h-78 px-5 pt-3'>
          <NaverMap
            center={{ lat: course.lat, lng: course.lng }}
            className='h-full w-full rounded-xl'
          />
        </div>
      </div>

      {/* Content */}
      <div className='px-5'>
        {/* Course Info */}
        <div className='space-y-1 pt-6 pb-7.5'>
          <div className='flex items-center justify-between gap-1'>
            <h3 className='text-md truncate font-semibold'>
              {course?.name || '코스이름'}
            </h3>
            <Button
              variant='ghost'
              className='h-6 w-6 p-0'
              onClick={handleClickBookmark}
            >
              <Icon
                name={course.isBookmarked ? 'save_on_solid' : 'save_off_solid'}
                size={24}
              />
            </Button>
          </div>
          <div className='text-blue text-3xl font-bold'>
            {(course.totalDistance / 1000).toFixed(1)}km
          </div>
        </div>

        <div className='grid grid-cols-3'>
          <div className='flex flex-col gap-1'>
            <div className='text-text-tertiary text-sm'>난이도</div>
            <div className='font-bold'>Lv. {course.grade}</div>
          </div>
          <div className='flex flex-col gap-1'>
            <div className='text-text-tertiary text-sm'>러닝 장소</div>
            <div className='font-bold'>{course.envTypeName}</div>
          </div>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-1'>
              <div className='text-text-tertiary text-sm'>코스 모양</div>
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
            <div className='font-bold'>{course.shapeTypeName}</div>
          </div>
        </div>

        <div className='flex flex-col space-y-3 border-b border-b-gray-200 pt-8 pb-7.5'>
          <div className='text-text-tertiary text-sm'>고도</div>
          <div className='flex h-48 w-full items-center justify-center rounded-lg bg-gray-200'>
            <span className='text-muted-foreground'>고도 차트</span>
          </div>
          <div className='grid grid-cols-2'>
            <div className='flex items-center gap-2'>
              <span className='text-text-tertiary text-sm'>상승 고도</span>
              <span className='text-lg font-bold'>
                {mockCourse.elevationAsc}m
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-text-tertiary text-sm'>하강 고도</span>
              <span className='text-lg font-bold'>
                {mockCourse.elevationDesc}m
              </span>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className='pt-7.5'>
          <div className='mb-4 font-bold'>출발 · 도착지</div>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Icon
                name='active_start'
                size={24}
                color='currentColor'
                className='flex-shrink-0 text-gray-800'
              />
              <span className='truncate'>{mockCourse.startName}</span>
              {!isCopying['startName'] ? (
                <Button
                  variant='ghost'
                  className='h-5 justify-start p-0'
                  onClick={() => handleClickCopy('startName')}
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
              <span className='truncate'>{mockCourse.endName}</span>
              {!isCopying['endName'] ? (
                <Button
                  variant='ghost'
                  className='h-5 p-0'
                  onClick={() => handleClickCopy('endName')}
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
              className='flex-1 rounded-tr-none rounded-br-none shadow-none'
              onClick={handleLike}
            >
              <Icon name='heart_off' size={24}></Icon>
              <div className='flex items-center gap-1'>
                <span>추천</span>
                <span className='text-sm'>{mockCourse.recommendedCount}</span>
              </div>
            </Button>
            <div className='flex items-center bg-gray-100'>
              <span className='text-gray-200'>|</span>
            </div>
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

        <div className='py-10'>
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
      </div>
    </div>
  );
};

export default CourseDetail;
