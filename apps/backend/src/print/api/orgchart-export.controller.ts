import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { P } from '@sh3pherd/shared-types';
import type {
  TCompanyId,
  TCompanyOrgChartViewModel,
  TUserId,
} from '@sh3pherd/shared-types';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { Public } from '../../utils/nest/decorators/IsPublic.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { GetCompanyOrgChartQuery } from '../../company/application/queries/GetCompanyOrgChartQuery.js';
import { ORGCHART_PDF_SERVICE, PRINT_TOKEN_SERVICE } from '../print.tokens.js';
import { OrgchartPdfService } from '../services/OrgchartPdfService.js';
import type {
  TOrgchartPdfExportOptions,
  TOrgchartPdfPaginationMode,
  TOrgchartPdfPaperFormat,
} from '../services/OrgchartPdfService.js';
import { PrintTokenService } from '../services/PrintTokenService.js';

/**
 * Request shape accepted by `POST /companies/:id/orgchart/export`.
 * Kept deliberately narrow — the server owns the layout, the client
 * only expresses intent.
 */
export class OrgchartExportRequestDto {
  pagination?: TOrgchartPdfPaginationMode;
  format?: TOrgchartPdfPaperFormat;
  landscape?: boolean;
  withHeaderFooter?: boolean;
  withCoverPage?: boolean;
  watermark?: string;
}

const VALID_PAGINATION: ReadonlyArray<TOrgchartPdfPaginationMode> = ['fit', 'by-root', 'poster'];
const VALID_FORMATS: ReadonlyArray<TOrgchartPdfPaperFormat> = ['A4', 'A3', 'A2', 'A1', 'Letter', 'Legal'];

/**
 * Orgchart export controller — exposes two distinct surfaces:
 *
 * 1. `POST /companies/:id/orgchart/export` (authenticated, contract-scoped)
 *    — the client-facing entry point. Issues a single-use print token and
 *    streams the rendered PDF back as an `application/pdf` response.
 *
 * 2. `GET /companies/:id/orgchart/print-payload` (public, print-token auth)
 *    — the read endpoint the print-only frontend route calls from inside
 *    headless Chromium. Returns the same orgchart view model as the
 *    authenticated endpoint but validates a print JWT instead of a user
 *    session, so Puppeteer doesn't need any cookies.
 *
 * Keeping both endpoints on the same controller co-locates security
 * reasoning and makes it easy to verify invariants at a glance.
 */
@ApiTags('company / org-chart export')
@Controller('companies')
export class OrgchartExportController {
  private readonly logger = new Logger(OrgchartExportController.name);

  constructor(
    private readonly queryBus: QueryBus,
    @Inject(ORGCHART_PDF_SERVICE) private readonly pdfService: OrgchartPdfService,
    @Inject(PRINT_TOKEN_SERVICE) private readonly tokenService: PrintTokenService,
  ) {}

  // ── 1. Authenticated export endpoint ──────────────────────────────

  @ApiOperation({ summary: 'Export the company org chart as a PDF' })
  @ApiBearerAuth('bearer')
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiBody({ type: OrgchartExportRequestDto, required: false })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF stream' })
  @ApiResponse({ status: 400, description: 'Invalid pagination / format' })
  @ApiResponse({ status: 500, description: 'Puppeteer render failed' })
  @ContractScoped()
  @RequirePermission(P.Company.OrgChart.Read)
  @Post(':id/orgchart/export')
  async exportOrgchart(
    @Param('id') companyId: TCompanyId,
    @ActorId() actorId: TUserId,
    @Body() body: OrgchartExportRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    const options = this.validateOptions(body);

    try {
      const result = await this.pdfService.renderOrgchart({
        companyId,
        actorId,
        ...options,
      } satisfies TOrgchartPdfExportOptions);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="orgchart-${companyId}-${new Date().toISOString().slice(0, 10)}.pdf"`,
      );
      res.setHeader('X-Orgchart-Pages', result.pageCount.toString());
      res.setHeader('X-Orgchart-Pagination', result.pagination);
      res.setHeader('X-Orgchart-Format', result.format);
      res.setHeader('Content-Length', result.buffer.length.toString());
      res.send(result.buffer);
    } catch (err) {
      this.logger.error(
        `orgchart export failed company=${companyId}: ${(err as Error).message}`,
      );
      throw new InternalServerErrorException('Failed to render orgchart PDF');
    }
  }

  // ── 2. Print-only payload (consumed by headless Chromium) ─────────

  @ApiOperation({
    summary: 'Read the orgchart view model using a single-use print token',
    description:
      'Internal endpoint called by the print-only frontend route running inside headless Chromium. Bypasses user auth, validates a print JWT instead, and consumes it on first call (single-use).',
  })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Orgchart view model' })
  @ApiResponse({ status: 401, description: 'Invalid or already-used print token' })
  @Public()
  @Get(':id/orgchart/print-payload')
  async getPrintPayload(
    @Param('id') companyId: TCompanyId,
    @Query('token') tokenFromQuery: string | undefined,
    @Headers('x-print-token') tokenFromHeader: string | undefined,
  ): Promise<TCompanyOrgChartViewModel> {
    const token = tokenFromHeader ?? tokenFromQuery;
    if (!token) {
      // Raise through PrintTokenService so the error surface is uniform.
      this.tokenService.verify('', 'orgchart');
    }

    const payload = this.tokenService.verify(token!, 'orgchart');

    if (payload.companyId !== companyId) {
      // Token was minted for a different company — treat as invalid to
      // prevent cross-company peeking via a forged path segment.
      this.tokenService.verify('', 'orgchart');
    }

    const orgchart = await this.queryBus.execute<
      GetCompanyOrgChartQuery,
      TCompanyOrgChartViewModel
    >(new GetCompanyOrgChartQuery(companyId));

    return orgchart;
  }

  // ── Validation helpers ─────────────────────────────────────────

  private validateOptions(body: OrgchartExportRequestDto): Omit<TOrgchartPdfExportOptions, 'companyId' | 'actorId'> {
    if (body.pagination && !VALID_PAGINATION.includes(body.pagination)) {
      throw new BadRequestException(`Invalid pagination mode: ${body.pagination}`);
    }
    if (body.format && !VALID_FORMATS.includes(body.format)) {
      throw new BadRequestException(`Invalid paper format: ${body.format}`);
    }
    if (body.watermark && body.watermark.length > 120) {
      throw new BadRequestException('Watermark too long');
    }
    return {
      pagination: body.pagination,
      format: body.format,
      landscape: body.landscape,
      withHeaderFooter: body.withHeaderFooter,
      withCoverPage: body.withCoverPage,
      watermark: body.watermark,
    };
  }
}
