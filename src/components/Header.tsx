import { Key } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';

import profileImgUrl from '@/assets/basic_profile.png';
import Menu from '@/components/Menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import logoImgUrl from '/logo.svg';

const isDevelopment = process.env.NODE_ENV !== 'production';

const pageTitles: Record<string, string> = {
  '/me/edit': '프로필 수정',
};

const menuTitles: Record<string, string> = {
  '/me': '마이페이지'
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
  const pageTitle = path.startsWith('/course/')
    ? '코스 상세'
    : pageTitles[path] || 'Runddy';

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
    <header
      className={
        isHomePage ? 'absolute top-0 left-0 z-50 w-full' : 'sticky top-0 z-50'
      }
    >
      <div className='flex h-13 items-center justify-between px-4'>
        {isHomeHeader ? (
          // Home 헤더: Runddy 로고 | 프로필 | 메뉴
          <>
            <Link to='/'>
              <img src={logoImgUrl} alt='Runddy Logo' width='90' />
            </Link>

            <div className='flex items-center'>
              {/* Dev Token Button (only in development) */}
              {isDevelopment && (
                <Dialog
                  open={isDevDialogOpen}
                  onOpenChange={setIsDevDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-12 w-12'>
                      <Key className='h-4 w-4' />
                    </Button>
                  </DialogTrigger>
                  <DialogPortal>
                    <DialogOverlay className='fixed inset-0 z-[10000]' />
                    <DialogContent className='fixed top-1/2 left-1/2 z-[10001] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl'>
                      <DialogHeader>
                        <DialogTitle>개발용 AccessToken 설정</DialogTitle>
                        <DialogDescription>
                          Swagger에서 받은 accessToken을 입력하세요
                        </DialogDescription>
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
                        <Button
                          onClick={handleDevTokenSubmit}
                          className='w-full'
                        >
                          토큰 설정
                        </Button>
                      </div>
                    </DialogContent>
                  </DialogPortal>
                </Dialog>
              )}

              <Avatar
                className='h-12 w-12 cursor-pointer'
                onClick={() => isAuthenticated && navigate('/me')}
              >
                <AvatarFallback>
                  <img
                    src={profileImgUrl}
                    alt='Profile'
                    width='28'
                    height='28'
                  />
                </AvatarFallback>
              </Avatar>

              <Menu titles={menuTitles} />
            </div>
          </>
        ) : (
          // Depth 헤더: 뒤로가기 | 페이지 제목 | 메뉴
          <>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => navigate(-1)}
            >
              <Icon name='chevron_left' size={24} />
            </Button>

            <h1 className='absolute left-1/2 -translate-x-1/2 text-base font-semibold'>
              {pageTitle}
            </h1>

            <Menu titles={menuTitles} />
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
