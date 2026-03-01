import { memo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

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
    <div className='relative'>
      <Icon
        name='search'
        size={24}
        color='currentColor'
        className='text-line-ter absolute top-1/2 left-4 -translate-y-1/2'
      />
      <Input
        placeholder='지역, 코스이름 검색'
        value={params.get('keyword') ?? keyword}
        className={cn('bg-w-100 text-m18 pl-13', className)}
        onClick={() => setOpen(true)}
        readOnly
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogContent
            fullWidth
            className='bg-w-100 z-[103] flex flex-col rounded-none pr-5 pl-2 pt-[calc(env(safe-area-inset-top)+4px)] pb-[env(safe-area-inset-bottom)]'
          >
            <div className='mb-4 flex items-center'>
              <Button
                variant='ghost'
                size='icon'
                className='h-12 w-12'
                onClick={handleClose}
              >
                <Icon name='chevron_left' size={24} />
              </Button>

              <Input
                type='search'
                inputMode='search'
                placeholder='지역, 코스이름 검색'
                value={keyword}
                className='bg-g-10 text-contents-m16 h-[42px]'
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
    </div>
  );
});

export default Search;
