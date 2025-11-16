import { Icon } from '@/shared/icons/icon';
import { Button } from '@/shared/ui/primitives/button';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  PopoverArrow
} from '@/shared/ui/primitives/popover';

import type { ReactNode } from 'react';

interface TooltipProps {
  title: ReactNode;
  body: ReactNode;
}

const Tooltip = ({ title, body }: TooltipProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='h-4 w-4'>
          <Icon
            name='tooltip'
            size={16}
            color='currentColor'
            className='text-g-90'
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side='bottom'
        align='center'
        sideOffset={4}
        className='bg-g-80 text-w-100 text-contents-r15 relative z-[10002] flex w-fit flex-col gap-1 px-5 py-4'
      >
        <PopoverArrow className='fill-g-80' width={16} height={8} />
        <div className='text-contents-r14 text-w-100 flex items-center justify-between gap-1'>
          <div>{title}</div>
          <PopoverClose>
            <Icon
              name='close'
              size={16}
              color='currentColor'
              className='text-g-30'
            />
          </PopoverClose>
        </div>
        {body}
      </PopoverContent>
    </Popover>
  );
};

export default Tooltip;
