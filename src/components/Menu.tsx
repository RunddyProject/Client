import { Link } from 'react-router';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Icon } from '@/components/ui/icon';
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
      <SheetContent className='fixed z-[10002] bg-white w-full'>
        <SheetHeader className='flex items-center justify-between pl-5 pr-2 h-13'>
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
                <Link to={path} className='p-5 flex items-center justify-between'>
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
