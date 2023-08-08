import { z } from 'zod';

export type AppStage = 'dev' | 'test' | 'prod' | (string & {});

export const userEventSchema = z.array(
  z.object({
    messageId: z.string(),
    body: z.object({
      userId: z.number(),
      text: z.string(),
    }),
  }),
);

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type UserType = z.infer<typeof userSchema>;

export const postsSchema = z.array(
  z.object({
    userId: z.number(),
    id: z.number(),
    title: z.string(),
    body: z.string(),
  }),
);
