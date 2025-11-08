import * as React from 'react';

import { cn } from '@/shared/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        'text-md placeholder:text-placeholder aria-invalid:border-destructive flex field-sizing-content min-h-48 w-full rounded-xl bg-gray-100 p-5 focus-visible:outline-none',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
