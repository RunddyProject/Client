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

const isDevelopment = process.env.NODE_ENV !== 'production';

const menuTitles: Record<string, string> = {
  '/': '런디코스',
  // '/course/my': '내 코스', // TODO: v1.0 오픈 시 활성화
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
  const homePages = ['/', '/me'];
  const isHomeHeader =
    (!isCoursePage && homePages.includes(path)) || isCoursePage;

  const { config, viewMode, setViewMode } = useHeader();

  const handleBack = () => {
    const canGoBack = window.history.state && window.history.state.idx > 0;

    if (canGoBack) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

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

  // Any page with view mode tabs (course discovery, my courses, etc.)
  const hasTabs = viewMode !== undefined && setViewMode;

  return config.showHeader ? (
    <header
      className={cn(
        'top-0 z-[101] w-full',
        hasTabs || isCoursePage ? 'fixed left-0' : 'bg-w-100 sticky' // TODO: v1.0 오픈 시 isCoursePage 조건 제거
      )}
    >
      <div className='mx-auto flex h-13 max-w-xl items-center justify-between pr-2 pl-4'>
        {hasTabs ? (
          // Course Page Tab Header: centered toggle + right menu
          <>
            {/* Left spacer to balance menu button for centering */}
            <div className='w-10' />

            {/* Centered Toggle Pill */}
            <div className='bg-g-20 shadow-runddy absolute left-1/2 flex -translate-x-1/2 items-center rounded-full p-1'>
              <div className='relative flex gap-1'>
                {/* Sliding white indicator */}
                <div
                  className={cn(
                    'bg-w-100 absolute top-0 bottom-0 w-1/2 rounded-full shadow-sm transition-transform duration-200 ease-in-out',
                    viewMode === 'list' && 'translate-x-full'
                  )}
                />
                <button
                  onClick={() => setViewMode('map')}
                  className={cn(
                    'relative z-[1] rounded-full px-3.5 py-1.5 transition-colors duration-200',
                    viewMode === 'map' ? 'text-g-90' : 'text-ter'
                  )}
                >
                  <span className='text-contents-b14'>지도보기</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'relative z-[1] rounded-full px-3.5 py-1.5 transition-colors duration-200',
                    viewMode === 'list' ? 'text-g-90' : 'text-ter'
                  )}
                >
                  <span className='text-contents-b14'>목록보기</span>
                </button>
              </div>
            </div>

            {/* Right: Menu button (white circle) */}
            <div className='flex items-center'>
              {isDevelopment && <DevTokenDialog />}
              <Menu titles={menuTitles} circleButton />
            </div>
          </>
        ) : isHomeHeader ? (
          // Home Header: Runddy Logo | Profile | Menu
          <>
            <Link to='/'>
              <img
                src={new URL('/logo.svg', import.meta.url).href}
                alt='Runddy Logo'
                width='90'
              />
            </Link>

            <div className='flex items-center'>
              {isDevelopment && <DevTokenDialog />}
              <Menu titles={menuTitles} circleButton />
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
                onClick={handleBack}
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
