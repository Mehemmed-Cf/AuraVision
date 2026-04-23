import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'B2G — Nasimi Accessibility Ledger',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body>{children}</body>
    </html>
  );
}
