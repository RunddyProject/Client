import { afterEach, describe, expect, it, vi } from 'vitest';

import { useDialogStore } from '@/shared/model/dialog.store';

// vi.mock 팩토리 안에서 외부 변수 참조 불가(호이스팅) → 모킹 후 import로 참조
vi.mock('@/app/routing/router', () => ({
  router: { navigate: vi.fn() }
}));

import { router } from '@/app/routing/router';
import { showLoginDialog } from '../show-login-dialog';

afterEach(() => {
  useDialogStore.getState().hide();
  vi.clearAllMocks();
});

describe('showLoginDialog', () => {
  it('title이 "로그인이 필요해요"로 설정됨', () => {
    showLoginDialog();
    expect(useDialogStore.getState().config?.title).toBe('로그인이 필요해요');
  });

  it('cancelLabel이 "뒤로가기"로 설정됨', () => {
    showLoginDialog();
    expect(useDialogStore.getState().config?.cancelLabel).toBe('뒤로가기');
  });

  it('confirmLabel이 "로그인"으로 설정됨', () => {
    showLoginDialog();
    expect(useDialogStore.getState().config?.confirmLabel).toBe('로그인');
  });

  it('onConfirm 호출 시 router.navigate("/login") 실행', () => {
    showLoginDialog();
    useDialogStore.getState().config?.onConfirm?.();
    expect(vi.mocked(router.navigate)).toHaveBeenCalledWith('/login');
  });
});
