import { Controller, Delete, Param } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO } from '../../music/codes.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { P } from '@sh3pherd/shared-types';
import type { TCompanyId, TUserId, TApiResponse } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from './company.codes.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { DeleteCompanyCommand, type TDeleteCompanyResult } from '../application/commands/DeleteCompanyCommand.js';
import { DeletedCompanyPayload } from '../dto/company.dto.js';

@ApiTags('companies')
@ApiBearerAuth('bearer')
@ContractScoped()
@Controller()
export class DeleteCompanyController {
  constructor(private readonly commandBus: CommandBus) {}

  //TODO: archived soft delete for sh3pherd users,
  // add hard delete sh3-admin only with deletion of all
  // related resources maybe doing a sh3-admin controller with a backoffice

  @ApiOperation({
    summary: 'Delete a company (owner only)',
    description: 'Permanently deletes a company. Requires owner role and `company:settings:delete` permission.',
  })
  @ApiParam({ name: 'id', description: 'Company ID', example: 'company_abc-123' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.DELETE_COMPANY, DeletedCompanyPayload))
  @ApiResponse({ status: 404, description: 'Company not found.' })
  @RequirePermission(P.Company.Settings.Delete)
  @Delete(':id')
  async deleteCompany(
    @Param('id') id: TCompanyId,
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TDeleteCompanyResult>> {
    const result = await this.commandBus.execute<DeleteCompanyCommand, TDeleteCompanyResult>(
      new DeleteCompanyCommand(id, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.DELETE_COMPANY, result);
  }
}
