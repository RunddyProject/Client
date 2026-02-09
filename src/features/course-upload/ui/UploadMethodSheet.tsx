import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useRef } from 'react';
import { toast } from 'sonner';

import { UPLOAD_METHOD_LABELS } from '@/features/course-upload/model/constants';

import type { UploadMethod } from '@/features/course-upload/model/types';

interface UploadMethodSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMethod: (method: UploadMethod, file?: File) => void;
}

export function UploadMethodSheet({
  open,
  onOpenChange,
  onSelectMethod
}: UploadMethodSheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDirectUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectMethod('direct', file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleStravaImport = () => {
    // TODO: Implement Strava OAuth flow
    toast.error('Strava 연동은 현재 준비 중입니다.');
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Container constrained to max-w-xl */}
        <div className='fixed inset-0 z-50 mx-auto flex max-w-xl items-end justify-center'>
          {/* Overlay - only covers the max-w-xl area */}
          <DialogPrimitive.Overlay className='absolute inset-0 bg-black/50' />

          {/* Content - bottom sheet with margins */}
          <DialogPrimitive.Content
            className='bg-w-100 relative z-10 mx-5 mb-8 w-full rounded-3xl px-5 py-2 outline-none'
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Handle bar */}
            <div className='flex justify-center pb-2'>
              <div className='bg-g-30 h-1 w-10 rounded-full' />
            </div>

            <DialogPrimitive.Title className='text-title-b18 text-pri my-4 text-left'>
              GPX 업로드 방식을 선택해 주세요
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className='sr-only'>
              직접 업로드하거나 Strava에서 가져올 수 있습니다
            </DialogPrimitive.Description>

            <div>
              <button
                type='button'
                onClick={handleDirectUpload}
                className='text-contents-r15 text-pri w-full py-5 text-left transition-colors'
              >
                {UPLOAD_METHOD_LABELS.direct}
              </button>

              <div className='bg-g-20 h-px' />

              <button
                type='button'
                onClick={handleStravaImport}
                className='text-contents-r15 text-pri w-full py-5 text-left transition-colors'
              >
                {UPLOAD_METHOD_LABELS.strava}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type='file'
              accept='.gpx'
              onChange={handleFileChange}
              className='hidden'
              aria-label='GPX 파일 선택'
            />
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
