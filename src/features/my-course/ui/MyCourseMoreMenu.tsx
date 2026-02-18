import * as DialogPrimitive from '@radix-ui/react-dialog';

interface MyCourseMoreMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MyCourseMoreMenu({
  open,
  onOpenChange,
  onEdit,
  onDelete
}: MyCourseMoreMenuProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Container constrained to max-w-xl */}
        <div className='fixed inset-0 z-50 mx-auto flex max-w-xl items-end justify-center'>
          {/* Overlay */}
          <DialogPrimitive.Overlay className='absolute inset-0 bg-black/50' />

          {/* Content - floating bottom sheet */}
          <DialogPrimitive.Content
            className='bg-w-100 relative z-10 mx-5 mb-8 w-full rounded-3xl px-5 py-2 outline-none'
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Handle bar */}
            <div className='flex justify-center pb-2'>
              <div className='bg-g-30 h-1 w-10 rounded-full' />
            </div>

            <DialogPrimitive.Title className='sr-only'>
              코스 관리
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className='sr-only'>
              코스를 수정하거나 삭제할 수 있습니다
            </DialogPrimitive.Description>

            <div>
              <button
                type='button'
                onClick={onEdit}
                className='text-contents-r15 text-pri w-full py-5 text-left transition-colors'
              >
                수정하기
              </button>

              <div className='bg-g-20 h-px' />

              <button
                type='button'
                onClick={onDelete}
                className='text-contents-r15 text-stateError w-full py-5 text-left transition-colors'
              >
                삭제하기
              </button>
            </div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
