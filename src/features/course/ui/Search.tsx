import { memo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import {
  CATEGORY_LABELS,
  CourseCategory,
  DEFAULT_CATEGORY,
  isMarathonCategory,
  type CourseCategoryType
} from '@/features/course/model/category';
import { Icon } from '@/shared/icons/icon';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogPortal
} from '@/shared/ui/primitives/dialog';
import { Input } from '@/shared/ui/primitives/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/ui/primitives/popover';

interface SearchProps {
  /** Show the remove (×) button on the category chip. Default: false */
  showCategoryRemoveButton?: boolean;
  className?: string;
}

const Search = memo(function Search({
  showCategoryRemoveButton = false,
  className
}: SearchProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState(params.get('keyword') ?? '');
  const [chipOpen, setChipOpen] = useState(false);

  const currentCategory =
    (params.get('category') as CourseCategoryType) ?? DEFAULT_CATEGORY;

  const handleCategoryChange = (category: CourseCategoryType) => {
    const newParams = new URLSearchParams(params);

    if (category !== DEFAULT_CATEGORY) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    navigate({ search: newParams.toString() });
    setChipOpen(false);
  };

  const handleCategoryRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCategoryChange(DEFAULT_CATEGORY);
  };

  const handleSearch = () => {
    const newParams = new URLSearchParams(params);
    newParams.set('keyword', keyword);

    navigate({ search: newParams.toString() });
    setOpen(false);
  };

  const handleClose = () => {
    setKeyword(params.get('keyword') ?? '');
    setOpen(false);
  };

  return (
    <>
      {/* Search bar: [Black Chip Dropdown | Divider | Search Input] */}
      <div
        className={cn(
          'bg-w-100 flex h-12 items-center rounded-xl',
          className
        )}
      >
        {/* Category Chip Dropdown (black pill) */}
        <div className='shrink-0 pl-2.5'>
          <Popover open={chipOpen} onOpenChange={setChipOpen}>
            <PopoverTrigger asChild>
              <button
                className='bg-g-100 flex items-center gap-0.5 rounded-full py-1.5 pl-3 pr-2'
              >
                <span className='contents-m13 text-w-100 whitespace-nowrap'>
                  {CATEGORY_LABELS[currentCategory]}
                </span>
                <Icon
                  name='drop_down'
                  size={16}
                  color='var(--w-100)'
                  className={cn(
                    'transition-transform',
                    chipOpen && 'rotate-180'
                  )}
                />
                {showCategoryRemoveButton && (
                  <span
                    role='button'
                    tabIndex={0}
                    onClick={handleCategoryRemove}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCategoryRemove(
                          e as unknown as React.MouseEvent
                        );
                      }
                    }}
                    className='ml-0.5 flex items-center justify-center'
                  >
                    <Icon name='close' size={14} color='var(--w-100)' />
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
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    'contents-m15 flex w-full items-center rounded-lg px-3 py-2.5 text-left transition-colors',
                    currentCategory === cat
                      ? 'bg-g-10 text-pri'
                      : 'text-sec hover:bg-g-10'
                  )}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* Divider */}
        <div className='bg-g-20 mx-2.5 h-5 w-px shrink-0' />

        {/* Search Input (right section) */}
        <button
          className='flex min-w-0 flex-1 items-center gap-2 pr-4'
          onClick={() => setOpen(true)}
        >
          <Icon
            name='search'
            size={20}
            color='currentColor'
            className='text-g-40 shrink-0'
          />
          <span
            className={cn(
              'contents-m15 truncate text-left',
              params.get('keyword') ? 'text-pri' : 'text-placeholder'
            )}
          >
            {params.get('keyword') || '지역, 코스이름 검색'}
          </span>
        </button>
      </div>

      {/* Search Dialog (fullscreen) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogContent
            fullWidth
            className='bg-w-100 absolute top-1/2 left-1/2 z-[103] flex h-full -translate-y-1/2 transform-none flex-col rounded-none py-1 pr-5 pl-2'
          >
            <div className='mb-4 flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                className='h-12 w-12 shrink-0'
                onClick={handleClose}
              >
                <Icon name='chevron_left' size={24} />
              </Button>

              {/* Category Chip */}
              <button
                onClick={handleCategoryRemove}
                className='bg-g-10 contents-m14 text-pri flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5'
              >
                {CATEGORY_LABELS[currentCategory]}
                {isMarathonCategory(currentCategory) && (
                  <Icon
                    name='close'
                    size={14}
                    color='currentColor'
                    className='text-g-50'
                  />
                )}
              </button>

              <Input
                type='search'
                inputMode='search'
                placeholder='지역, 코스이름 검색'
                value={keyword}
                className='bg-g-10 contents-m16 h-[42px]'
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                autoFocus
              />
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
});

export default Search;
