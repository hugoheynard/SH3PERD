import { Body, Controller, Param, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ActorId } from '../../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO } from '../../../utils/response/buildApiResponseDTO.js';
import { apiRequestDTO, apiSuccessDTO } from '../../../utils/swagger/api-response.swagger.util.js';
import {
  type TCompanyId,
  type TCompanyInfo,
  type TUserId,
  type TApiResponse,
  SCompanyInfo,
  P,
} from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from '../company.codes.js';
import { UpdateCompanyInfoCommand } from '../../application/commands/UpdateCompanyInfoCommand.js';
import { RequirePermission } from '../../../utils/nest/guards/RequirePermission.js';
import { ContractScoped } from '../../../utils/nest/decorators/ContractScoped.js';
import { CompanyInfoPayload } from '../../dto/company.dto.js';

@ApiTags('company-settings / info')
@ApiBearerAuth('bearer')
@ContractScoped()
@Controller()
export class CompanyInfoSettingsController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    summary: 'Update company info',
    description:
      'Updates the company name, description and address. Requires `company:settings:write` permission.',
  })
  @ApiParam({
    name: 'id',
    description: 'Company ID (prefixed `company_`)',
    example: 'company_abc-123',
  })
  @ApiBody(apiRequestDTO(CompanyInfoPayload))
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.UPDATE_COMPANY_INFO, CompanyInfoPayload))
  @ApiResponse({ status: 400, description: 'Validation failed (name empty, malformed body).' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  @RequirePermission(P.Company.Settings.Write)
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
