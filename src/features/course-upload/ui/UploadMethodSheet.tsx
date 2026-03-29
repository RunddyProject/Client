import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { UPLOAD_METHOD_LABELS } from '@/features/course-upload/model/constants';
import { StravaApi } from '@/features/strava/api/strava.api';
import { ApiError } from '@/shared/lib/http';
import { LoginRequiredDialog } from '@/shared/ui/composites/LoginRequiredDialog';

import type { UploadMethod } from '@/features/course-upload/model/types';

interface UploadMethodSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMethod: (method: UploadMethod, file?: File) => void;
  /** Render a dark overlay behind the sheet. Default: true. */
  dim?: boolean;
}

export function UploadMethodSheet({
  open,
  onOpenChange,
  onSelectMethod,
  dim = true
}: UploadMethodSheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isStravaLoading, setIsStravaLoading] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);

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

  const handleStravaImport = async () => {
    if (isStravaLoading) return;
    setIsStravaLoading(true);

    try {
      const { connected } = await StravaApi.getStatus();

      if (connected) {
        // Already connected — navigate to activity list.
        // Do NOT call onOpenChange(false) here: the parent's onOpenChange handler
        // calls navigate(-1), which conflicts with navigate('/strava/activities')
        // and corrupts the browser history stack.
        // The sheet unmounts naturally when the page transitions.
        navigate('/strava/activities');
        return;
      }

      // Not connected — start OAuth flow (redirects away from app)
      const { authUrl } = await StravaApi.getConnectUrl();
      window.location.href = authUrl;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setLoginRequired(true);
        return;
      }
      toast.error('Strava 연결에 실패했어요 다시 시도해주세요');
    } finally {
      setIsStravaLoading(false);
    }
  };

  return (
    <>
    <LoginRequiredDialog
      open={loginRequired}
      onOpenChange={setLoginRequired}
    />
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Full-viewport overlay */}
        {dim && (
          <DialogPrimitive.Overlay className='data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed inset-0 z-[300] mx-auto max-w-xl bg-black/50 duration-300' />
        )}

        {/* Bottom sheet: fixed to viewport bottom, centered within max-w-xl */}
        <DialogPrimitive.Content
          className='data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-full fixed inset-x-0 bottom-0 z-[310] mx-auto max-w-xl px-5 pb-8 duration-300 ease-out outline-none data-[state=closed]:ease-in'
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className='bg-w-100 w-full rounded-3xl px-5 py-2'>
            {/* Handle bar */}
            <div className='flex justify-center pt-3 pb-2'>
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
                disabled={isStravaLoading}
                className='text-contents-r15 text-pri w-full py-5 text-left transition-colors disabled:opacity-50'
              >
                {isStravaLoading
                  ? '연결 확인 중...'
                  : UPLOAD_METHOD_LABELS.strava}
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
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
    </>
  );
}
