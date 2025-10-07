import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Link } from 'react-router';

import { Icon } from '@/components/ui/icon';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import logoImgUrl from '/logo.svg';

interface MenuProps {
  titles: Record<string, string>;
}

const Menu = ({ titles }: MenuProps) => {
  return (
    <Sheet>
      <SheetTrigger>
        <Icon name='menu' size={24} />
      </SheetTrigger>
      <SheetContent className='fixed z-[10002] w-full bg-white'>
        <SheetHeader className='flex h-13 items-center justify-between pr-2 pl-5'>
          <VisuallyHidden asChild>
            <SheetTitle>메뉴</SheetTitle>
          </VisuallyHidden>
          <img src={logoImgUrl} width='90' />
          <SheetClose className='p-3'>
            <Icon name='close' size={24} />
            <span className='sr-only'>Close</span>
          </SheetClose>
        </SheetHeader>
        <ul className='p-1'>
          {Object.entries(titles).map(([path, title]) => (
            <li key={path}>
              <SheetClose asChild>
                <Link
                  to={path}
                  className='flex items-center justify-between p-5'
                >
                  <span>{title}</span>
                  <Icon name='chevron_right' size={24} />
                </Link>
              </SheetClose>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
};

export default Menu;
