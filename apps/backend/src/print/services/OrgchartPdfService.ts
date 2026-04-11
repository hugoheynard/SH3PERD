import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PDFOptions, PaperFormat } from 'puppeteer';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { PRINT_TOKEN_SERVICE, PUPPETEER_POOL_SERVICE } from '../print.tokens.js';
import { PrintTokenService } from './PrintTokenService.js';
import { PuppeteerPoolService } from './PuppeteerPoolService.js';

/**
 * Pagination strategies exposed to the client.
 *
 * - `fit` — scale the whole orgchart to a single landscape page. The
 *   default — readable for small/medium charts (<40 leaf nodes).
 * - `by-root` — one page per root node + a cover page with the full chart
 *   scaled down. Use for charts too wide for a single sheet.
 * - `poster` — render at natural size and let Chromium paginate with
 *   `page-break-inside: avoid` on node cards. Use for big A2/A1 prints.
 */
export type TOrgchartPdfPaginationMode = 'fit' | 'by-root' | 'poster';

/**
 * Paper format accepted by the export endpoint. Matches Chromium's
 * supported names so we pass them straight through to `page.pdf()`.
 */
export type TOrgchartPdfPaperFormat = 'A4' | 'A3' | 'A2' | 'A1' | 'Letter' | 'Legal';

export interface TOrgchartPdfExportOptions {
  companyId: TCompanyId;
  actorId: TUserId;
  pagination?: TOrgchartPdfPaginationMode;
  format?: TOrgchartPdfPaperFormat;
  landscape?: boolean;
  /** When true, renders headers/footers (date + page numbers). Default: true. */
  withHeaderFooter?: boolean;
  /** Optional watermark text baked into the print layout. */
  watermark?: string;
  /** When true, adds a cover page with company info + date. Default: true. */
  withCoverPage?: boolean;
}

export interface TOrgchartPdfResult {
  buffer: Buffer;
  /** Number of pages in the output — derived from PDF object count. */
  pageCount: number;
  /** Pagination mode actually used (falls back if the input was invalid). */
  pagination: TOrgchartPdfPaginationMode;
  /** Paper format used. */
  format: TOrgchartPdfPaperFormat;
}

@Injectable()
export class OrgchartPdfService {
  private readonly logger = new Logger(OrgchartPdfService.name);
  private readonly frontendUrl: string;
  private readonly pageTimeoutMs: number;
  private readonly readyTimeoutMs: number;

  constructor(
    private readonly config: ConfigService,
    @Inject(PRINT_TOKEN_SERVICE) private readonly tokenService: PrintTokenService,
    @Inject(PUPPETEER_POOL_SERVICE) private readonly pool: PuppeteerPoolService,
  ) {
    this.frontendUrl = this.config.get<string>('frontendUrl', 'http://localhost:4200');
    const printConfig = this.config.get<{ pageTimeoutMs: number; readySignalTimeoutMs: number }>('print');
    this.pageTimeoutMs = printConfig?.pageTimeoutMs ?? 30_000;
    this.readyTimeoutMs = printConfig?.readySignalTimeoutMs ?? 20_000;
  }

  /**
   * Renders the full orgchart of `companyId` to a PDF buffer.
   *
   * Steps:
   * 1. Mint a single-use print JWT scoped to `orgchart`.
   * 2. Open a pooled browser page, navigate to the print-only frontend
   *    route with the token as a query parameter.
   * 3. Wait for `window.__sh3_orgchartReady === true`, which the print
   *    component sets after the orgchart is loaded, fonts are ready and
   *    all avatars have resolved (or failed gracefully).
   * 4. Inject the pagination mode through `document.body.dataset` so the
   *    CSS can respond — no page navigation needed.
   * 5. Call `page.pdf()` with the right format, header/footer templates
   *    and the user-selected options.
   *
   * All errors are wrapped with a log entry that carries `companyId` but
   * never the token itself — the print JWT must never land in logs.
   */
  async renderOrgchart(opts: TOrgchartPdfExportOptions): Promise<TOrgchartPdfResult> {
    const pagination: TOrgchartPdfPaginationMode = opts.pagination ?? 'fit';
    const format: TOrgchartPdfPaperFormat = opts.format ?? (pagination === 'poster' ? 'A2' : 'A3');
    const landscape = opts.landscape ?? true;
    const withHeaderFooter = opts.withHeaderFooter ?? true;
    const withCoverPage = opts.withCoverPage ?? true;

    const token = this.tokenService.sign('orgchart', opts.companyId, opts.actorId);

    const url = new URL(`/print/orgchart/${opts.companyId}`, this.frontendUrl);
    url.searchParams.set('token', token);
    url.searchParams.set('mode', pagination);
    if (withCoverPage) url.searchParams.set('cover', '1');
    if (opts.watermark) url.searchParams.set('watermark', opts.watermark);

    const buffer = await this.pool.withPage(async (page) => {
      // ── Diagnostics ────────────────────────────────────────────
      // Mirror the page's console, JS errors, and failed network
      // requests into the backend logger. Without these, a broken
      // render produces a generic `waitForFunction` timeout with no
      // visibility into what actually went wrong inside Chromium.
      page.on('console', (msg) => {
        const type = msg.type();
        if (type === 'error' || type === 'warn') {
          this.logger.warn(`[page:${type}] ${msg.text()}`);
        }
      });
      page.on('pageerror', (err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`[page:error] ${message}`);
      });
      page.on('requestfailed', (req) => {
        this.logger.warn(
          `[page:requestfailed] ${req.method()} ${req.url()} — ${req.failure()?.errorText ?? 'unknown'}`,
        );
      });
      page.on('response', (response) => {
        const status = response.status();
        if (status >= 400) {
          this.logger.warn(`[page:response ${status}] ${response.url()}`);
        }
      });

      // Print-media emulation forces Chromium to pick the @media print
      // stylesheet branches — mandatory for our print-only layout.
      await page.emulateMediaType('print');

      // Propagate the pool timeout policy to the page navigation.
      page.setDefaultNavigationTimeout(this.pageTimeoutMs);
      page.setDefaultTimeout(this.pageTimeoutMs);

      // `domcontentloaded` (not `networkidle0`) — Angular dev mode keeps
      // an HMR WebSocket open permanently, which means the network never
      // idles and `networkidle0` would always time out in dev. Production
      // behaves the same way any time a long-lived connection (analytics,
      // service worker, SSE) is involved, so relying on the DOM event is
      // the portable choice. The real readiness gate is the explicit
      // `__sh3_orgchartReady` flag below, which the print component sets
      // after data load + fonts + image decoding.
      await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });

      // Wait for the print component to flag itself as ready.
      await page.waitForFunction(
        '(window).__sh3_orgchartReady === true',
        { timeout: this.readyTimeoutMs },
      );

      const pdfOptions = this.buildPdfOptions({
        format,
        landscape,
        withHeaderFooter,
        companyId: opts.companyId,
        pagination,
      });

      const output = await page.pdf(pdfOptions);
      // puppeteer returns Uint8Array under some type defs, force Buffer
      // so downstream (res.send, fs.writeFile) stays uniform.
      return Buffer.isBuffer(output) ? output : Buffer.from(output);
    });

    const pageCount = this.countPdfPages(buffer);

    this.logger.log(
      `orgchart export done company=${opts.companyId} pages=${pageCount} mode=${pagination} format=${format}`,
    );

    return { buffer, pageCount, pagination, format };
  }

  // ── PDF option builders ─────────────────────────────────────────

  private buildPdfOptions(input: {
    format: TOrgchartPdfPaperFormat;
    landscape: boolean;
    withHeaderFooter: boolean;
    companyId: TCompanyId;
    pagination: TOrgchartPdfPaginationMode;
  }): PDFOptions {
    const base: PDFOptions = {
      format: input.format as PaperFormat,
      landscape: input.landscape,
      printBackground: true,
      preferCSSPageSize: true,
      // Reasonable default margins — the print layout overrides them
      // via @page { margin } when needed.
      margin: { top: '10mm', bottom: '14mm', left: '10mm', right: '10mm' },
      displayHeaderFooter: input.withHeaderFooter,
    };

    if (input.withHeaderFooter) {
      const now = new Date().toISOString().slice(0, 10);
      base.headerTemplate = `
        <div style="font-family: -apple-system, system-ui, sans-serif; font-size: 8px; color: #888; width: 100%; padding: 0 10mm; display: flex; justify-content: space-between;">
          <span>SH3PHERD — Org chart</span>
          <span>${this.escapeHtml(input.companyId)}</span>
          <span>${now}</span>
        </div>`;
      base.footerTemplate = `
        <div style="font-family: -apple-system, system-ui, sans-serif; font-size: 8px; color: #888; width: 100%; padding: 0 10mm; display: flex; justify-content: space-between;">
          <span>${this.escapeHtml(input.pagination)}</span>
          <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>`;
    }

    return base;
  }

  /**
   * Counts pages in a PDF buffer by scanning for the `/Type /Page` object
   * markers. Avoids adding a full PDF parser dependency for a telemetry-only
   * value. Not 100% accurate for malformed PDFs but robust for Chromium
   * output, which is always well-formed.
   */
  private countPdfPages(buffer: Buffer): number {
    const str = buffer.toString('latin1');
    const matches = str.match(/\/Type\s*\/Page[^s]/g);
    return matches ? matches.length : 1;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
