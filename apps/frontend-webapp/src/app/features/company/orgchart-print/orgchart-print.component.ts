import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  type OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import type {
  TCompanyOrgChartViewModel,
  TOrgNodeHierarchyViewModel,
} from '@sh3pherd/shared-types';
import { ApiURLService } from '../../../core/services/api-url.service';
import { NODE_PALETTE } from '../orgchart-palette';
import type { TOrgchartPdfPaginationMode } from '../orgchart-export.service';

/**
 * Print-only orgchart route.
 *
 * Lives outside the `/app` authenticated shell so that headless Chromium
 * can load it with only a single-use print JWT (no cookies, no localStorage,
 * no AuthGuard). The component is intentionally stripped of every edit
 * affordance — no toolbar, no popover, no drag, no selection. Its single
 * job is to render a high-fidelity, print-optimised snapshot of the live
 * orgchart and flip `window.__sh3_orgchartReady` once everything is ready
 * for `page.pdf()`.
 *
 * ## Data flow
 *
 * 1. Read `token`, `mode`, `cover`, `watermark` from the query string.
 * 2. Call the public `GET /protected/companies/:id/orgchart/print-payload`
 *    endpoint with the token (sent as both query param and header, because
 *    Puppeteer handles one and the other depending on launch mode).
 * 3. Store the returned view model in a signal, paint the layout.
 * 4. After view init, wait for `document.fonts.ready` + image decoding,
 *    then set the global readiness flag.
 *
 * ## Failure surface
 *
 * Any error (invalid token, expired, network failure) renders a plain
 * error block and does NOT set the ready flag. That causes Puppeteer's
 * `waitForFunction` to time out, which the backend catches and surfaces
 * as a 500 to the caller. We deliberately keep the error message generic
 * here because this page could theoretically be opened by a human with
 * a leaked token — we don't want to hand them extra info.
 */
@Component({
  selector: 'app-orgchart-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orgchart-print.component.html',
  styleUrl: './orgchart-print.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgchartPrintComponent implements OnInit, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly urlBuilder = inject(ApiURLService);

  readonly chart = signal<TCompanyOrgChartViewModel | null>(null);
  readonly errorMessage = signal<string | null>(null);

  /** Query params exposed to the template for layout decisions. */
  readonly paginationMode = signal<TOrgchartPdfPaginationMode>('fit');
  readonly watermark = signal<string | null>(null);
  readonly showCover = signal(true);
  readonly renderedAt = new Date();

  /**
   * When the PDF renderer passes `mode=fit`, we inject a CSS variable
   * `--orgchart-scale` so the tree fits into one page. The scale is
   * recomputed after layout using the real bounding box.
   */
  readonly fitScale = signal(1);

  readonly hasChart = computed(() => !!this.chart() && !this.errorMessage());

  ngOnInit(): void {
    const snapshot = this.route.snapshot;
    const companyId = snapshot.paramMap.get('companyId');
    const token = snapshot.queryParamMap.get('token');
    const mode = snapshot.queryParamMap.get('mode') as TOrgchartPdfPaginationMode | null;
    const cover = snapshot.queryParamMap.get('cover');
    const watermark = snapshot.queryParamMap.get('watermark');

    this.paginationMode.set(mode ?? 'fit');
    this.showCover.set(cover === '1' || cover === 'true');
    this.watermark.set(watermark);

    if (!companyId || !token) {
      this.errorMessage.set('Missing company id or print token');
      return;
    }

    this.loadOrgchart(companyId, token);
  }

  ngAfterViewInit(): void {
    // Mark the global readiness flag once the chart is rendered, fonts
    // are ready and images have decoded. If the data load fails, the
    // flag is never set and Puppeteer times out — that's the intended
    // failure mode.
    void this.waitForReady();
  }

  private async waitForReady(): Promise<void> {
    try {
      // Poll until the chart signal is populated or an error is set.
      while (!this.chart() && !this.errorMessage()) {
        await this.delay(30);
      }
      if (this.errorMessage()) return;

      // Wait for web fonts (network + parse) to settle.
      if (typeof document.fonts?.ready?.then === 'function') {
        await document.fonts.ready;
      }

      // Decode every image on the page. Missing/broken avatars resolve
      // to a rejected promise, which we swallow so one dead avatar
      // doesn't block the whole export.
      const images = Array.from(document.images);
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return img
            .decode()
            .catch(() => { /* ignored */ });
        }),
      );

      // Recompute fit-to-page scale now that the tree is laid out.
      if (this.paginationMode() === 'fit') this.applyFitScale();

      // Yield one frame so Angular commits the final computed styles.
      await this.nextFrame();

      (window as unknown as { __sh3_orgchartReady: boolean }).__sh3_orgchartReady = true;
    } catch {
      // Never set the ready flag on failure.
    }
  }

  private loadOrgchart(companyId: string, token: string): void {
    const url = this.urlBuilder
      .apiProtectedRoute('companies')
      .route(`${companyId}/orgchart/print-payload`)
      .build();

    const headers = new HttpHeaders().set('X-Print-Token', token);
    const params = { token };

    this.http
      .get<TCompanyOrgChartViewModel>(url, { headers, params })
      .subscribe({
        next: (data) => this.chart.set(data),
        error: () => this.errorMessage.set('Failed to load orgchart'),
      });
  }

  /**
   * Computes a uniform scale so the tree fits the landscape A3 content area
   * (~400mm × 280mm minus margins). Reads the rendered tree's bounding
   * box to stay accurate for arbitrary tree shapes.
   */
  private applyFitScale(): void {
    const host = document.querySelector<HTMLElement>('.print-orgchart-tree');
    const page = document.querySelector<HTMLElement>('.print-page--chart');
    if (!host || !page) return;
    const pageWidth = page.clientWidth || 1;
    const pageHeight = page.clientHeight || 1;
    const treeWidth = host.scrollWidth || host.clientWidth || 1;
    const treeHeight = host.scrollHeight || host.clientHeight || 1;
    if (treeWidth === 0 || treeHeight === 0) return;
    const horizontal = pageWidth / treeWidth;
    const vertical = pageHeight / treeHeight;
    const scale = Math.min(1, horizontal, vertical);
    this.fitScale.set(scale);
  }

  // ── Template helpers ───────────────────────────────────────

  /** Returns the list of root nodes in display order, archived filtered out. */
  visibleRoots(): TOrgNodeHierarchyViewModel[] {
    const chart = this.chart();
    if (!chart) return [];
    return chart.rootNodes.filter((n) => n.status !== 'archived');
  }

  /**
   * Returns the root color for a given node — follows the same inheritance
   * as the runtime tab (root owns a palette colour, descendants inherit).
   */
  getRootColor(node: TOrgNodeHierarchyViewModel): string {
    return node.color || NODE_PALETTE[0];
  }

  /**
   * Computes the card background colour for a given depth, mixing the
   * root colour with a dark base. Mirrors the runtime `color-mix` call
   * but outputs a hex string so Chromium prints it faithfully regardless
   * of `color-mix` support in the print media query.
   */
  getNodeBackground(
    node: TOrgNodeHierarchyViewModel,
    depth: number,
    rootColor: string,
  ): string {
    const base = depth === 0 ? node.color || rootColor : rootColor;
    const ratio = depth === 0 ? 0.75 : Math.max(0.25, 0.7 - depth * 0.15);
    return this.mixHex(base, '#1a1f29', ratio);
  }

  getBorderColor(node: TOrgNodeHierarchyViewModel, rootColor: string): string {
    return node.color || rootColor;
  }

  /** Concatenated directors + managers for a node, lightly formatted. */
  getNodeLeaders(node: TOrgNodeHierarchyViewModel): Array<{ name: string; role: string }> {
    const leaderRoles = new Set(['director', 'manager']);
    const members = (node.members ?? [])
      .filter((m) => leaderRoles.has(m.team_role))
      .map((m) => ({
        name: `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim() || m.user_id,
        role: m.team_role === 'director' ? 'Dir.' : 'Mgr.',
      }));
    const guests = (node.guest_members ?? [])
      .filter((g) => leaderRoles.has(g.team_role))
      .map((g) => ({
        name: g.display_name,
        role: g.team_role === 'director' ? 'Dir.' : 'Mgr.',
      }));
    return [...members, ...guests];
  }

  /** Total active members across the whole subtree. */
  totalMembers(node: TOrgNodeHierarchyViewModel): number {
    const self = (node.members?.length ?? 0) + (node.guest_members?.length ?? 0);
    const children = (node.children ?? []).reduce(
      (acc, child) => acc + this.totalMembers(child),
      0,
    );
    return self + children;
  }

  /** Counts every node (including all descendants) — used on the cover page. */
  countAllNodes(): number {
    const walk = (list: TOrgNodeHierarchyViewModel[]): number =>
      list.reduce((acc, n) => acc + 1 + walk(n.children ?? []), 0);
    return walk(this.visibleRoots());
  }

  /** Counts every unique member across the whole company — cover page metric. */
  countAllMembers(): number {
    const seen = new Set<string>();
    const walk = (list: TOrgNodeHierarchyViewModel[]): void => {
      for (const node of list) {
        for (const m of node.members ?? []) seen.add(`m:${m.user_id}`);
        for (const g of node.guest_members ?? []) seen.add(`g:${g.id}`);
        walk(node.children ?? []);
      }
    };
    walk(this.visibleRoots());
    return seen.size;
  }

  trackById = (_index: number, node: TOrgNodeHierarchyViewModel): string => node.id;

  // ── Utilities ──────────────────────────────────────────────

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private nextFrame(): Promise<void> {
    return new Promise((r) => requestAnimationFrame(() => r()));
  }

  private mixHex(a: string, b: string, ratio: number): string {
    const pa = this.parseHex(a);
    const pb = this.parseHex(b);
    if (!pa || !pb) return a;
    const r = Math.round(pa.r * ratio + pb.r * (1 - ratio));
    const g = Math.round(pa.g * ratio + pb.g * (1 - ratio));
    const bl = Math.round(pa.b * ratio + pb.b * (1 - ratio));
    return `#${this.toHex(r)}${this.toHex(g)}${this.toHex(bl)}`;
  }

  private parseHex(value: string): { r: number; g: number; b: number } | null {
    const match = /^#([0-9a-f]{6})$/i.exec(value);
    if (!match) return null;
    const int = parseInt(match[1], 16);
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
  }

  private toHex(value: number): string {
    return Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0');
  }
}
