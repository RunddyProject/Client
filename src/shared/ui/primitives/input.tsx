import * as React from 'react';

import { cn } from '@/shared/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'placeholder:text-ter text-g-100 text-contents-r16 selection:bg-primary bg-g-10 file:text-contents-r15 md:text-contents-r15 flex h-14 w-full min-w-0 rounded-xl p-4 transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'hover:bg-g-20 active:bg-g-20 focus-visible:bg-g-20 transition-colors',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  );
}

export { Input };
