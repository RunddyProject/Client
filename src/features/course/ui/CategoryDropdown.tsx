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
  /** Show the remove (×) button on the chip. Default: false */
  showRemoveButton?: boolean;
  /** Called when the remove button is clicked */
  onRemove?: () => void;
  className?: string;
}

export const CategoryDropdown = memo(function CategoryDropdown({
  value,
  onChange,
  showRemoveButton = false,
  onRemove,
  className
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (category: CourseCategoryType) => {
    onChange(category);
    setOpen(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'bg-g-100 flex shrink-0 items-center gap-0.5 rounded-full py-1.5 pl-3',
            showRemoveButton ? 'pr-2' : 'pr-2',
            className
          )}
        >
          <span className='contents-m13 text-w-100 whitespace-nowrap'>
            {CATEGORY_LABELS[value]}
          </span>
          <Icon
            name='drop_down'
            size={16}
            color='var(--w-100)'
            className={cn('transition-transform', open && 'rotate-180')}
          />
          {showRemoveButton && (
            <span
              role='button'
              tabIndex={0}
              onClick={handleRemove}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRemove(
                    e as unknown as React.MouseEvent
                  );
                }
              }}
              className='ml-0.5 flex items-center justify-center'
            >
              <Icon
                name='close'
                size={14}
                color='var(--w-100)'
              />
            </span>
          )}
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
              'contents-m15 flex w-full items-center rounded-lg px-3 py-2.5 text-left transition-colors',
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
