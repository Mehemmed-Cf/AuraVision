import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Düzgün e-poçt daxil edin'),
  password: z.string().min(8, 'Şifrə ən az 8 simvol olmalıdır'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Ad ən az 2 simvol olmalıdır').max(50),
    email: z.string().email('Düzgün e-poçt daxil edin'),
    password: z
      .string()
      .min(8, 'Şifrə ən az 8 simvol olmalıdır')
      .regex(/[A-Z]/, 'Ən az 1 böyük hərf lazımdır')
      .regex(/[0-9]/, 'Ən az 1 rəqəm lazımdır'),
    confirmPassword: z.string(),
    mobilityProfile: z.enum([
      'wheelchair',
      'visual',
      'respiratory',
      'stroller',
      'standard',
    ]),
    acceptTerms: z.boolean(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Şifrələr uyğun gəlmir',
    path: ['confirmPassword'],
  })
  .refine((d) => d.acceptTerms === true, {
    message: 'Şərtləri qəbul etməlisiniz',
    path: ['acceptTerms'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
