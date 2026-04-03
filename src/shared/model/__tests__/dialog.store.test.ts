import { afterEach, describe, expect, it } from 'vitest';

import { showDialog, useDialogStore } from '../dialog.store';

afterEach(() => {
  useDialogStore.getState().hide();
});

describe('dialog.store', () => {
  it('초기 상태: config가 null', () => {
    expect(useDialogStore.getState().config).toBeNull();
  });

  it('showDialog → config 설정', () => {
    showDialog({ title: '테스트 제목' });
    expect(useDialogStore.getState().config).toMatchObject({ title: '테스트 제목' });
  });

  it('showDialog → 모든 필드 저장', () => {
    const onConfirm = () => {};
    showDialog({
      title: '삭제하시겠어요?',
      cancelLabel: '아니요',
      confirmLabel: '삭제',
      onConfirm
    });
    expect(useDialogStore.getState().config).toEqual({
      title: '삭제하시겠어요?',
      cancelLabel: '아니요',
      confirmLabel: '삭제',
      onConfirm
    });
  });

  it('hide → config를 null로 초기화', () => {
    showDialog({ title: '테스트' });
    useDialogStore.getState().hide();
    expect(useDialogStore.getState().config).toBeNull();
  });

  it('showDialog 연속 호출 시 마지막 config로 덮어쓰기', () => {
    showDialog({ title: '첫 번째' });
    showDialog({ title: '두 번째' });
    expect(useDialogStore.getState().config?.title).toBe('두 번째');
  });
});
