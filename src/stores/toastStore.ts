import { create } from 'zustand';

type ToastVariant = 'welcome' | 'onboarding';

interface ToastState {
  message: string | null;
  variant: ToastVariant;
  show: (message: string, variant?: ToastVariant) => void;
  hide: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  variant: 'welcome',
  show: (message, variant = 'welcome') => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ message, variant });
    hideTimer = setTimeout(() => {
      set({ message: null });
      hideTimer = null;
    }, 3000);
  },
  hide: () => {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = null;
    set({ message: null });
  },
}));
