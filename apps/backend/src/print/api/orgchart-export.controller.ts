import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Res,
} from '@nestjs/common';
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
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { ORGCHART_PDF_SERVICE } from '../print.tokens.js';
import { OrgchartPdfService } from '../services/OrgchartPdfService.js';
import type {
  TOrgchartPdfExportOptions,
  TOrgchartPdfPaginationMode,
  TOrgchartPdfPaperFormat,
} from '../services/OrgchartPdfService.js';

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
 * Authenticated orgchart export endpoint.
 *
 * ## Guard ordering — why `@ContractScoped()` is on the CLASS, not the method
 *
 * NestJS's `extendArrayMetadata` appends when decorators stack, and method
 * decorators apply bottom-up. Stacking
 *
 *     @ContractScoped()
 *     @RequirePermission(...)
 *     @Post(...)
 *
 * produces a guard array `[PermissionGuard, ContractContextGuard]`, which
 * runs PermissionGuard FIRST — before ContractContextGuard has populated
 * `req.contract_roles`. The result is a guaranteed 403.
 *
 * Class-level guards always run before method-level guards in NestJS, so
 * moving `@ContractScoped()` to the class gives us the right order
 * (ContractContextGuard first, PermissionGuard second). That's why the
 * print-payload endpoint — which is `@Public()` and not contract-scoped —
 * lives on a separate controller: splitting is safer than per-method
 * guard juggling.
 */
@ApiTags('company / org-chart export')
@ApiBearerAuth('bearer')
@ContractScoped()
@Controller('companies')
export class OrgchartExportController {
  private readonly logger = new Logger(OrgchartExportController.name);

  constructor(
    @Inject(ORGCHART_PDF_SERVICE) private readonly pdfService: OrgchartPdfService,
  ) {}

  @ApiOperation({ summary: 'Export the company org chart as a PDF' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiBody({ type: OrgchartExportRequestDto, required: false })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF stream' })
  @ApiResponse({ status: 400, description: 'Invalid pagination / format' })
  @ApiResponse({ status: 500, description: 'Puppeteer render failed' })
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
      const message = (err as Error).message ?? 'unknown';
      // Log the message at ERROR and the stack at DEBUG so ops pipelines
      // can alert on the short line while developers get the full trace
      // when the logger is turned up.
      this.logger.error(`orgchart export failed company=${companyId}: ${message}`);
      if ((err as Error).stack) {
        this.logger.debug((err as Error).stack);
      }
      throw new InternalServerErrorException(`Failed to render orgchart PDF: ${message}`);
    }
  }

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
