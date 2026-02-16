import { MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Icon } from '@/shared/icons/icon';
import { Button } from '@/shared/ui/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/shared/ui/primitives/dropdown-menu';

interface CourseActionMenuProps {
  uuid: string;
  onDelete: () => void;
}

export function CourseActionMenu({ uuid, onDelete }: CourseActionMenuProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          aria-label='코스 관리 메뉴'
        >
          <MoreVertical className='size-5' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => navigate(`/my-courses/${uuid}/edit`)}>
          <Icon name='edit' size={16} />
          수정하기
        </DropdownMenuItem>
        <DropdownMenuItem variant='destructive' onClick={onDelete}>
          <Icon name='trash' size={16} />
          삭제하기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
