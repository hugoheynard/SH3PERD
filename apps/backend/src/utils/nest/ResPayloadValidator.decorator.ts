import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ResponsePayloadValidationInterceptor } from './ResponsePayloadValidation.interceptor.js';
import { ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { PayloadValidationErrorResponseDto } from './PayloadValidationErrorResponse.dto.js';

/**
 * Decorator to validate response at runtime against the provided DTO or Zod schema.
 * @param dtoOrSchema
 * @param options
 * @constructor
 */
export function ResPayloadValidator(
  dtoOrSchema: any,
  options: { active?: boolean } = { active: true },
) {
  const schema = 'schema' in dtoOrSchema ? dtoOrSchema.schema.strict() : dtoOrSchema;

  if (!options.active) {
    return applyDecorators();
  }
  return applyDecorators(
    UseInterceptors(new ResponsePayloadValidationInterceptor(schema)),
    ApiInternalServerErrorResponse({
      description:
        'Returned when the response payload does not match the expected schema (runtime validation failure).',
      type: PayloadValidationErrorResponseDto,
    }),
  );
}
