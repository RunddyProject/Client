import { Plus } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { cn } from '@/shared/lib/utils';

interface RegisterCourseFABProps {
  className?: string;
  /** 'direct' opens file picker immediately, 'sheet' navigates to upload page with method sheet */
  uploadMode?: 'direct' | 'sheet';
}

export function RegisterCourseFAB({
  className,
  uploadMode = 'direct'
}: RegisterCourseFABProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (uploadMode === 'direct') {
      fileInputRef.current?.click();
    } else {
      navigate('/course/upload');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.gpx')) {
      toast.error('GPX 파일만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    navigate('/course/upload', { state: { file } });
    e.target.value = '';
  };

  return (
    <>
      <button
        className={cn(
          'pointer-events-auto relative flex h-10 items-center gap-1 rounded-full px-3',
          'shadow-runddy',
          className
        )}
        style={{
          background: 'linear-gradient(90deg, #D5F3FF 0%, #F2FBFF 100%)'
        }}
        onClick={handleClick}
      >
        {/* Gradient border overlay (inside stroke) */}
        <span
          aria-hidden
          className='pointer-events-none absolute inset-0 rounded-full'
          style={{
            padding: '1px',
            background: 'linear-gradient(90deg, #fff 0%, #C2E8F8 100%)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor'
          }}
        />
        <Plus className='text-runddy-pressed size-5' strokeWidth={2.5} />
        <span className='text-contents-b15 text-runddy-pressed'>
          코스 등록하기
        </span>
      </button>

      {uploadMode === 'direct' && (
        <input
          ref={fileInputRef}
          type='file'
          accept='.gpx'
          onChange={handleFileChange}
          className='hidden'
          aria-label='GPX 파일 선택'
        />
      )}
    </>
  );
}
