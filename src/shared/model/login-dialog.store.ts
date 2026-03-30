import { create } from 'zustand';

interface LoginDialogStore {
  open: boolean;
  show: () => void;
  hide: () => void;
}

export const useLoginDialogStore = create<LoginDialogStore>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false })
}));

export const showLoginDialog = () => useLoginDialogStore.getState().show();
