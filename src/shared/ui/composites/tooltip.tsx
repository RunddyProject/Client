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
        <Button variant='icon' className='h-4 w-4'>
          <Icon
            name='tooltip'
            size={16}
            color='currentColor'
            className='text-gray-900'
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side='bottom'
        align='center'
        sideOffset={4}
        className='relative z-[10002] flex w-fit flex-col gap-1 bg-gray-800 px-5 py-4 text-sm text-white'
      >
        <PopoverArrow className='fill-gray-800' width={16} height={8} />
        <div className='flex items-center justify-between gap-1'>
          <div>{title}</div>
          <PopoverClose>
            <Icon
              name='close'
              size={16}
              color='currentColor'
              className='text-gray-300'
            />
          </PopoverClose>
        </div>
        {body}
      </PopoverContent>
    </Popover>
  );
};

export default Tooltip;
