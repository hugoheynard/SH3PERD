import {
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { type Type } from '@nestjs/common';
import { ApiModel } from './api-model.swagger.util.js';

//import type { TApiResponse } from '@sh3pherd/shared-types';


@ApiModel()
export class ApiResponseDTO<T> {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: () => Object })
  data!: T;
}

export class ApiErrorDTO {
  @ApiProperty({ example: 'INVALID_USER_ID' })
  code!: string;

  @ApiProperty({ example: 'The provided user ID is invalid.' })
  message!: string;

  @ApiProperty({ example: 400 })
  statusCode!: number;
}

type ApiResponseCode = { code: string; message: string };

/**
 * Swagger response factory for standardized success responses.
 *
 * @param code - Object containing business code + message (e.g. USER_CODES_SUCCESS.CREATE_USER)
 * @param model - DTO class of the data payload
 * @param status - HTTP status (default: 200)
 * @param description - Optional description for Swagger
 */
export function apiSuccessDTO<T extends Type<any>>(
  code: ApiResponseCode,
  model: T,
  status: number = 200,
  description = 'Successful response',
) {
  return {
    status: status,
    description,
    content: {
      'application/json': {
        schema: {
          allOf: [
            { $ref: getSchemaPath(ApiResponseDTO) },
            {
              properties: {
                code: { type: 'string', example: code.code ?? 'SUCCESS' },
                message: { type: 'string', example: code.message ?? 'Operation successful' },
                data: { $ref: getSchemaPath(model) },
              },
            },
          ],
        },
      },
    },
  };
}


/**
 * Swagger request body factory — references a Zod-derived DTO class.
 *
 * Pair with `createZodDto(SMySchema)` + `@ApiModel()` to auto-generate
 * the request body schema from your Zod schema.
 *
 * @param model - DTO class (created via `createZodDto`)
 * @param description - Optional description override
 *
 * @example
 * ```ts
 * @ApiBody(apiRequestDTO(CompanyInfoPayload))
 * @Post()
 * create(@Body() dto: TCompanyInfo) { ... }
 * ```
 */
export function apiRequestDTO<T extends Type<any>>(
  model: T,
  description?: string,
) {
  return {
    ...(description ? { description } : {}),
    schema: { $ref: getSchemaPath(model) },
  };
}


/**
 * Crée une réponse Swagger standardisée pour les erreurs.
 *
 * @param code - Code d’erreur (ex: USER_ERRORS.INVALID_ID)
 * @param status - Code HTTP (ex: 400, 401, 404…)
 * @param description - Description affichée dans Swagger
 */
export function apiError(
  code: ApiResponseCode,
  status: number = 400,
  description = 'Error response',
) {
  return {
    status,
    description,
    content: {
      'application/json': {
        schema: {
          allOf: [
            { $ref: getSchemaPath(ApiResponseDTO) },
            {
              properties: {
                code: { type: 'string', example: code.code ?? 'ERROR' },
                message: { type: 'string', example: code.message ?? 'An error occurred' },
                data: { type: 'null', example: null },
              },
            },
          ],
        },
      },
    },
  };
}