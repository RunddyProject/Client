import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { useAuth } from '@/app/providers/AuthContext';
import { useCourseReviewForm } from '@/features/course/hooks/useCourseReviewForm';
import { Icon } from '@/shared/icons/icon';
import { deepEqual } from '@/shared/lib/utils';
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
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/ui/primitives/toggle-group';

import type { DisplayFormCategory } from '@/features/course/model/types';

type TriggerMode = 'firstReview' | 'writeReview' | 'editReview';

interface CourseReviewWriteProps {
  triggerMode: TriggerMode;
}

const CourseReviewWrite = ({ triggerMode }: CourseReviewWriteProps) => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigator = useNavigate();

  const { isAuthenticated } = useAuth();
  const { formDetail, hasMyReview, patchReview } = useCourseReviewForm(uuid!);

  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<DisplayFormCategory[]>([]);

  useEffect(() => {
    if (!formDetail) return;

    setCategories((prev) => {
      if (deepEqual(prev, formDetail)) return prev;
      return JSON.parse(JSON.stringify(formDetail));
    });
  }, [formDetail]);

  const handleToggleChange = (categoryCode: string, newValues: string[]) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.categoryCode === categoryCode
          ? {
              ...cat,
              keywords: cat.keywords.map((kw) => ({
                ...kw,
                isSelected: newValues.includes(String(kw.keywordId))
              }))
            }
          : cat
      )
    );
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요해요');
      navigator('/login');
      return;
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!uuid) return;
    await patchReview(categories);
    setOpen(false);
  };

  const Trigger = (mode: TriggerMode) => {
    switch (mode) {
      case 'firstReview':
        return (
          <div
            className='bg-g-10 flex items-center gap-1 rounded-xl px-4 py-2.5'
            onClick={handleClick}
          >
            <span className='text-ter text-contents-m15 pl-1'>
              첫 리뷰 남기기
            </span>
            <Icon name='chevron_right' size={16} className='pr-1' />
          </div>
        );
      case 'writeReview':
        return (
          <div className='flex items-center gap-1' onClick={handleClick}>
            <span>리뷰 남기기</span>
            <Icon name='chevron_right' size={14} />
          </div>
        );
      case 'editReview':
        return (
          <div
            className='flex w-full items-center justify-between px-4'
            onClick={handleClick}
          >
            <span className='text-contents-r14'>수정하기</span>
            <Icon
              name='edit'
              size={16}
              color='currentColor'
              className='text-line-ter'
            />
          </div>
        );
    }
  };

  return (
    <div className='relative'>
      {Trigger(triggerMode)}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogContent
            fullWidth
            className='bg-w-100 fixed inset-0 top-1/2 left-1/2 z-[10003] flex h-full w-full flex-col rounded-none p-0'
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
              <DialogTitle className='col-start-2'>
                {hasMyReview ? '리뷰 수정하기' : '리뷰 남기기'}
              </DialogTitle>
            </DialogHeader>

            <div className='flex-1 overflow-y-auto px-5 pt-1 pb-6'>
              {categories.map((category) => (
                <div key={category.categoryCode} className='py-5 first:pt-0'>
                  <div className='text-contents-b16 mb-4'>{category.label}</div>
                  <ToggleGroup
                    type='multiple'
                    value={category.keywords
                      .filter((k) => k.isSelected)
                      .map((k) => String(k.keywordId))}
                    onValueChange={(newValues) =>
                      handleToggleChange(category.categoryCode, newValues)
                    }
                    className='flex flex-wrap gap-x-2.5 gap-y-3'
                  >
                    {category.keywords.map((keyword) => (
                      <ToggleGroupItem
                        key={keyword.keywordId}
                        value={String(keyword.keywordId)}
                        className='bg-g-10 data-[state=on]:bg-g-90 data-[state=on]:text-w-100 text-contents-m15 flex items-center gap-2 rounded-full px-3 py-2'
                      >
                        <span>{keyword.emoji}</span>
                        <span> {keyword.label}</span>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              ))}
            </div>

            <div className='bg-w-100 fixed right-0 bottom-0 left-0 p-5'>
              <Button
                size='lg'
                className='w-full'
                onClick={handleSave}
                disabled={categories.every((cat) =>
                  cat.keywords.every((kw) => !kw.isSelected)
                )}
              >
                저장
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default CourseReviewWrite;
