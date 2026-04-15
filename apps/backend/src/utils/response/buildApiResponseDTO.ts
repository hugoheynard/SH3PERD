import type { TApiMessage, TApiResponse } from '@sh3pherd/shared-types';

export function buildApiResponseDTO<TResponsePayload>(
  entry: TApiMessage,
  data: TResponsePayload,
): TApiResponse<TResponsePayload> {
  return {
    code: entry.code,
    message: entry.message,
    data,
  };
}
