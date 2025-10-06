import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Key } from 'lucide-react';
import { toast } from 'sonner';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import logoImgUrl from '@/assets/logo.png';
import profileImgUrl from '@/assets/basic_profile.png';
import menuImgUrl from '@/assets/menu.png';
import chevronLeftImgUrl from '@/assets/chevron_left.png';
import chevronRightImgUrl from '@/assets/chevron_right.png';
import closeImgUrl from '@/assets/close.png';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const isDevelopment = process.env.NODE_ENV !== 'production';

const pageTitles: Record<string, string> = {
  '/me/edit': '프로필 수정',
};

const menuTitles: Record<string, string> = {
  '/me': '마이페이지',
};

const normalizePath = (p: string) => p.replace(/\/+$/, '') || '/';

const Header = () => {
  const { isAuthenticated, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [devToken, setDevToken] = useState('');
  const [isDevDialogOpen, setIsDevDialogOpen] = useState(false);

  const path = normalizePath(location.pathname);
  const isHomePage = path === '/';
  const isHomeHeader = isHomePage || Object.keys(menuTitles).includes(path);
  const pageTitle = path.startsWith('/course/') ? '코스 상세' : pageTitles[path] || 'Runddy';

  const handleDevTokenSubmit = async () => {
    if (!devToken.trim()) {
      toast('오류: 토큰을 입력해주세요');
      return;
    }

    try {
      authService.setAccessTokenManually(devToken.trim());
      await refreshAuth();
      setIsDevDialogOpen(false);
      setDevToken('');
      toast('성공: 개발용 토큰이 설정되었습니다');
    } catch (error) {
      toast('오류: 토큰 설정에 실패했습니다');
    }
  };

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
              {/* Dev Token Button (only in development) */}
              {isDevelopment && (
                <Dialog open={isDevDialogOpen} onOpenChange={setIsDevDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-12 w-12'>
                      <Key className='w-4 h-4' />
                    </Button>
                  </DialogTrigger>
                  <DialogPortal>
                    <DialogOverlay className='fixed inset-0 z-[10000]' />
                    <DialogContent className='fixed left-1/2 top-1/2 z-[10001] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl'>
                      <DialogHeader>
                        <DialogTitle>개발용 AccessToken 설정</DialogTitle>
                        <DialogDescription>Swagger에서 받은 accessToken을 입력하세요</DialogDescription>
                      </DialogHeader>
                      <div className='space-y-4 py-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='token'>AccessToken</Label>
                          <Input
                            id='token'
                            placeholder='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                            value={devToken}
                            onChange={(e) => setDevToken(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleDevTokenSubmit();
                              }
                            }}
                          />
                        </div>
                        <Button onClick={handleDevTokenSubmit} className='w-full'>
                          토큰 설정
                        </Button>
                      </div>
                    </DialogContent>
                  </DialogPortal>
                </Dialog>
              )}

              <Avatar className='w-12 h-12 cursor-pointer' onClick={() => isAuthenticated && navigate('/me')}>
                <AvatarFallback>
                  <img src={profileImgUrl} alt='Profile' width='28' height='28' />
                </AvatarFallback>
              </Avatar>

              <Sheet>
                <SheetTrigger>
                  <img src={menuImgUrl} alt='Menu' width='24' height='24' />
                </SheetTrigger>
                <SheetContent className='fixed z-[10002] bg-white w-full'>
                  <SheetHeader className='flex items-center justify-between pl-5 pr-2 h-13'>
                    <VisuallyHidden asChild>
                      <SheetTitle>메뉴</SheetTitle>
                    </VisuallyHidden>
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
