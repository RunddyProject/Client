import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/primitives/button';

interface RegisterCourseFABProps {
  className?: string;
}

export function RegisterCourseFAB({ className }: RegisterCourseFABProps) {
  const navigate = useNavigate();

  return (
    <Button
      className={cn(
        'shadow-runddy pointer-events-auto gap-1 rounded-full px-3',
        className
      )}
      style={{
        background: 'linear-gradient(180deg, #D5F3FF 0%, #F2FBFF 100%)'
      }}
      onClick={() => navigate('/course/upload')}
    >
      <Plus className='size-5 text-[#119BD1]' />
      <span className='text-contents-r14 text-[#119BD1]'>코스 등록하기</span>
    </Button>
  );
}
