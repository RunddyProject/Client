import { useNavigate } from 'react-router';

import { useLoginDialogStore } from '@/shared/model/login-dialog.store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/shared/ui/primitives/alert-dialog';

export function LoginRequiredDialog() {
  const navigate = useNavigate();
  const { open, hide } = useLoginDialogStore();

  return (
    <AlertDialog open={open} onOpenChange={hide}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>로그인이 필요해요</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>뒤로가기</AlertDialogCancel>
          <AlertDialogAction onClick={() => navigate('/login')}>
            로그인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
