import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  icon?: ReactNode;
  describedById?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  { id, label, error, icon, className = '', describedById, disabled, ...rest },
  ref,
) {
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [describedById, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-medium text-[var(--aura-text-secondary)]"
      >
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--aura-text-muted)] [&>svg]:h-6 [&>svg]:w-6">
            {icon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          className={[
            'w-full rounded-[var(--aura-radius-md)] border border-[var(--aura-navy-border)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 text-[15px] text-[var(--aura-text-primary)] outline-none transition-colors placeholder:text-[var(--aura-text-muted)] focus:border-[var(--aura-cyan)]',
            icon ? 'pl-11' : '',
            className,
          ].join(' ')}
          {...rest}
        />
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-[12px] text-[var(--aura-error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
