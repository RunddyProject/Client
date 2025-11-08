import { useMemo, useState } from 'react';
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
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/ui/primitives/toggle-group';

const CourseReviewMine = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const { formDetail, isLoading } = useCourseReviewForm(uuid!);
  const { deleteReview, isDeleting } = useDeleteCourseReview(uuid!);

  const [open, setOpen] = useState(false);

  const selectedIds = useMemo(
    () =>
      formDetail
        .flatMap((c) => c.keywords)
        .filter((k) => k.isSelected)
        .map((k) => String(k.keywordId)),
    [formDetail]
  );

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
            className='fixed inset-0 top-1/2 left-1/2 z-[10000] flex h-full w-full flex-col rounded-none bg-white p-0'
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
                  className='relative z-[10002] mt-3 mr-5 flex w-[168px] flex-col bg-white px-1 py-0 text-sm'
                >
                  <div className='flex h-[48px] w-full flex-col justify-center border-b border-gray-200'>
                    <CourseReviewWrite triggerMode='editReview' />
                  </div>
                  <Button
                    variant='ghost'
                    onClick={() => deleteReview()}
                    className='flex h-[48px] w-full items-center justify-between'
                    disabled={isDeleting}
                  >
                    <span>삭제하기</span>
                    <Icon
                      name='trash'
                      size={16}
                      color='currentColor'
                      className='text-[#727787]'
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
                    <h3 className='mb-4 text-base font-semibold'>
                      {category.label}
                    </h3>
                    <ToggleGroup
                      type='multiple'
                      value={selectedIds}
                      className='flex flex-wrap gap-x-2.5 gap-y-3'
                      // 읽기 전용 표시이므로 onValueChange 없음
                    >
                      {selectedKeywords.map((keyword) => (
                        <ToggleGroupItem
                          key={keyword.keywordId}
                          value={String(keyword.keywordId)}
                          className='flex items-center gap-1 rounded-full bg-gray-100 px-3 py-2 text-sm data-[state=on]:bg-gray-900 data-[state=on]:text-white'
                        >
                          <span>{keyword.emoji}</span>
                          <span>{keyword.label}</span>
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
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
