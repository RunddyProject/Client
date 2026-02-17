import { memo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import {
  CATEGORY_LABELS,
  DEFAULT_CATEGORY,
  isMarathonCategory,
  type CourseCategoryType
} from '@/features/course/model/category';
import { CategoryDropdown } from '@/features/course/ui/CategoryDropdown';
import { Icon } from '@/shared/icons/icon';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogPortal
} from '@/shared/ui/primitives/dialog';
import { Input } from '@/shared/ui/primitives/input';

interface SearchProps {
  className?: string;
}

const Search = memo(function Search({ className }: SearchProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState(params.get('keyword') ?? '');

  const currentCategory =
    (params.get('category') as CourseCategoryType) ?? DEFAULT_CATEGORY;

  const handleCategoryChange = (category: CourseCategoryType) => {
    const newParams = new URLSearchParams();
    const kw = params.get('keyword');
    if (kw) newParams.set('keyword', kw);

    if (category !== DEFAULT_CATEGORY) {
      newParams.set('category', category);
    }
    navigate({ search: newParams.toString() });
  };

  const handleCategoryChipRemove = () => {
    if (currentCategory !== DEFAULT_CATEGORY) {
      handleCategoryChange(DEFAULT_CATEGORY);
    }
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
      {/* Connected search bar: [Dropdown | Search Input] */}
      <div
        className={cn(
          'bg-w-100 flex h-12 items-center rounded-xl',
          className
        )}
      >
        {/* Category Dropdown (left section) */}
        <CategoryDropdown
          value={currentCategory}
          onChange={handleCategoryChange}
          className='shrink-0 pl-4 pr-3'
        />

        {/* Divider */}
        <div className='bg-g-20 h-5 w-px shrink-0' />

        {/* Search Input (right section) */}
        <button
          className='flex min-w-0 flex-1 items-center gap-2 pl-3 pr-4'
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
                onClick={handleCategoryChipRemove}
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
