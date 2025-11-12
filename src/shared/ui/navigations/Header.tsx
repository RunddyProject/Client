import { Key } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';

import { useAuth } from '@/app/providers/AuthContext';
import { useHeader } from '@/app/providers/HeaderContext';
import { authService } from '@/features/user/api/auth';
import { Icon } from '@/shared/icons/icon';
import { cn } from '@/shared/lib/utils';
import Menu from '@/shared/ui/navigations/Menu';
import { Button } from '@/shared/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
} from '@/shared/ui/primitives/dialog';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import logoImgUrl from '/logo.svg';

const isDevelopment = process.env.NODE_ENV !== 'production';

const menuTitles: Record<string, string> = {
  '/': '런디코스',
  '/me': '마이페이지'
};

const normalizePath = (p: string) => p.replace(/\/+$/, '') || '/';

const Header = () => {
  const { refreshAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [devToken, setDevToken] = useState('');
  const [isDevDialogOpen, setIsDevDialogOpen] = useState(false);

  const path = normalizePath(location.pathname);
  const isCoursePage = path === '/' || path === '/course';
  const isHomeHeader = isCoursePage || Object.keys(menuTitles).includes(path);

  const { config } = useHeader();

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
    } catch {
      toast('오류: 토큰 설정에 실패했습니다');
    }
  };

  // Dev Token Button (only in development)
  const DevTokenDialog = () => {
    return (
      <Dialog open={isDevDialogOpen} onOpenChange={setIsDevDialogOpen}>
        <DialogTrigger asChild>
          <Button variant='ghost' size='icon' className='h-12 w-12'>
            <Key className='h-4 w-4' />
          </Button>
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay className='fixed inset-0 z-[10000]' />
          <DialogContent className='bg-w-100 fixed top-1/2 left-1/2 z-[10001] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 shadow-xl'>
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
              <Button onClick={handleDevTokenSubmit} className='w-full'>
                토큰 설정
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  };

  return config.showHeader ? (
    <header
      className={cn(
        'top-0 z-50 w-full',
        isCoursePage ? 'absolute left-0' : 'bg-w-100 sticky'
      )}
    >
      <div className='flex h-13 items-center justify-between pr-2 pl-4'>
        {isHomeHeader ? (
          // Home Header: Runddy Logo | Profile | Menu
          <>
            <Link to='/'>
              <img src={logoImgUrl} alt='Runddy Logo' width='90' />
            </Link>

            <div className='flex items-center'>
              {isDevelopment && <DevTokenDialog />}
              <Menu titles={menuTitles} />
            </div>
          </>
        ) : (
          <>
            {/* Depth Header */}
            {config.leftButton !== undefined ? (
              config.leftButton
            ) : config.showBackButton !== false ? (
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => navigate(-1)}
              >
                <Icon name='chevron_left' size={24} />
              </Button>
            ) : (
              <div className='w-8' /> /* spacer */
            )}

            {/* Title - Page */}
            {config.title && (
              <div className='text-sec text-r18 absolute left-1/2 -translate-x-1/2'>
                {config.title}
              </div>
            )}

            {/* Right Button */}
            {config.rightButton !== undefined ? (
              config.rightButton
            ) : (
              <div className='flex items-center gap-2'>
                {isDevelopment && <DevTokenDialog />}
                {config.showMenu !== false && <Menu titles={menuTitles} />}
              </div>
            )}
          </>
        )}
      </div>
    </header>
  ) : null;
};

export default Header;
