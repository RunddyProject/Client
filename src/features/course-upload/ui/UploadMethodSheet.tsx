import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useRef } from 'react';
import { toast } from 'sonner';

import { UPLOAD_METHOD_LABELS } from '../model/constants';

import type { UploadMethod } from '../model/types';

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
      onOpenChange(false);
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
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/50' />
        <DialogPrimitive.Content
          className='bg-w-100 fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl p-5 pt-3 outline-none'
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Handle bar */}
          <div className='mb-4 flex justify-center'>
            <div className='bg-g-30 h-1 w-10 rounded-full' />
          </div>

          <DialogPrimitive.Title className='text-title-b18 text-pri mb-4 text-left'>
            GPX 업로드 방식을 선택해 주세요
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className='sr-only'>
            직접 업로드하거나 Strava에서 가져올 수 있습니다
          </DialogPrimitive.Description>

          <div>
            <button
              type='button'
              onClick={handleDirectUpload}
              className='text-contents-r15 text-pri w-full py-3 text-left transition-colors'
            >
              {UPLOAD_METHOD_LABELS.direct}
            </button>

            <div className='bg-g-20 h-px' />

            <button
              type='button'
              onClick={handleStravaImport}
              className='text-contents-r15 text-pri w-full py-3 text-left transition-colors'
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
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
