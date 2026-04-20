import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const cardVariants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.35 } },
};

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <motion.div
      className="auth-card-shell w-full max-w-[420px] px-4 sm:px-0"
      variants={cardVariants}
      initial="initial"
      animate="animate"
    >
      <div className="rounded-[var(--aura-radius-xl)] border border-[var(--aura-navy-border)] bg-[var(--aura-navy-card)] p-10">
        {children}
      </div>
    </motion.div>
  );
}
