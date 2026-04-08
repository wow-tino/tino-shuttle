import { z } from "zod";

export const ApiResponseWithBodySchema = z.object({
  message: z.string(),
  status: z.number(),
  data: z.unknown().nullable(),
});

export type ApiResponseWithBody<T = unknown> = {
  readonly message: string;
  readonly status: number;
  readonly data: T | null;
};

export type ApiResponseWithBodyUnknown = z.infer<typeof ApiResponseWithBodySchema>;
