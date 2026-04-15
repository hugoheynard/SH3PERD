import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { buildApiResponseDTO } from '../../utils/response/buildApiResponseDTO.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { P } from '@sh3pherd/shared-types';
import type {
  TCompanyId,
  TCompanyOrgChartViewModel,
  TOrgNodeRecord,
  TApiResponse,
} from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from './company.codes.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { CompanyOrgChartPayload, TeamViewModelPayload } from '../dto/company.dto.js';
import { GetCompanyOrgChartQuery } from '../application/queries/GetCompanyOrgChartQuery.js';
import { GetCompanyOrgNodesQuery } from '../application/queries/GetCompanyTeamsQuery.js';

@ApiTags('company / org-chart views')
@ApiBearerAuth('bearer')
@ContractScoped()
@Controller()
export class OrgChartViewsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Get company org chart (hierarchy tree)' })
  @ApiParam({ name: 'id', description: 'Company ID', example: 'company_abc-123' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_ORGCHART, CompanyOrgChartPayload))
  @RequirePermission(P.Company.OrgChart.Read)
  @Get(':id/orgchart')
  async getOrgChart(@Param('id') id: TCompanyId): Promise<TApiResponse<TCompanyOrgChartViewModel>> {
    const result = await this.queryBus.execute<GetCompanyOrgChartQuery, TCompanyOrgChartViewModel>(
      new GetCompanyOrgChartQuery(id),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_ORGCHART, result);
  }

  @ApiOperation({ summary: 'Get company org nodes (flat list)' })
  @ApiParam({ name: 'id', description: 'Company ID', example: 'company_abc-123' })
  @ApiResponse(apiSuccessDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_ORGNODES, TeamViewModelPayload))
  @RequirePermission(P.Company.OrgChart.Read)
  @Get(':id/org-nodes')
  async getCompanyOrgNodes(@Param('id') id: TCompanyId): Promise<TApiResponse<TOrgNodeRecord[]>> {
    const result = await this.queryBus.execute<GetCompanyOrgNodesQuery, TOrgNodeRecord[]>(
      new GetCompanyOrgNodesQuery(id),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_ORGNODES, result);
  }
}
