import { useNavigate } from 'react-router';

import { Icon } from '@/shared/icons/icon';
import { Button } from '@/shared/ui/primitives/button';

export function MyCourseEmptyState() {
  const navigate = useNavigate();

  return (
    <div className='flex h-dvh flex-col items-center justify-center gap-6'>
      <Icon name='empty_graphic' size={100} />
      <p className='text-contents-r15 text-placeholder'>등록한 코스가 없어요</p>
      <Button variant='default' onClick={() => navigate('/course/upload')}>
        코스 등록하러 가기
      </Button>
    </div>
  );
}
