import { useState } from 'react';

import { usePostUserFeedback } from '@/features/user/hooks/usePostUserFeedback';
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

const UserFeedback = () => {
  const [open, setOpen] = useState(false);
  const [contents, setContents] = useState('');

  const { submitFeedback } = usePostUserFeedback();

  const handleClick = () => {
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContents(e.target.value);
  };

  const handleSave = () => {
    submitFeedback({ contents });
    setOpen(false);
  };

  return (
    <div className='relative'>
      <div
        onClick={handleClick}
        className='flex items-center gap-3 rounded-xl bg-gray-200 p-4'
      >
        <Icon name='edit_blue' size={48} />
        <div className='flex-1 space-y-0.5'>
          <div className='text-text-secondary font-bold'>런디, 어떠셨나요?</div>
          <div className='text-text-secondary text-xs'>
            더 나은 서비스를 위해 의견을 남겨주세요!
          </div>
        </div>
        <Icon
          name='chevron_right'
          size={16}
          color='currentColor'
          className='text-gray-400'
        />
      </div>
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
              <DialogTitle className='col-start-2'>제안</DialogTitle>
            </DialogHeader>

            <div className='flex-1 overflow-y-auto px-5 pt-6'>
              <h3 className='pb-2 font-bold'>
                런디에게 전달하고 싶은 의견이 있다면
                <br />
                작성해 주세요
              </h3>
              <div className='text-text-secondary pb-6 text-[15px]'>
                작성해 주신 의견은 모두 꼼꼼히 확인할게요
              </div>
              <Textarea
                value={contents}
                onChange={handleChange}
                placeholder='좋았던 점, 개선할 점 등 입력하기'
              />
            </div>

            <div className='fixed right-0 bottom-0 left-0 bg-white p-5'>
              <Button
                size='lg'
                className='w-full'
                onClick={handleSave}
                disabled={!contents}
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

export default UserFeedback;
