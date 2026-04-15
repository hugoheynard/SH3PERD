import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ResponsePayloadValidationInterceptor } from './ResponsePayloadValidation.interceptor.js';
import { ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { PayloadValidationErrorResponseDto } from './PayloadValidationErrorResponse.dto.js';
import type { ZodTypeAny } from 'zod';

type DtoWithSchema = {
  schema: ZodTypeAny;
};

type StrictSchema = ZodTypeAny & {
  strict: () => ZodTypeAny;
};

function hasSchema(value: unknown): value is DtoWithSchema {
  return typeof value === 'object' && value !== null && 'schema' in value;
}

function hasStrict(schema: ZodTypeAny): schema is StrictSchema {
  return 'strict' in schema && typeof schema.strict === 'function';
}

/**
 * Decorator to validate response at runtime against the provided DTO or Zod schema.
 * @param dtoOrSchema
 * @param options
 * @constructor
 */
export function ResPayloadValidator(
  dtoOrSchema: ZodTypeAny | DtoWithSchema,
  options: { active?: boolean } = { active: true },
): ClassDecorator & MethodDecorator {
  const rawSchema = hasSchema(dtoOrSchema) ? dtoOrSchema.schema : dtoOrSchema;
  const schema = hasStrict(rawSchema) ? rawSchema.strict() : rawSchema;

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
