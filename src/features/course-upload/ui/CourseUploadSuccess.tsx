import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/shared/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogPortal,
  DialogTitle
} from '@/shared/ui/primitives/dialog';

interface CourseUploadSuccessProps {
  open: boolean;
  onClose: () => void;
  onViewCourse: () => void;
}

export function CourseUploadSuccess({
  open,
  onClose,
  onViewCourse
}: CourseUploadSuccessProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogPortal>
        <DialogContent className='bg-w-100 fixed left-1/2 top-1/2 z-[10003] flex h-dvh w-full max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center p-5'>
          <div className='flex flex-1 flex-col items-center justify-center'>
            <CheckCircle2 className='text-runddy-blue mb-6 size-16' strokeWidth={1.5} />

            <DialogTitle className='text-title-b21 text-pri mb-2 text-center'>
              코스 등록을 완료했어요
            </DialogTitle>

            <DialogDescription className='text-contents-r15 text-sec text-center'>
              등록한 코스를 확인해 보세요
            </DialogDescription>
          </div>

          <DialogFooter className='w-full gap-3'>
            <Button
              variant='secondary'
              size='lg'
              className='flex-1'
              onClick={onClose}
            >
              닫기
            </Button>
            <Button
              variant='default'
              size='lg'
              className='flex-1'
              onClick={onViewCourse}
            >
              등록한 코스 확인하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
