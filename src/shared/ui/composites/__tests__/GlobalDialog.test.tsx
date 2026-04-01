import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { act, render, screen, waitFor } from '@/test/utils';
import { showDialog, useDialogStore } from '@/shared/model/dialog.store';

import { GlobalDialog } from '../GlobalDialog';

afterEach(() => {
  act(() => useDialogStore.getState().hide());
});

function renderDialog() {
  return render(<GlobalDialog />);
}

describe('GlobalDialog', () => {
  it('store가 비어있으면 다이얼로그 미렌더', () => {
    renderDialog();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('showDialog 호출 후 title 렌더', () => {
    renderDialog();
    act(() => showDialog({ title: '로그인이 필요해요' }));
    expect(screen.getByText('로그인이 필요해요')).toBeInTheDocument();
  });

  it('cancelLabel / confirmLabel 렌더', () => {
    renderDialog();
    act(() => showDialog({ title: '삭제', cancelLabel: '아니요', confirmLabel: '삭제' }));
    expect(screen.getByRole('button', { name: '아니요' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
  });

  it('label 미지정 시 기본값(취소 / 확인) 렌더', () => {
    renderDialog();
    act(() => showDialog({ title: '테스트' }));
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
  });

  it('확인 클릭 → onConfirm 호출 후 다이얼로그 닫힘', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderDialog();
    act(() => showDialog({ title: '테스트', confirmLabel: '확인', onConfirm }));

    await user.click(screen.getByRole('button', { name: '확인' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(useDialogStore.getState().config).toBeNull();
    });
  });

  it('취소 클릭 → onConfirm 미호출, 다이얼로그 닫힘', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderDialog();
    act(() => showDialog({ title: '테스트', cancelLabel: '취소', onConfirm }));

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(onConfirm).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(useDialogStore.getState().config).toBeNull();
    });
  });
});
