import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { Response } from 'express';
import { map as rxMap } from 'rxjs/operators';
import { PayloadValidationException } from './PayloadValidation.httpException.js';
import { ZodSchema } from 'zod';


/**
 * Intercepts the response and checks its payload against the provided Zod schema.
 */
@Injectable()
export class ResponsePayloadValidationInterceptor implements NestInterceptor {
  constructor(private readonly schema: ZodSchema) {
  }

  intercept(_: ExecutionContext, next: CallHandler): Observable<Response> {
    return next.handle().pipe(
      rxMap((response) => {
        const data = response?.data ?? response;
        console.log('[PayloadValidator] hasOwnProperty("her"):', Object.prototype.hasOwnProperty.call(data, 'her'));

        const parsed = this.schema.safeParse(data);
        console.log(data);

        if (!parsed.success) {
          throw new PayloadValidationException(parsed.error);
        }

        return response;
      }),
    );
  }
}