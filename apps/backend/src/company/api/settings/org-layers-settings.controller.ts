import { Body, Controller, Param, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActorId } from '../../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO } from '../../../music/codes.js';
import { apiRequestDTO, apiSuccessDTO } from '../../../utils/swagger/api-response.swagger.util.js';
import { type TCompanyId, type TOrgLayers, type TUserId, type TApiResponse, SOrgLayers, P } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from '../company.codes.js';
import { UpdateOrgLayersCommand } from '../../application/commands/UpdateOrgLayersCommand.js';
import { RequirePermission } from '../../../utils/nest/guards/RequirePermission.js';
import { ContractScoped } from '../../../utils/nest/decorators/ContractScoped.js';
import { OrgLayersPayload } from '../../dto/company.dto.js';

@ApiTags('company-settings / org-layers')
@ApiBearerAuth('bearer')
@ContractScoped()
@Controller()
export class OrgLayersSettingsController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Update org layer labels',
    description: 'Replaces the company org layer labels (depth names for the org chart). Requires `company:settings:write` permission.',
  })
  @ApiParam({ name: 'id', description: 'Company ID (prefixed `company_`)', example: 'company_abc-123' })
  @ApiBody(apiRequestDTO(OrgLayersPayload))
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.UPDATE_ORG_LAYERS, OrgLayersPayload))
  @ApiResponse({ status: 400, description: 'Validation failed (empty array, blank label).' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  @RequirePermission(P.Company.Settings.Write)
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
