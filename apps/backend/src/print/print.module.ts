import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CompanyHandlersModule } from '../company/company-handlers.module.js';
import { OrgchartExportController } from './api/orgchart-export.controller.js';
import { OrgchartPrintPayloadController } from './api/orgchart-print-payload.controller.js';
import { OrgchartPdfService } from './services/OrgchartPdfService.js';
import { PrintTokenService } from './services/PrintTokenService.js';
import { PuppeteerPoolService } from './services/PuppeteerPoolService.js';
import {
  ORGCHART_PDF_SERVICE,
  PRINT_TOKEN_SERVICE,
  PUPPETEER_POOL_SERVICE,
} from './print.tokens.js';

/**
 * Print module — owns the headless-rendering stack (Puppeteer pool, print
 * JWTs) and the orgchart export endpoint.
 *
 * Kept independent of the `CompanyModule` controllers so:
 * - The print surface can be switched off in environments without Chromium
 *   (e.g. a lightweight API worker) by simply not importing this module.
 * - The CompanyModule doesn't inherit a transitive dependency on Puppeteer.
 *
 * Imports `CompanyHandlersModule` for access to `GetCompanyOrgChartQuery`
 * via `QueryBus` — that's the only cross-module coupling.
 */
@Module({
  imports: [CqrsModule, CompanyHandlersModule],
  controllers: [OrgchartExportController, OrgchartPrintPayloadController],
  providers: [
    { provide: PRINT_TOKEN_SERVICE, useClass: PrintTokenService },
    { provide: PUPPETEER_POOL_SERVICE, useClass: PuppeteerPoolService },
    { provide: ORGCHART_PDF_SERVICE, useClass: OrgchartPdfService },
  ],
  exports: [PRINT_TOKEN_SERVICE, PUPPETEER_POOL_SERVICE, ORGCHART_PDF_SERVICE],
})
export class PrintModule {}
