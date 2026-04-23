import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuraLogo } from '@/components/auth/AuraLogo';
import { InputField } from '@/components/auth/InputField';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { loginSchema, type LoginFormValues } from './schemas';

const fieldVariants = {
  initial: { opacity: 0, x: -12 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
};

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const clearError = useAuthStore((s) => s.clearError);
  const isLoading = useAuthStore((s) => s.isLoading);
  const storeError = useAuthStore((s) => s.error);
  const showToast = useToastStore((s) => s.show);

  const [shakeKey, setShakeKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    clearError();
    await login(data.email.trim(), data.password);
    const state = useAuthStore.getState();
    if (state.isAuthenticated && state.user) {
      showToast(`Xoş gəldiniz, ${state.user.name}! AURA hazırdır.`, 'welcome');
      navigate('/dashboard', { replace: true });
      return;
    }
    setShakeKey((k) => k + 1);
  };

  return (
    <div className="auth-circuit-bg relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link
        to="/"
        className="absolute left-4 top-4 text-sm font-medium text-[var(--text-2)] transition-colors hover:text-[var(--cyan)] sm:left-6 sm:top-6"
      >
        ← Ana səhifə
      </Link>
      <motion.div
        key={shakeKey}
        initial={{ x: 0 }}
        animate={
          shakeKey > 0 ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }
        }
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        className="w-full max-w-[420px]"
      >
        <AuthCard>
          <AuraLogo tagline="Hər kəs üçün əlçatan, hər kəs üçün yaşıl" />
          <h1
            className="mb-8 text-center text-[28px] font-semibold text-[var(--text-1)]"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            Xoş gəldiniz
          </h1>

          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-busy={isLoading}
          >
            <motion.div custom={0} variants={fieldVariants} initial="initial" animate="animate">
              <InputField
                id="login-email"
                label="E-poçt"
                type="email"
                autoComplete="email"
                placeholder="siz@misal.az"
                icon={<Mail className="h-6 w-6" strokeWidth={1.75} />}
                error={errors.email?.message}
                disabled={isLoading}
                aria-label="E-poçt ünvanı"
                {...register('email', {
                  onChange: () => clearError(),
                })}
              />
            </motion.div>

            <motion.div custom={1} variants={fieldVariants} initial="initial" animate="animate">
              <PasswordInput
                id="login-password"
                label="Şifrə"
                autoComplete="current-password"
                placeholder="Ən azı 8 simvol"
                error={errors.password?.message}
                disabled={isLoading}
                aria-label="Şifrə"
                {...register('password', {
                  onChange: () => clearError(),
                })}
              />
            </motion.div>

            <motion.div
              custom={2}
              variants={fieldVariants}
              initial="initial"
              animate="animate"
              className="flex justify-end"
            >
              <button
                type="button"
                className="text-[13px] font-medium text-[var(--cyan)] hover:text-[var(--cyan-hover)]"
                onClick={() => {}}
                aria-label="Şifrəni bərpa et (tezliklə)"
              >
                Şifrəmi unutdum?
              </button>
            </motion.div>

            {storeError ? (
              <p
                className="text-center text-[12px] text-[var(--error)]"
                role="alert"
                aria-live="polite"
              >
                {storeError}
              </p>
            ) : null}

            <motion.div custom={3} variants={fieldVariants} initial="initial" animate="animate">
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--r-md)] bg-[var(--cyan)] text-[15px] font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--cyan-hover)] disabled:cursor-not-allowed disabled:opacity-70"
                aria-label="Daxil ol"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span>Gözləyin...</span>
                  </>
                ) : (
                  'Daxil ol'
                )}
              </button>
            </motion.div>
          </form>

          <p className="mt-8 text-center text-[13px] text-[var(--text-2)]">
            Hesabınız yoxdur?{' '}
            <Link
              className="font-semibold text-[var(--cyan)] hover:text-[var(--cyan-hover)]"
              to="/register"
            >
              Qeydiyyatdan keçin
            </Link>
          </p>
        </AuthCard>
      </motion.div>
    </div>
  );
}
