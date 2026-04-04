import { Body, Controller, Param, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ActorId } from '../../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO } from '../../../music/codes.js';
import type { TCompanyId, TOrgLayers, TUserId, TApiResponse } from '@sh3pherd/shared-types';
import { SOrgLayers } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from '../company.codes.js';
import { UpdateOrgLayersCommand } from '../../application/commands/UpdateOrgLayersCommand.js';

@ApiTags('company-settings / org-layers')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@Controller()
export class OrgLayersSettingsController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Update org layer labels' })
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
