import { Body, Controller, Param, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActorId } from '../../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO } from '../../../music/codes.js';
import type { TCompanyId, TOrgLayers, TUserId, TApiResponse } from '@sh3pherd/shared-types';
import { SOrgLayers } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from '../company.codes.js';
import { UpdateOrgLayersCommand } from '../../application/commands/UpdateOrgLayersCommand.js';

@ApiTags('company-settings / org-layers')
@ApiBearerAuth('bearer')
@Controller()
export class OrgLayersSettingsController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Update org layer labels',
    description: 'Replaces the company org layer labels (depth names for the org chart). Requires `company:settings:write` permission.',
  })
  @ApiParam({ name: 'id', description: 'Company ID (prefixed `company_`)', example: 'company_abc-123' })
  @ApiBody({
    description: 'Object containing the new org layers array. Each label must be non-empty.',
    schema: {
      type: 'object',
      required: ['orgLayers'],
      properties: {
        orgLayers: {
          type: 'array',
          items: { type: 'string', minLength: 1 },
          minItems: 1,
          example: ['Direction', 'Pole', 'Equipe'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Returns the updated org layers.' })
  @ApiResponse({ status: 400, description: 'Validation failed (empty array, blank label).' })
  @ApiResponse({ status: 403, description: 'Actor lacks `company:settings:write` permission.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  @Patch(':id/settings/org-layers')
  async updateOrgLayers(
    @Param('id') id: TCompanyId,
    @Body(new ZodValidationPipe(SOrgLayers)) body: TOrgLayers,
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TOrgLayers>> {
    const result = await this.commandBus.execute<UpdateOrgLayersCommand, TOrgLayers>(
      new UpdateOrgLayersCommand(id, body.orgLayers, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.UPDATE_ORG_LAYERS, result);
  }
}
