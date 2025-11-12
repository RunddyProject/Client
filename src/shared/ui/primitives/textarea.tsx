import * as React from 'react';

import { cn } from '@/shared/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        'placeholder:text-placeholder text-contents-r16 aria-invalid:border-destructive bg-g-10 flex field-sizing-content min-h-48 w-full rounded-xl p-5 focus-visible:outline-none',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
