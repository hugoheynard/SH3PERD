import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for response payload validation errors.
 */
export class PayloadValidationErrorResponseDto {
  @ApiProperty({ example: 555 })
  statusCode!: number;

  @ApiProperty({ example: 'RESPONSE_PAYLOAD_VALIDATION_FAILED' })
  error!: string;

  @ApiProperty({ example: '[PayloadValidator] Invalid response payload' })
  message!: string;

  @ApiProperty({
    example: {
      her: ['Unrecognized key(s) in object: \'her\''],
      preferences: ['Expected object, received string'],
    },
  })
  fieldErrors!: Record<string, string[]>;

  @ApiProperty({ example: [] }) summary!: string[];

  @ApiProperty({ example: 'her: Unrecognized key(s) in object: \'her\', preferences: Expected object, received string' })
  details!: string;
}