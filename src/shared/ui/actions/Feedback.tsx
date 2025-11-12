import { useState } from 'react';
import { useParams } from 'react-router';

import { usePostFeedback } from '@/features/user/hooks/usePostFeedback';
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
import { Textarea } from '@/shared/ui/primitives/textarea';

interface FeedbackProps {
  feedbackType: 'FEEDBACK' | 'COURSE';
}

const Feedback = ({ feedbackType }: FeedbackProps) => {
  const { uuid: courseUuid } = useParams<{ uuid: string }>();

  const { submitFeedback } = usePostFeedback();

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');

  const handleClick = () => {
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSave = () => {
    if (courseUuid) {
      submitFeedback({ feedbackType, courseUuid, content });
    } else {
      submitFeedback({ feedbackType, content });
    }
    setOpen(false);
  };

  return (
    <div className='relative'>
      <div
        onClick={handleClick}
        className='bg-g-20 flex items-center gap-3 rounded-xl p-4'
      >
        <Icon name='edit_blue' size={48} />
        <div className='flex-1 space-y-0.5'>
          <div className='text-sec text-contents-b16'>
            {feedbackType === 'FEEDBACK'
              ? '런디, 어떠셨나요?'
              : '잘못된 정보가 있나요?'}
          </div>
          <div className='text-sec text-contents-r14'>
            {feedbackType === 'FEEDBACK'
              ? '더 나은 서비스를 위해 의견을 남겨주세요!'
              : '수정이 필요하다면 알려주세요!'}
          </div>
        </div>
        <Icon
          name='chevron_right'
          size={16}
          color='currentColor'
          className='text-g-40'
        />
      </div>
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
                {feedbackType === 'COURSE' && '수정 '}제안
              </DialogTitle>
            </DialogHeader>

            <div className='flex-1 overflow-y-auto px-5 pt-6'>
              <div className='text-title-b23 pb-2'>
                {feedbackType === 'FEEDBACK'
                  ? '런디에게 전달하고 싶은 의견이 있다면'
                  : '수정이 필요한 사항에 대해'}
                <br />
                작성해 주세요
              </div>
              <div className='text-sec text-contents-r15 pb-6'>
                {feedbackType === 'FEEDBACK'
                  ? '작성해 주신 의견은 모두 꼼꼼히 확인할게요'
                  : '그 외 자유로운 의견도 환영해요'}
              </div>
              <Textarea
                value={content}
                onChange={handleChange}
                placeholder={
                  feedbackType === 'FEEDBACK'
                    ? '좋았던 점, 개선할 점 등 입력하기'
                    : '수정이 필요한 정보, 개선 필요한 부분 등 입력하기'
                }
              />
            </div>

            <div className='bg-w-100 fixed right-0 bottom-0 left-0 p-5'>
              <Button
                size='lg'
                className='w-full'
                onClick={handleSave}
                disabled={!content}
              >
                의견 보내기
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default Feedback;
