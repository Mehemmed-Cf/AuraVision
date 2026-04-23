import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Check, Loader2, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuraLogo } from '@/components/auth/AuraLogo';
import { InputField } from '@/components/auth/InputField';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useAuthStore } from '@/stores/authStore';
import type { MobilityProfile } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import {
  getPasswordStrength,
  getPasswordStrengthLabel,
} from './passwordStrength';
import { registerSchema, type RegisterFormValues } from './schemas';

const fieldVariants = {
  initial: { opacity: 0, x: -12 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
};

const MOBILITY_OPTIONS: { value: MobilityProfile; icon: string; label: string }[] = [
  { value: 'wheelchair', icon: '♿', label: 'Əlil arabası' },
  { value: 'visual', icon: '👁', label: 'Görmə məhdudiyyəti' },
  { value: 'respiratory', icon: '🫁', label: 'Tənəffüs xəstəliyi' },
  { value: 'stroller', icon: '🍼', label: 'Uşaq arabası' },
  { value: 'standard', icon: '🚶', label: 'Standart' },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const showToast = useToastStore((s) => s.show);

  const [uiStep, setUiStep] = useState<'form' | 'success'>('form');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobilityProfile: 'standard',
      acceptTerms: false,
    },
  });

  const passwordValue = useWatch({ control, name: 'password' }) ?? '';
  const strength = getPasswordStrength(passwordValue);
  const strengthLabel = getPasswordStrengthLabel(strength);

  const onSubmit = async (data: RegisterFormValues) => {
    await registerUser(
      data.name,
      data.email,
      data.password,
      data.mobilityProfile,
    );
    const state = useAuthStore.getState();
    if (state.isAuthenticated) {
      setUiStep('success');
      window.setTimeout(() => {
        showToast('Qeydiyyat tamamlandı! Marşrutunuzu fərdiləşdirək.', 'onboarding');
        navigate('/dashboard', { replace: true });
      }, 900);
    }
  };

  if (uiStep === 'success') {
    return (
      <div className="auth-circuit-bg relative flex min-h-screen items-center justify-center px-4 py-12">
        <Link
          to="/"
          className="absolute left-4 top-4 text-sm font-medium text-[var(--text-2)] transition-colors hover:text-[var(--cyan)] sm:left-6 sm:top-6"
        >
          ← Ana səhifə
        </Link>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="flex flex-col items-center gap-4 rounded-[var(--aura-radius-xl)] border border-[var(--aura-navy-border)] bg-[var(--aura-navy-card)] px-10 py-12"
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.05, type: 'spring', stiffness: 400, damping: 18 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--aura-cyan-glow)] text-[var(--aura-success)]"
          >
            <Check className="h-9 w-9" strokeWidth={2.5} aria-hidden="true" />
          </motion.div>
          <p className="text-center text-[16px] font-medium text-[var(--aura-text-primary)]">
            Qeydiyyat tamamlandı
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-circuit-bg relative flex min-h-screen items-center justify-center overflow-y-auto px-4 py-12">
      <Link
        to="/"
        className="absolute left-4 top-4 z-10 text-sm font-medium text-[var(--text-2)] transition-colors hover:text-[var(--cyan)] sm:left-6 sm:top-6"
      >
        ← Ana səhifə
      </Link>
      <AuthCard>
        <AuraLogo />
        <h1
          className="mb-1 text-center text-[28px] font-semibold text-[var(--text-1)]"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Hesab yaradın
        </h1>
        <p className="mb-8 text-center text-[15px] text-[var(--aura-text-secondary)]">AURA-ya qoşulun</p>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isLoading}>
          <motion.div custom={0} variants={fieldVariants} initial="initial" animate="animate">
            <InputField
              id="reg-name"
              label="Ad və soyad"
              autoComplete="name"
              icon={<User className="h-6 w-6" strokeWidth={1.75} />}
              error={errors.name?.message}
              disabled={isLoading}
              aria-label="Ad və soyad"
              {...register('name')}
            />
          </motion.div>

          <motion.div custom={1} variants={fieldVariants} initial="initial" animate="animate">
            <InputField
              id="reg-email"
              label="E-poçt"
              type="email"
              autoComplete="email"
              icon={<Mail className="h-6 w-6" strokeWidth={1.75} />}
              error={errors.email?.message}
              disabled={isLoading}
              aria-label="E-poçt ünvanı"
              {...register('email')}
            />
          </motion.div>

          <motion.div custom={2} variants={fieldVariants} initial="initial" animate="animate">
            <PasswordInput
              id="reg-password"
              label="Şifrə"
              autoComplete="new-password"
              error={errors.password?.message}
              disabled={isLoading}
              aria-label="Şifrə"
              strengthBar={
                <div className="mt-2" aria-hidden="true">
                  <div className="mb-1 flex justify-between text-[12px] text-[var(--aura-text-muted)]">
                    <span>Güc</span>
                    <span className="capitalize text-[var(--aura-text-secondary)]">{strengthLabel}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((seg) => {
                      const palette = ['#EF4444', '#F97316', '#EAB308', '#10B981'];
                      const active = strength >= seg;
                      return (
                        <div
                          key={seg}
                          className="h-1.5 flex-1 rounded-full bg-[var(--navy-border)]"
                          style={{
                            backgroundColor: active ? palette[seg - 1] : undefined,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              }
              {...register('password')}
            />
          </motion.div>

          <motion.div custom={3} variants={fieldVariants} initial="initial" animate="animate">
            <PasswordInput
              id="reg-confirm"
              label="Şifrəni təsdiqləyin"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              disabled={isLoading}
              aria-label="Şifrəni təsdiqləyin"
              {...register('confirmPassword')}
            />
          </motion.div>

          <motion.div custom={4} variants={fieldVariants} initial="initial" animate="animate">
            <p className="mb-2 text-[13px] font-medium text-[var(--aura-text-secondary)]">Mobillik profili</p>
            <Controller
              name="mobilityProfile"
              control={control}
              render={({ field }) => (
                <div
                  className="grid grid-cols-2 gap-2"
                  role="radiogroup"
                  aria-label="Mobillik profili seçin"
                >
                  {MOBILITY_OPTIONS.map((opt) => {
                    const selected = field.value === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isLoading}
                        onClick={() => field.onChange(opt.value)}
                        className={[
                          'flex flex-col items-start gap-1 rounded-[var(--r-md)] border p-4 text-left transition-colors',
                          selected
                            ? 'border-[var(--cyan)] bg-[var(--cyan-dim)]'
                            : 'border-[var(--navy-border)] bg-[var(--navy-raised)] hover:border-[var(--navy-border)]',
                          isLoading ? 'opacity-60' : '',
                        ].join(' ')}
                        role="radio"
                        aria-checked={selected}
                        aria-label={opt.label}
                      >
                        <span className="text-lg" aria-hidden="true">
                          {opt.icon}
                        </span>
                        <span className="text-[13px] text-[var(--aura-text-primary)]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.mobilityProfile ? (
              <p className="mt-1 text-[12px] text-[var(--aura-error)]" role="alert">
                {errors.mobilityProfile.message}
              </p>
            ) : null}
          </motion.div>

          <motion.div custom={5} variants={fieldVariants} initial="initial" animate="animate">
            <Controller
              name="acceptTerms"
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-start gap-3 text-[13px] text-[var(--aura-text-secondary)]">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border border-[var(--aura-navy-border)] bg-[rgba(255,255,255,0.04)] accent-[var(--aura-cyan)]"
                    checked={field.value === true}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={isLoading}
                    aria-invalid={errors.acceptTerms ? 'true' : undefined}
                    aria-describedby={errors.acceptTerms ? 'acceptTerms-error' : undefined}
                    aria-label="Şərtləri və məxfilik siyasətini qəbul edirəm"
                  />
                  <span>
                    Şərtləri və{' '}
                    <a href="#" className="text-[var(--aura-cyan)] hover:underline" onClick={(e) => e.preventDefault()}>
                      Məxfilik Siyasətini
                    </a>{' '}
                    qəbul edirəm
                  </span>
                </label>
              )}
            />
            {errors.acceptTerms ? (
              <p id="acceptTerms-error" className="mt-1 text-[12px] text-[var(--aura-error)]" role="alert">
                {errors.acceptTerms.message}
              </p>
            ) : null}
          </motion.div>

          <motion.div custom={6} variants={fieldVariants} initial="initial" animate="animate">
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--r-md)] bg-[var(--cyan)] text-[15px] font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-hover)] disabled:cursor-not-allowed disabled:opacity-70"
              aria-label="Qeydiyyatdan keç"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  <span>Gözləyin...</span>
                </>
              ) : (
                'Qeydiyyatdan keç'
              )}
            </button>
          </motion.div>
        </form>

        <p className="mt-8 text-center text-[13px] text-[var(--aura-text-secondary)]">
          Artıq hesabınız var?{' '}
          <Link
            className="font-semibold text-[var(--aura-cyan)] hover:text-[var(--aura-cyan-dim)]"
            to="/login"
          >
            Daxil olun
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
