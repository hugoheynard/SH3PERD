import { Body, Controller, Param, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ActorId } from '../../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO } from '../../../music/codes.js';
import type { TCompanyId, TCompanyInfo, TUserId, TApiResponse } from '@sh3pherd/shared-types';
import { SCompanyInfo } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from '../company.codes.js';
import { UpdateCompanyInfoCommand } from '../../application/commands/UpdateCompanyInfoCommand.js';

@ApiTags('company-settings / info')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@Controller()
export class CompanyInfoSettingsController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Update company info (name, description, address)' })
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
