import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '@/stores/toastStore';

export function ToastStack() {
  const message = useToastStore((s) => s.message);
  const variant = useToastStore((s) => s.variant);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] max-w-sm">
      <AnimatePresence mode="wait">
        {message ? (
          <motion.div
            key={message}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto rounded-[var(--aura-radius-md)] border border-[var(--aura-navy-border)] bg-[var(--aura-navy-card)] py-3 pl-4 pr-4 text-[14px] text-[var(--aura-text-primary)]"
            style={{ borderLeftWidth: 4, borderLeftColor: 'var(--aura-cyan)' }}
          >
            <span className="sr-only">{variant === 'welcome' ? 'Xoş gəldiniz' : 'Məlumat'}</span>
            {message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
