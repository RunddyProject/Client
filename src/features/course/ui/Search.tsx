import { useState } from 'react';
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

const Search = ({ className }: SearchProps) => {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const handleSearch = () => {
    const newParams = new URLSearchParams(params);
    newParams.set('keyword', keyword);

    navigate({ search: newParams.toString() });
    setOpen(false);
  };

  return (
    <div className='relative'>
      <Icon
        name='search'
        size={24}
        className='absolute top-1/2 left-4 -translate-y-1/2'
      />
      <Input
        placeholder='지역, 코스이름 검색'
        value={params.get('keyword') ?? keyword}
        className={cn('bg-white pl-13', className)}
        onClick={() => setOpen(true)}
        readOnly
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogContent
            fullWidth
            className='absolute top-1/2 left-1/2 z-100 flex h-full -translate-y-1/2 transform-none flex-col rounded-none bg-white py-1 pr-5 pl-2'
          >
            <div className='mb-4 flex items-center'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => setOpen(false)}
              >
                <Icon name='chevron_left' size={24} />
              </Button>

              <Input
                type='search'
                inputMode='search'
                placeholder='지역, 코스이름 검색'
                value={keyword}
                className='h-[42px] bg-gray-100'
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
};

export default Search;
