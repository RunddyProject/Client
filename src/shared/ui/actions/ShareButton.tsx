import { useCallback } from 'react';
import { useLocation } from 'react-router';
import { toast } from 'sonner';

import { Icon } from '@/shared/icons/icon';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/primitives/button';

type ShareButtonProps = {
  /** OS 공유 시 사용할 제목 (기본: document.title) */
  title?: string;
  /** OS 공유 시 사용할 설명 텍스트 (선택) */
  text?: string;
  /** 공유할 절대 URL (미지정 시 현재 페이지) */
  url?: string;
  /** 버튼 프롭스 전달용 */
  className?: string;
  size?: 'icon' | 'default' | 'sm' | 'lg';
  variant?: React.ComponentProps<typeof Button>['variant'];
};

/**
 * OS 공유(Web Share API) 우선, 미지원/실패 시 링크 복사로 폴백.
 */
export function ShareButton({
  title,
  text,
  url,
  className,
  size = 'icon',
  variant = 'ghost'
}: ShareButtonProps) {
  const location = useLocation();

  const onClick = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return;

      const absoluteUrl =
        url ??
        new URL(
          location.pathname + location.search + location.hash,
          window.location.origin
        ).toString();

      const shareData: ShareData = {
        title: title ?? (typeof document !== 'undefined' ? document.title : ''),
        text,
        url: absoluteUrl
      };

      const canUseWebShare =
        typeof navigator !== 'undefined' &&
        typeof (navigator as any).share === 'function' &&
        // iOS Safari 등에서는 canShare가 undefined일 수 있으니 있으면 통과 체크
        (!('canShare' in navigator) ||
          (navigator as any).canShare?.(shareData) === true);

      if (canUseWebShare) {
        await (navigator as any).share(shareData);
        // UX상 조용히 끝내는 게 일반적이지만 피드백 원하면 주석 해제
        // toast('공유를 완료했어요');
        return;
      }

      // 폴백: 링크 복사
      await navigator.clipboard.writeText(absoluteUrl);
      toast('링크를 클립보드에 복사했어요');
    } catch (err: any) {
      // 사용자가 공유 시트를 취소한 경우 등은 조용히 무시
      if (err && err.name === 'AbortError') return;

      // callback: 선택 영역 없이 prompt 복사 유도(클립보드 권한 실패 대비)
      try {
        if (typeof window !== 'undefined') {
          const absoluteUrl =
            url ??
            new URL(
              location.pathname + location.search + location.hash,
              window.location.origin
            ).toString();
          window.prompt('아래 링크를 복사하세요', absoluteUrl);
        }
      } finally {
        toast('공유에 실패했어요. 링크를 수동으로 복사해주세요.');
      }
    }
  }, [location.hash, location.pathname, location.search, title, text, url]);

  return (
    <Button
      type='button'
      aria-label='페이지 공유'
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn('p-4', className)}
    >
      <Icon name='export' size={24} />
    </Button>
  );
}
