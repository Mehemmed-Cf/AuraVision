export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4;

const LABELS: Record<PasswordStrengthLevel, string> = {
  0: 'zəif',
  1: 'zəif',
  2: 'orta',
  3: 'güclü',
  4: 'çox güclü',
};

export function getPasswordStrength(password: string): PasswordStrengthLevel {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  const capped = Math.min(score, 4) as PasswordStrengthLevel;
  return capped;
}

export function getPasswordStrengthLabel(level: PasswordStrengthLevel): string {
  return LABELS[level];
}
