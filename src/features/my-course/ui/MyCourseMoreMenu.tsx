import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/shared/ui/primitives/sheet';

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='rounded-t-2xl pb-[env(safe-area-inset-bottom)]'>
        <SheetHeader>
          <SheetTitle className='sr-only'>코스 관리</SheetTitle>
        </SheetHeader>
        <div className='space-y-1 py-2'>
          <button
            onClick={onEdit}
            className='text-contents-m15 w-full px-5 py-4 text-left'
          >
            수정하기
          </button>
          <button
            onClick={onDelete}
            className='text-contents-m15 text-stateError w-full px-5 py-4 text-left'
          >
            삭제하기
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
