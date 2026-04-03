import { useDialogStore } from '@/shared/model/dialog.store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/shared/ui/primitives/alert-dialog';

export function GlobalDialog() {
  const { config, hide } = useDialogStore();

  return (
    <AlertDialog open={!!config} onOpenChange={hide}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config?.title}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{config?.cancelLabel ?? '취소'}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              config?.onConfirm?.();
              hide();
            }}
          >
            {config?.confirmLabel ?? '확인'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
