import { z } from 'zod';

export const createSessionSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export const updateSessionSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export type UpdateSessionBody = z.infer<typeof updateSessionSchema>;

export const sessionIdParamSchema = z.object({
  id: z.string().cuid(),
});
