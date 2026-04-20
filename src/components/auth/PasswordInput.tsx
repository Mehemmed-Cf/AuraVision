import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useId, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id?: string;
  label: string;
  error?: string;
  describedById?: string;
  strengthBar?: ReactNode;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { id: idProp, label, error, describedById, strengthBar, className = '', disabled, ...rest },
  ref,
) {
  const reactId = useId();
  const id = idProp ?? `password-${reactId}`;
  const [visible, setVisible] = useState(false);
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
        <input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={rest.autoComplete ?? 'current-password'}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          className={[
            'w-full rounded-[var(--aura-radius-md)] border border-[var(--aura-navy-border)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 pr-12 text-[15px] text-[var(--aura-text-primary)] outline-none transition-colors placeholder:text-[var(--aura-text-muted)] focus:border-[var(--aura-cyan)]',
            className,
          ].join(' ')}
          {...rest}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--aura-text-secondary)] hover:text-[var(--aura-cyan)] disabled:opacity-50"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
          disabled={disabled}
        >
          {visible ? <EyeOff className="h-6 w-6" strokeWidth={1.75} /> : <Eye className="h-6 w-6" strokeWidth={1.75} />}
        </button>
      </div>
      {strengthBar}
      {error ? (
        <p id={errorId} className="mt-1.5 text-[12px] text-[var(--aura-error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
