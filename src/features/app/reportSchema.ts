import { z } from 'zod';

export const reportFormSchema = z.object({
  type: z.enum(['broken_ramp', 'high_curb', 'closed_elevator', 'poor_surface', 'no_ramp']),
  severity: z.enum(['low', 'medium', 'high']),
  address: z.string().min(5, 'Ünvanı daxil edin'),
  description: z.string().min(10, 'Ətraflı təsvir yazın'),
  lat: z.number(),
  lng: z.number(),
});

export type ReportFormValues = z.infer<typeof reportFormSchema>;
