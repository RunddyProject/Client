import { create } from 'zustand';

export interface DialogConfig {
  title: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
}

interface DialogStore {
  config: DialogConfig | null;
  show: (config: DialogConfig) => void;
  hide: () => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  config: null,
  show: (config) => set({ config }),
  hide: () => set({ config: null })
}));

export const showDialog = (config: DialogConfig) =>
  useDialogStore.getState().show(config);
