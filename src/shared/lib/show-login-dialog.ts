import { router } from '@/app/routing/router';
import { showDialog } from '@/shared/model/dialog.store';

export const showLoginDialog = () =>
  showDialog({
    title: '로그인이 필요해요',
    cancelLabel: '뒤로가기',
    confirmLabel: '로그인',
    onConfirm: () => router.navigate('/login')
  });
