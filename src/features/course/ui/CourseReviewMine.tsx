import { useState } from 'react';
import { useParams } from 'react-router';

import { useCourseReviewForm } from '@/features/course/hooks/useCourseReviewForm';
import { useDeleteCourseReview } from '@/features/course/hooks/useDeleteCourseReview';
import CourseReviewWrite from '@/features/course/ui/CourseReviewWrite';
import { Icon } from '@/shared/icons/icon';
import { Button } from '@/shared/ui/primitives/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogTitle
} from '@/shared/ui/primitives/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/ui/primitives/popover';

const CourseReviewMine = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const { formDetail, isLoading } = useCourseReviewForm(uuid!);
  const { deleteReview, isDeleting } = useDeleteCourseReview(uuid!);

  const [open, setOpen] = useState(false);

  return (
    <div className='relative'>
      <Button
        variant='ghost'
        className='gap-1 p-0'
        onClick={() => setOpen(true)}
        disabled={isLoading}
      >
        <span>내 리뷰</span>
        <Icon name='chevron_right' size={14} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogContent
            fullWidth
            className='bg-w-100 fixed inset-0 top-1/2 left-1/2 z-[10000] flex h-full w-full flex-col rounded-none p-0'
          >
            <DialogHeader>
              <DialogClose className='justify-self-start rounded'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => setOpen(false)}
                >
                  <Icon name='chevron_left' size={24} />
                </Button>
              </DialogClose>
              <DialogTitle>내 리뷰</DialogTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 justify-self-end'
                  >
                    <Icon name='more' size={24} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side='bottom'
                  align='center'
                  sideOffset={4}
                  className='bg-w-100 text-contents-r15 relative z-[10002] mt-3 mr-5 flex w-[168px] flex-col px-1 py-0'
                >
                  <div className='border-g-20 flex h-[46px] w-full flex-col justify-center border-b'>
                    <CourseReviewWrite triggerMode='editReview' />
                  </div>
                  <Button
                    variant='ghost'
                    onClick={() => deleteReview()}
                    className='flex h-[46px] w-full items-center justify-between'
                    disabled={isDeleting}
                  >
                    <span className='text-contents-r14'>삭제하기</span>
                    <Icon
                      name='trash'
                      size={16}
                      color='currentColor'
                      className='text-line-ter'
                    />
                  </Button>
                </PopoverContent>
              </Popover>
            </DialogHeader>

            <div className='flex-1 overflow-y-auto px-5 pt-1 pb-6'>
              {formDetail.map((category) => {
                const selectedKeywords = category.keywords.filter(
                  (k) => k.isSelected
                );
                if (selectedKeywords.length === 0) return null;

                return (
                  <div key={category.categoryCode} className='py-5 first:pt-0'>
                    <div className='text-contents-b16 mb-4'>
                      {category.label}
                    </div>
                    <div className='flex flex-wrap gap-x-2.5 gap-y-3'>
                      {selectedKeywords.map((keyword) => (
                        <div
                          key={keyword.keywordId}
                          style={{ backgroundColor: keyword.color }}
                          className='text-contents-m15 flex items-center gap-1 rounded-full px-3 py-2'
                        >
                          <span>{keyword.emoji}</span>
                          <span>{keyword.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default CourseReviewMine;
