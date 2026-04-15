import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map as rxMap } from 'rxjs/operators';
import { PayloadValidationException } from './PayloadValidation.httpException.js';
import type { ZodTypeAny } from 'zod';

type ApiResponseLike = {
  data?: unknown;
};

/**
 * Intercepts the response and checks its payload against the provided Zod schema.
 */
@Injectable()
export class ResponsePayloadValidationInterceptor implements NestInterceptor {
  constructor(private readonly schema: ZodTypeAny) {}

  intercept(_: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    return next.handle().pipe(
      rxMap((response: unknown): unknown => {
        const data =
          typeof response === 'object' && response !== null && 'data' in response
            ? (response as ApiResponseLike).data
            : response;

        const parsed = this.schema.safeParse(data);

        if (!parsed.success) {
          throw new PayloadValidationException(parsed.error);
        }

        return response;
      }),
    );
  }
}
