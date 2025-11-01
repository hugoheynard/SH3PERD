import { z, ZodSchema } from 'zod';

export type TApiMessage = {
  code: string;
  message: string;
};

export type TApiResponse<T> = TApiMessage & {
  data: T;
};

export type TAsyncApiResponse<DTO> = Promise<TApiResponse<DTO>>;

export function createApiResponseSchema(useCaseResultSchema: ZodSchema) {

  return z.object({
    code: z.string(),
    message: z.string(),
    data: useCaseResultSchema,
  });
}