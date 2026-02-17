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
        'shadow-runddy pointer-events-auto flex items-center gap-1 rounded-full border border-[#B8E6F8] bg-w-100 px-3 py-2',
        className
      )}
      onClick={() => navigate('/course/upload')}
    >
      <Plus className='size-5 text-runddy-blue' strokeWidth={2.5} />
      <span className='contents-m14 text-runddy-blue'>코스 등록하기</span>
    </button>
  );
}
