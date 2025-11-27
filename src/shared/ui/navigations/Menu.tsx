import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Link } from 'react-router';

import { Icon } from '@/shared/icons/icon';
import Feedback from '@/shared/ui/actions/Feedback';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/shared/ui/primitives/sheet';
import logoImgUrl from '/logo.svg';

interface MenuProps {
  titles: Record<string, string>;
}

const Menu = ({ titles }: MenuProps) => {
  return (
    <Sheet>
      <SheetTrigger className='p-3'>
        <Icon name='menu' size={24} />
      </SheetTrigger>
      <SheetContent className='bg-w-100 fixed z-[10002] w-full'>
        <SheetHeader className='flex h-13 items-center justify-between pr-2 pl-5'>
          <VisuallyHidden asChild>
            <SheetTitle>메뉴</SheetTitle>
          </VisuallyHidden>
          <img src={logoImgUrl} width='90' />
          <SheetClose className='p-3'>
            <Icon
              name='close'
              size={24}
              color='currentColor'
              className='text-line-ter'
            />
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
                  <span className='text-m18 text-g-90'>{title}</span>
                  <Icon
                    name='chevron_right'
                    size={18}
                    color='currentColor'
                    className='text-g-30'
                  />
                </Link>
              </SheetClose>
            </li>
          ))}
        </ul>
        <div className='fixed bottom-8 w-full space-y-7 px-5'>
          <Feedback feedbackType='FEEDBACK' />
          <div className='text-placeholder text-caption-r11 text-center'>
            © 2025. Runddy All rights reserved.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Menu;
