import { Link, useNavigate, useLocation } from 'react-router';

import { useAuth } from '@/contexts/AuthContext';
import logoImgUrl from '@/assets/logo.png';
import profileImgUrl from '@/assets/basic_profile.png';
import menuImgUrl from '@/assets/menu.png';
import chevronLeftImgUrl from '@/assets/chevron_left.png';
import chevronRightImgUrl from '@/assets/chevron_right.png';
import closeImgUrl from '@/assets/close.png';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';

const pageTitles: Record<string, string> = {};

const menuTitles: Record<string, string> = {};

const Header = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const isHomeHeader = isHomePage || Object.keys(menuTitles).includes(location.pathname);
  const pageTitle = location.pathname.startsWith('/course/') ? '코스 상세' : pageTitles[location.pathname] || 'Runddy';

  return (
    <header className={isHomePage ? 'absolute top-0 left-0 w-full z-50' : 'sticky top-0 z-50'}>
      <div className='px-4 h-13 flex items-center justify-between'>
        {isHomeHeader ? (
          // Home 헤더: Runddy 로고 | 프로필 | 메뉴
          <>
            <Link to='/'>
              <img src={logoImgUrl} alt='Runddy Logo' width='90' />
            </Link>

            <div className='flex items-center'>
              <Avatar className='w-12 h-12 cursor-pointer' onClick={() => isAuthenticated && navigate('/mypage')}>
                <AvatarFallback>
                  <img src={profileImgUrl} alt='Profile' width='28' height='28' />
                </AvatarFallback>
              </Avatar>

              <Sheet>
                <SheetTrigger>
                  <Button variant='ghost' size='icon' className='h-12 w-12'>
                    <img src={menuImgUrl} alt='Menu' width='24' height='24' />
                  </Button>
                </SheetTrigger>
                <SheetContent className='fixed z-[10002] bg-white w-full'>
                  <SheetHeader className='flex items-center justify-between pl-5 pr-2 h-13'>
                    <img src={logoImgUrl} width='90' />
                    <SheetClose className='p-3'>
                      <img src={closeImgUrl} alt='Close' width='24' height='24' />
                      <span className='sr-only'>Close</span>
                    </SheetClose>
                  </SheetHeader>
                  <ul className='p-1'>
                    {Object.entries(menuTitles).map(([path, title]) => (
                      <li key={path}>
                        <SheetClose asChild>
                          <Link to={path} className='p-5 flex items-center justify-between'>
                            <span>{title}</span>
                            <img src={chevronRightImgUrl} width='18' height='18' />
                          </Link>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          // Depth 헤더: 뒤로가기 | 페이지 제목 | 메뉴
          <>
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => navigate(-1)}>
              <img src={chevronLeftImgUrl} alt='Chevron Left' width='24' height='24' />
            </Button>

            <h1 className='absolute left-1/2 -translate-x-1/2 font-semibold text-base'>{pageTitle}</h1>

            <Button variant='ghost' size='icon' className='h-12 w-12'>
              <img src={menuImgUrl} alt='Menu' width='24' height='24' />
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
