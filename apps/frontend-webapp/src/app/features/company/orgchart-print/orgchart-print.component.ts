import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  type OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import type {
  TCompanyId,
  TCompanyOrgChartViewModel,
} from '@sh3pherd/shared-types';
import { ApiURLService } from '../../../core/services/api-url.service';
import { OrgChartStore } from '../orgchart.store';
import { OrgchartTabComponent } from '../company-detail-page/orgchart-tab/orgchart-tab.component';
import type { TOrgchartPdfPaginationMode } from '../orgchart-export.service';

/**
 * Print-only orgchart route — thin wrapper around `OrgchartTabComponent`.
 *
 * ## Architecture
 *
 * This component does almost nothing on its own. It exists to:
 *
 * 1. Parse the query parameters minted by the backend export service
 *    (`token`, `mode`, `cover`, `watermark`).
 * 2. Fetch the orgchart view model from the public `print-payload`
 *    endpoint using the single-use print JWT.
 * 3. Inject the view model into `OrgChartStore.setOrgChartDirect` so the
 *    downstream live component reads the exact same data source it uses
 *    in the authenticated `/app/company/:id` view.
 * 4. Render `<app-orgchart-tab [printMode]="true" />` — the real
 *    orgchart tab, in read-only mode. The tab auto-expands every node
 *    via an internal effect when `printMode` is on.
 * 5. After data load, fonts (`document.fonts.ready`) and image decoding
 *    have all settled, set `window.__sh3_orgchartReady = true` so the
 *    backend's Puppeteer pool knows it can call `page.pdf()`.
 *
 * ## Why not duplicate the layout here?
 *
 * The previous iteration of this component reimplemented a simplified
 * orgchart layout from scratch. That produced a PDF that didn't match
 * the live UI — wrong gaps, wrong colour mixing, missing badges,
 * divergent typography. By reusing the live `OrgchartTabComponent`
 * directly, the PDF becomes literally "the live orgchart tab, rendered
 * in a Chromium window sized like a print page". Pixel-identical by
 * construction.
 *
 * ## SSR
 *
 * Angular SSR is enabled on this project. The first pass runs on the
 * server, where the auth interceptor returns `EMPTY` for protected
 * URLs (no token) — which would leave our HTTP call pending and
 * deadlock SSR's stability gate. We short-circuit both the HTTP call
 * and the readiness loop when `isPlatformBrowser` is false. The
 * skeleton is flushed immediately, Vite sends HTML to Puppeteer,
 * Chromium hydrates, and the real load happens browser-side.
 */
@Component({
  selector: 'app-orgchart-print',
  standalone: true,
  imports: [CommonModule, OrgchartTabComponent],
  templateUrl: './orgchart-print.component.html',
  styleUrl: './orgchart-print.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgchartPrintComponent implements OnInit, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly urlBuilder = inject(ApiURLService);
  /** Exposed as `protected` so the template can read the company name for the cover page. */
  protected readonly store = inject(OrgChartStore);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly companyId = signal<TCompanyId | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly paginationMode = signal<TOrgchartPdfPaginationMode>('fit');
  readonly watermark = signal<string | null>(null);
  readonly showCover = signal(true);
  readonly renderedAt = new Date();

  /** True once the chart has been loaded into the store. */
  readonly chartLoaded = signal(false);

  readonly isReady = computed(() => this.chartLoaded() && !this.errorMessage());

  ngOnInit(): void {
    const snapshot = this.route.snapshot;
    const companyId = snapshot.paramMap.get('companyId') as TCompanyId | null;
    const token = snapshot.queryParamMap.get('token');
    const mode = snapshot.queryParamMap.get('mode') as TOrgchartPdfPaginationMode | null;
    const cover = snapshot.queryParamMap.get('cover');
    const watermark = snapshot.queryParamMap.get('watermark');

    this.companyId.set(companyId);
    this.paginationMode.set(mode ?? 'fit');
    this.showCover.set(cover === '1' || cover === 'true');
    this.watermark.set(watermark);

    // SSR: bail out so the render stabilises immediately. Hydration
    // re-runs `ngOnInit` in the browser with real HTTP access.
    if (!this.isBrowser) return;

    if (!companyId || !token) {
      this.errorMessage.set('Missing company id or print token');
      return;
    }

    this.loadOrgchart(companyId, token);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    void this.waitForReady();
  }

  private loadOrgchart(companyId: TCompanyId, token: string): void {
    const url = this.urlBuilder
      .apiProtectedRoute('companies')
      .route(`${companyId}/orgchart/print-payload`)
      .build();

    // Bypass the auth interceptor: Puppeteer's Chromium has no session,
    // and the backend endpoint validates the print JWT directly via
    // `PrintTokenService` (bypassing `AuthGuard` via `@Public()`).
    const headers = new HttpHeaders()
      .set('X-Print-Token', token)
      .set('X-Skip-Auth', '1');
    const params = { token };

    this.http
      .get<TCompanyOrgChartViewModel>(url, { headers, params })
      .subscribe({
        next: (data) => {
          this.store.setOrgChartDirect(data);
          this.chartLoaded.set(true);
        },
        error: (err) => {
          // eslint-disable-next-line no-console
          console.error('[orgchart-print] load failed', err?.status, err?.message);
          this.errorMessage.set(`Failed to load orgchart (${err?.status ?? 'unknown'})`);
        },
      });
  }

  /**
   * Walks the readiness checklist and sets the global flag once the
   * whole chain is green. Each step silently swallows its failure to
   * keep one flaky resource from blocking the export forever.
   */
  private async waitForReady(): Promise<void> {
    try {
      // Wait for data load (or an explicit error).
      while (!this.chartLoaded() && !this.errorMessage()) {
        await this.delay(30);
      }
      if (this.errorMessage()) return;

      // Wait for web fonts.
      if (typeof document.fonts?.ready?.then === 'function') {
        await document.fonts.ready;
      }

      // Decode every image on the page so avatars and SVGs are ready.
      const images = Array.from(document.images);
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return img.decode().catch(() => { /* ignored */ });
        }),
      );

      // Give Angular one frame to commit the final layout after the
      // print-mode auto-expand effect populates `expandedNodes`.
      await this.nextFrame();
      await this.nextFrame();

      (window as unknown as { __sh3_orgchartReady: boolean }).__sh3_orgchartReady = true;
    } catch {
      // Never set the ready flag on failure.
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private nextFrame(): Promise<void> {
    return new Promise((r) => requestAnimationFrame(() => r()));
  }
}
