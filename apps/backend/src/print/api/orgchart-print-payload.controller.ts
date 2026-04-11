import {
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { TCompanyId, TCompanyOrgChartViewModel } from '@sh3pherd/shared-types';
import { Public } from '../../utils/nest/decorators/IsPublic.js';
import { GetCompanyOrgChartQuery } from '../../company/application/queries/GetCompanyOrgChartQuery.js';
import { PRINT_TOKEN_SERVICE } from '../print.tokens.js';
import { PrintTokenService } from '../services/PrintTokenService.js';

/**
 * Print-payload controller — sibling of `OrgchartExportController`.
 *
 * Split off so it can be **fully public** (`@Public()` at the class level)
 * without sharing a class with routes that need `@ContractScoped()`. That
 * separation eliminates any risk of one endpoint inheriting guards from
 * another through NestJS's metadata merging.
 *
 * Consumers:
 * - Headless Chromium loading `/print/orgchart/:companyId` from the
 *   frontend — the route calls this endpoint to fetch the view model.
 *
 * Auth:
 * - Single-use print JWT, validated by `PrintTokenService`. The JWT
 *   carries the company id, so we cross-check it against the URL param
 *   to prevent a token minted for company A from reading company B.
 */
@ApiTags('company / org-chart export')
@Public()
@Controller('companies')
export class OrgchartPrintPayloadController {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(PRINT_TOKEN_SERVICE) private readonly tokenService: PrintTokenService,
  ) {}

  @ApiOperation({
    summary: 'Read the orgchart view model using a single-use print token',
    description:
      'Internal endpoint called by the print-only frontend route running inside headless Chromium. Bypasses user auth, validates a print JWT, and consumes it on first call.',
  })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Orgchart view model' })
  @ApiResponse({ status: 401, description: 'Invalid or already-used print token' })
  @Get(':id/orgchart/print-payload')
  async getPrintPayload(
    @Param('id') companyId: TCompanyId,
    @Query('token') tokenFromQuery: string | undefined,
    @Headers('x-print-token') tokenFromHeader: string | undefined,
  ): Promise<TCompanyOrgChartViewModel> {
    const token = tokenFromHeader ?? tokenFromQuery;
    if (!token) {
      // Route through the token service so all rejection paths produce
      // a uniform 401 without leaking which check failed.
      this.tokenService.verify('', 'orgchart');
    }

    const payload = this.tokenService.verify(token!, 'orgchart');

    if (payload.companyId !== companyId) {
      // Token minted for a different company — treat as invalid to
      // prevent cross-company peeking via URL manipulation.
      this.tokenService.verify('', 'orgchart');
    }

    return this.queryBus.execute<GetCompanyOrgChartQuery, TCompanyOrgChartViewModel>(
      new GetCompanyOrgChartQuery(companyId),
    );
  }
}
