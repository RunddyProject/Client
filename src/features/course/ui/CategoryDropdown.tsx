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
          className={cn(
            'text-contents-b16 text-pri flex shrink-0 items-center gap-0.5',
            className
          )}
        >
          {CATEGORY_LABELS[value]}
          <Icon
            name='drop_down'
            size={16}
            color='currentColor'
            className={cn(
              'transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={8}
        className='bg-w-100 w-auto min-w-[120px] p-1'
      >
        {Object.values(CourseCategory).map((cat) => (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            className={cn(
              'text-contents-m15 flex w-full items-center rounded-lg px-3 py-2.5 text-left transition-colors',
              value === cat ? 'bg-g-10 text-pri' : 'text-sec hover:bg-g-10'
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
});
