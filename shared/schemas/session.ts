import { z } from 'zod';

export const createSessionBodySchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  bpm: z.number().positive().finite().nullable().optional(),
});

export type CreateSessionBody = z.infer<typeof createSessionBodySchema>;

export const updateSessionTitleBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export type UpdateSessionTitleBody = z.infer<
  typeof updateSessionTitleBodySchema
>;

export const sessionIdParamSchema = z.object({
  id: z.string().cuid(),
});
