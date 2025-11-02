import { useParams, useNavigate } from 'react-router';

import { useCourseReview } from '@/features/course/hooks/useCourseReview';
import { useCourseReviewForm } from '@/features/course/hooks/useCourseReviewForm';
import CourseReviewMine from '@/features/course/ui/CourseReviewMine';
import ReviewWrite from '@/features/course/ui/CourseReviewWrite';
import CourseReviewWrite from '@/features/course/ui/CourseReviewWrite';
import profileImgUrl from '@/shared/assets/basic_profile.png';
import { Icon } from '@/shared/icons/icon';
import { formatReviewDate } from '@/shared/lib/date';
import LoadingSpinner from '@/shared/ui/composites/loading-spinner';
import { Avatar, AvatarFallback } from '@/shared/ui/primitives/avatar';

import type { Course } from '@/features/course/model/types';

const CourseReview = () => {
  const { uuid } = useParams<{ uuid: Course['uuid'] }>();

  const navigate = useNavigate();

  const {
    courseReviewCount,
    courseReviewSummary,
    courseReviewDetail,
    isLoading
  } = useCourseReview(uuid ?? '');
  const { form } = useCourseReviewForm(uuid!);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {courseReviewCount > 0 ? (
        <div className='flex min-h-screen flex-col bg-white pb-[100px]'>
          <div className='px-5 pt-5'>
            <div className='mb-5 flex items-center justify-between'>
              <h2 className='font-bold'>가장 많이 남긴 리뷰</h2>
              {form?.hasMyReview ? (
                <CourseReviewMine />
              ) : (
                <CourseReviewWrite triggerMode='writeReview' />
              )}
            </div>

            {courseReviewSummary.map((cat) => (
              <div key={cat.categoryCode} className='mb-5'>
                <h3 className='mb-3 text-base font-semibold'>{cat.category}</h3>
                <div className='flex flex-wrap gap-2'>
                  {cat.courseReviewKeywordList.map((kw) => (
                    <div
                      key={kw.keywordId}
                      className='flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm'
                    >
                      <span>{kw.keyword}</span>
                      <span className='text-xs text-gray-400'>
                        {kw.keywordCount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className='px-5'>
            <h3 className='font-bold'>리뷰 전체보기</h3>
            <div className='flex flex-col'>
              {courseReviewDetail.map((review, idx) => (
                <div
                  key={idx}
                  className='flex flex-col items-start gap-3 border-b border-gray-100 py-[22px] last:border-0'
                >
                  <div className='flex items-center gap-3'>
                    <Avatar
                      className='h-9 w-9 flex-shrink-0 cursor-pointer'
                      onClick={() => navigate('/me')}
                    >
                      <AvatarFallback>
                        <img
                          src={profileImgUrl}
                          alt='Profile'
                          width='36'
                          height='36'
                        />
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col gap-0.5'>
                      <div className='text-sm font-medium'>
                        {review.userName}
                      </div>
                      <div className='text-xs text-gray-400'>
                        {formatReviewDate(review.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className='flex-1'>
                    <div className='flex flex-wrap gap-1 pl-[46px]'>
                      {review.courseReviewKeywordList.map((kw) => (
                        <div
                          key={kw.keywordId}
                          className='flex items-center gap-1 text-[15px] after:mx-1 after:content-["·"] last:after:content-[""]'
                        >
                          <span>{kw.keyword}</span>
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
        <div className='flex flex-col items-center space-y-4 py-28'>
          <Icon name='empty_graphic' size={140} />
          <div className='flex flex-col items-center space-y-5 text-center'>
            <div className='text-placeholder'>
              지금까지 나눈 코스톡이 없어요
            </div>
            <ReviewWrite triggerMode='firstReview' />
          </div>
        </div>
      )}
    </>
  );
};

export default CourseReview;
