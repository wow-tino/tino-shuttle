import { z } from "zod";

export const ApiResponseWithBodySchema = z.object({
  message: z.string(),
  status: z.number(),
  data: z.unknown().nullable(),
});

export type ApiResponseWithBody<T = unknown> = {
  message: string;
  status: number;
  data: T;
};

export type ApiResponseWithBodyUnknown = z.infer<typeof ApiResponseWithBodySchema>;
