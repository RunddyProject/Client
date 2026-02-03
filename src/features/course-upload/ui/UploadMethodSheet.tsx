import { useRef } from 'react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/shared/ui/primitives/sheet';

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='rounded-t-3xl px-5 pb-10 pt-6'>
        <SheetHeader className='mb-6'>
          <SheetTitle className='text-title-b18 text-pri text-left'>
            GPX 업로드 방식을 선택해 주세요
          </SheetTitle>
          <SheetDescription className='sr-only'>
            직접 업로드하거나 Strava에서 가져올 수 있습니다
          </SheetDescription>
        </SheetHeader>

        <div className='space-y-3'>
          <button
            type='button'
            onClick={handleDirectUpload}
            className='text-contents-m16 text-pri hover:bg-g-10 active:bg-g-20 flex w-full items-center justify-between rounded-xl border border-transparent bg-white px-4 py-4 text-left transition-colors'
          >
            <span>{UPLOAD_METHOD_LABELS.direct}</span>
          </button>

          <div className='bg-g-30 h-px' />

          <button
            type='button'
            onClick={handleStravaImport}
            className='text-contents-m16 text-pri hover:bg-g-10 active:bg-g-20 flex w-full items-center justify-between rounded-xl border border-transparent bg-white px-4 py-4 text-left transition-colors'
          >
            <span>{UPLOAD_METHOD_LABELS.strava}</span>
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
      </SheetContent>
    </Sheet>
  );
}
