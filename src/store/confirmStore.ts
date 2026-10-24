import { create } from 'zustand';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions | null;
  isLoading: boolean;
  showConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
  executeConfirm: () => Promise<void>;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  options: null,
  isLoading: false,

  showConfirm: (options: ConfirmOptions) => {
    set({
      isOpen: true,
      options,
      isLoading: false
    });
  },

  closeConfirm: () => {
    const { options } = get();
    if (options?.onCancel) {
      options.onCancel();
    }
    set({ isOpen: false, options: null, isLoading: false });
  },

  executeConfirm: async () => {
    const { options } = get();
    if (!options) return;

    try {
      set({ isLoading: true });
      await options.onConfirm();
    } finally {
      set({ isOpen: false, options: null, isLoading: false });
    }
  }
}));
