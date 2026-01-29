import { useEffect, useMemo } from 'react';
import { useOutletContext, useParams, useSearchParams } from 'react-router';

import { useHeader } from '@/app/providers/HeaderContext';
import { useCourseReview } from '@/features/course/hooks/useCourseReview';
import { SHAPE_TYPE_COLOR } from '@/features/course/model/constants';
import CourseDetail from '@/features/course/ui/CourseDetail';
import CourseReview from '@/features/course/ui/CourseReview';
import { useToggleBookmark } from '@/features/user/hooks/useToggleBookmark';
import { Icon } from '@/shared/icons/icon';
import { runddyColor } from '@/shared/model/constants';
import { ShareButton } from '@/shared/ui/actions/ShareButton';
import { Button } from '@/shared/ui/primitives/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/shared/ui/primitives/tabs';

import type { CourseInfoContext } from './info-layout';
import type { Course } from '@/features/course/model/types';
import type { RUNDDY_COLOR } from '@/shared/model/types';

const CourseInfo = () => {
  const { setConfig, resetConfig } = useHeader();

  const { uuid } = useParams<{ uuid: Course['uuid'] }>();
  const [params] = useSearchParams();
  const tab = params.get('tab') ?? 'detail';

  // Get course from layout context (map is rendered in layout)
  const { course } = useOutletContext<CourseInfoContext>();

  const { courseReviewCount } = useCourseReview(uuid ?? '');
  const { toggle, isSaving } = useToggleBookmark();

  // Memoize color for consistent styling
  const activeColor = useMemo<RUNDDY_COLOR>(
    () => (course ? SHAPE_TYPE_COLOR[course.shapeType] : 'blue'),
    [course?.shapeType]
  );

  useEffect(() => {
    if (!course) return;

    setConfig({
      rightButton: (
        <ShareButton
          title={`${course.name} (${(course.totalDistance / 1000).toFixed(1)}km)`}
        />
      )
    });

    return () => resetConfig();
  }, [course, resetConfig, setConfig]);

  const handleClickBookmark = () => {
    if (!uuid) return;
    toggle({ courseUuid: uuid, isBookmarked: !course.isBookmarked });
  };

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      {/* Map is rendered in layout above, no placeholder needed */}
      <div className='space-y-1 px-5 pt-6 pb-7.5'>
        <div className='flex items-center justify-between gap-1'>
          <div className='text-title-b18 truncate'>
            {course?.name || '코스이름'}
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={handleClickBookmark}
            disabled={isSaving}
            aria-label='Bookmark toggle'
          >
            <Icon
              name={course.isBookmarked ? 'save_on_solid' : 'save_off_solid'}
              size={24}
            />
          </Button>
        </div>
        <div
          className='text-[32px] font-bold'
          style={{ color: runddyColor[activeColor] }}
        >
          {(course.totalDistance / 1000).toFixed(1)}km
        </div>
      </div>

      <Tabs defaultValue={tab}>
        <TabsList className='border-g-20 grid w-full grid-cols-2 border-b-[1.2px] px-5'>
          <TabsTrigger value='detail'>
            <span>상세정보</span>
          </TabsTrigger>
          <TabsTrigger value='review'>
            <span>리뷰</span>
            <span className='text-contents-r15 ml-1'>{courseReviewCount}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value='detail' className='mt-6'>
          <CourseDetail />
        </TabsContent>
        <TabsContent value='review' className='mt-2'>
          <CourseReview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseInfo;
