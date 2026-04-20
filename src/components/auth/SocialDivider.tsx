interface SocialDividerProps {
  label: string;
}

export function SocialDivider({ label }: SocialDividerProps) {
  return (
    <div className="my-6 flex items-center gap-3" role="separator" aria-label={label}>
      <div className="h-px flex-1 bg-[var(--aura-navy-border)]" />
      <span className="text-[13px] text-[var(--aura-text-muted)]">{label}</span>
      <div className="h-px flex-1 bg-[var(--aura-navy-border)]" />
    </div>
  );
}
