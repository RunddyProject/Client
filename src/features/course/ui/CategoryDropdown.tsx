import { memo, useState } from 'react';

import {
  CATEGORY_LABELS,
  CourseCategory,
  type CourseCategoryType
} from '@/features/course/model/category';
import { Icon } from '@/shared/icons/icon';
import { cn } from '@/shared/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/ui/primitives/popover';

interface CategoryDropdownProps {
  value: CourseCategoryType;
  onChange: (category: CourseCategoryType) => void;
  className?: string;
}

export const CategoryDropdown = memo(function CategoryDropdown({
  value,
  onChange,
  className
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (category: CourseCategoryType) => {
    onChange(category);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn('text-sec flex shrink-0 items-center gap-1', className)}
        >
          <span className='text-contents-b16'>{CATEGORY_LABELS[value]}</span>
          <Icon
            name='drop_down'
            size={12}
            color='currentColor'
            className={cn(
              'text-line-ter transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={8}
        className='bg-w-100 mt-3 w-auto min-w-[120px] p-1'
      >
        {Object.values(CourseCategory).map((cat) => (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            className={cn(
              'text-pri text-contents-r14 flex w-full items-center rounded-lg px-3 py-2.5 text-left transition-colors',
              value === cat && 'font-bold'
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
});
