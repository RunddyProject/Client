import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot='switch'
      className={cn(
        'inline-flex h-[26px] w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors',
        'bg-g-30 data-[state=checked]:bg-runddy-blue',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-runddy-blue focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot='switch-thumb'
        className={cn(
          'pointer-events-none block size-[22px] rounded-full bg-white shadow-sm',
          'transition-transform duration-200',
          'data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
