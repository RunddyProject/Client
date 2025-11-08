import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { useAuth } from '@/app/providers/AuthContext';
import { useCourseReviewForm } from '@/features/course/hooks/useCourseReviewForm';
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
    if (formDetail) {
      setCategories(JSON.parse(JSON.stringify(formDetail)));
    }
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
      toast.error('리뷰 작성은 로그인이 필요해요');
      navigator('/login');
      return;
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!uuid) return;
    await patchReview(categories);
    // toast.success(
    //   hasMyReview ? '리뷰 수정이 완료되었어요' : '리뷰 작성이 완료되었어요'
    // );
    setOpen(false);
  };

  const Trigger = (mode: TriggerMode) => {
    switch (mode) {
      case 'firstReview':
        return (
          <div
            className='flex items-center gap-1 rounded-xl bg-gray-100 px-4 py-2.5'
            onClick={handleClick}
          >
            <span className='pl-1'>첫 코스톡 남기기</span>
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
            className='flex w-full items-center justify-between px-3'
            onClick={handleClick}
          >
            <span>수정하기</span>
            <Icon
              name='edit'
              size={16}
              color='currentColor'
              className='text-[#727787]'
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
            className='fixed inset-0 top-1/2 left-1/2 z-[10003] flex h-full w-full flex-col rounded-none bg-white p-0'
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
                  <h3 className='mb-4 text-base font-semibold'>
                    {category.label}
                  </h3>
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
                        className='flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm data-[state=on]:bg-gray-900 data-[state=on]:text-white'
                      >
                        <span>{keyword.emoji}</span>
                        <span> {keyword.label}</span>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              ))}
            </div>

            <div className='fixed right-0 bottom-0 left-0 bg-white p-5'>
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
