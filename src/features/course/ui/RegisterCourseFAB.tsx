import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

import { cn } from '@/shared/lib/utils';

interface RegisterCourseFABProps {
  className?: string;
}

export function RegisterCourseFAB({ className }: RegisterCourseFABProps) {
  const navigate = useNavigate();

  return (
    <button
      className={cn(
        'pointer-events-auto relative flex h-10 items-center gap-1 rounded-full px-3',
        'shadow-runddy',
        className
      )}
      style={{
        background: 'linear-gradient(90deg, #D5F3FF 0%, #F2FBFF 100%)'
      }}
      onClick={() => navigate('/course/upload')}
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
  );
}
