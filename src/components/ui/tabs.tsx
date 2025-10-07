import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot='tabs'
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot='tabs-list'
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-13 w-fit items-center justify-center',
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot='tabs-trigger'
      className={cn(
        className,
        'relative inline-flex flex-1 items-center justify-center rounded-none border-0 bg-transparent px-3 py-3',
        'text-muted-foreground text-base font-semibold',
        'data-[state=active]:border-b-2 data-[state=active]:border-b-black',
        "after:bg-foreground after:pointer-events-none after:absolute after:bottom-0 after:left-1/2 after:z-10 after:h-[2px] after:w-12 after:-translate-x-1/2 after:rounded-full after:opacity-0 after:content-[''] data-[state=active]:after:opacity-100",
        'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none',
        'transition-[color,opacity] duration-200'
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot='tabs-content'
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
