import { HttpException } from '@nestjs/common';
import type { ZodError } from 'zod';

import { formatZodError } from '../zod/formatZodError.js';


/**
 * Exception thrown when response payload validation fails.
 */
export class PayloadValidationException extends HttpException {
  constructor(error: ZodError) {
    const formatted = formatZodError(error);
    super(
      {
        statusCode: 555,
        error: 'RESPONSE_PAYLOAD_VALIDATION_FAILED',
        message: '[PayloadValidator] Response payload does not match schema',
        fieldErrors: formatted.fieldErrors,
        summary: formatted.summary,
        details: formatted.message,
      },
      555,
    );
  };
}