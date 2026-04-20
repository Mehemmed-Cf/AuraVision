interface AuraLogoProps {
  tagline?: string;
}

export function AuraLogo({ tagline }: AuraLogoProps) {
  return (
    <div className="mb-4 flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-3">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M20 2L4 10v12c0 9.5 6.8 18.4 16 20 9.2-1.6 16-10.5 16-20V10L20 2z"
            stroke="var(--aura-cyan)"
            strokeWidth="2"
            fill="rgba(0,212,255,0.08)"
          />
          <path
            d="M20 12v16M14 18h12M14 24h8"
            stroke="var(--aura-cyan)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span
          className="font-brand text-[22px] font-bold tracking-tight text-[var(--aura-text-primary)]"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          AURA
        </span>
      </div>
      {tagline ? (
        <p className="max-w-[320px] text-center text-[13px] leading-snug text-[var(--aura-text-secondary)]">
          {tagline}
        </p>
      ) : null}
    </div>
  );
}
