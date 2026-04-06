import { Body, Controller, Param, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActorId } from '../../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO } from '../../../music/codes.js';
import type { TCompanyId, TCompanyInfo, TUserId, TApiResponse } from '@sh3pherd/shared-types';
import { SCompanyInfo } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from '../company.codes.js';
import { UpdateCompanyInfoCommand } from '../../application/commands/UpdateCompanyInfoCommand.js';

@ApiTags('company-settings / info')
@ApiBearerAuth('bearer')
@Controller()
export class CompanyInfoSettingsController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Update company info',
    description: 'Updates the company name, description and address. Requires `company:settings:write` permission.',
  })
  @ApiParam({ name: 'id', description: 'Company ID (prefixed `company_`)', example: 'company_abc-123' })
  @ApiBody({
    description: 'Full company info object. All fields are required — the form always sends the complete object.',
    schema: {
      type: 'object',
      required: ['name', 'description', 'address'],
      properties: {
        name: { type: 'string', minLength: 1, example: 'Acme Productions' },
        description: { type: 'string', example: 'A creative production company.' },
        address: {
          type: 'object',
          required: ['street', 'city', 'zip', 'country'],
          properties: {
            street: { type: 'string', example: '42 Rue de la Musique' },
            city: { type: 'string', example: 'Paris' },
            zip: { type: 'string', example: '75011' },
            country: { type: 'string', example: 'France' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Returns the updated company info (name, description, address).' })
  @ApiResponse({ status: 400, description: 'Validation failed (name empty, malformed body).' })
  @ApiResponse({ status: 403, description: 'Actor lacks `company:settings:write` permission.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  @Patch(':id/settings/info')
  async updateCompanyInfo(
    @Param('id') id: TCompanyId,
    @Body(new ZodValidationPipe(SCompanyInfo)) body: TCompanyInfo,
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TCompanyInfo>> {
    const result = await this.commandBus.execute<UpdateCompanyInfoCommand, TCompanyInfo>(
      new UpdateCompanyInfoCommand({ company_id: id, ...body }, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.UPDATE_COMPANY_INFO, result);
  }
}
