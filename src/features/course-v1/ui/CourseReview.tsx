import { useParams } from 'react-router';

import { useCourseReview } from '@/features/course-v1/hooks/useCourseReview';
import { useCourseReviewForm } from '@/features/course-v1/hooks/useCourseReviewForm';
import CourseReviewMine from '@/features/course-v1/ui/CourseReviewMine';
import CourseReviewWrite from '@/features/course-v1/ui/CourseReviewWrite';
import ReviewWrite from '@/features/course-v1/ui/CourseReviewWrite';
import { Icon } from '@/shared/icons/icon';
import { formatReviewDate } from '@/shared/lib/date';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';
import { Avatar, AvatarFallback } from '@/shared/ui/primitives/avatar';

import type { Course } from '@/features/course-v1/model/types';

const CourseReview = () => {
  const { uuid } = useParams<{ uuid: Course['uuid'] }>();

  const {
    courseReviewCount,
    courseReviewSummary,
    courseReviewDetail,
    isLoading
  } = useCourseReview(uuid ?? '');

  const { hasMyReview } = useCourseReviewForm(uuid!);

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      {courseReviewCount > 0 ? (
        <div className='bg-w-100 flex min-h-screen flex-col pb-[100px]'>
          <div className='px-5 pt-5'>
            <div className='mb-5 flex items-center justify-between'>
              <div className='text-contents-b16'>가장 많이 남긴 리뷰</div>
              {hasMyReview ? (
                <CourseReviewMine />
              ) : (
                <CourseReviewWrite triggerMode='writeReview' />
              )}
            </div>

            {courseReviewSummary.map((cat) => {
              const filteredKeywords = cat.keywords.filter(
                (kw) => kw.count > 0
              );

              if (filteredKeywords.length === 0) return null;
              return (
                <div key={cat.categoryCode} className='mb-5'>
                  <div className='text-ter text-contents-r15 mb-3'>
                    {cat.label}
                  </div>
                  <div className='flex flex-wrap gap-x-2.5 gap-y-3'>
                    {cat.keywords
                      .filter((kw) => kw.count > 0)
                      .map((kw) => (
                        <div
                          key={kw.keywordId}
                          style={{ backgroundColor: kw.color }}
                          className='bg-g-10 flex items-center gap-1 rounded-full px-3 py-1'
                        >
                          <span className='text-contents-r15'>{kw.emoji}</span>
                          <span className='text-contents-r15'>{kw.label}</span>
                          <span className='text-contents-r14 text-sec'>
                            {kw.count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className='px-5 pt-8'>
            <div className='text-contents-b16'>리뷰 전체보기</div>
            <div className='flex flex-col'>
              {courseReviewDetail.map((review, idx) => (
                <div
                  key={idx}
                  className='border-g-10 flex flex-col items-start gap-3 border-b py-[22px] last:border-0'
                >
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-9 w-9 flex-shrink-0 cursor-pointer'>
                      <AvatarFallback>
                        <Icon name='basic_profile' size={36} />
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col gap-0.5'>
                      <div className='text-contents-m14 text-sec'>
                        {review.userName}
                      </div>
                      <div className='text-g-40 text-[12px]'>
                        {formatReviewDate(review.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className='flex-1'>
                    <div className='flex flex-wrap gap-x-1 gap-y-1.5 pl-[46px]'>
                      {review.keywords.map((kw) => (
                        <div
                          key={kw.keywordId}
                          className='text-contents-m15 flex items-center gap-1 after:mx-1 after:content-["·"] last:after:content-[""]'
                        >
                          <span>{kw.emoji}</span>
                          <span>{kw.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center space-y-4 py-16'>
          <Icon name='empty_graphic' size={80} />
          <div className='flex flex-col items-center space-y-5 text-center'>
            <div className='text-placeholder text-contents-m16'>
              아직 리뷰가 없어요
            </div>
            <ReviewWrite triggerMode='firstReview' />
          </div>
        </div>
      )}
    </>
  );
};

export default CourseReview;
