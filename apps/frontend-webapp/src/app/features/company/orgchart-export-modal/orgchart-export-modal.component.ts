import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { TCompanyId, TCompanyOrgChartViewModel } from '@sh3pherd/shared-types';
import { ToastService } from '../../../shared/toast/toast.service';
import {
  OrgchartExportService,
  type TOrgchartPdfPaginationMode,
  type TOrgchartPdfPaperFormat,
} from '../orgchart-export.service';
import { OrgchartSvgExporter } from '../orgchart-svg-exporter';

/**
 * Orgchart export modal.
 *
 * Presents the three export formats (PDF fit / PDF by-root / PDF poster
 * / SVG vector) with a short description each, plus the PDF options
 * (paper format, cover page, header/footer, watermark). Runs the export
 * on confirm and reports back via the `closed` output so the parent
 * can tear the modal down.
 *
 * The modal is intentionally self-contained — no global dialog service
 * — because the orgchart tab already owns a `moveModalNode` pattern for
 * its move-to dialog and this keeps the two modals consistent.
 */
@Component({
  selector: 'app-orgchart-export-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orgchart-export-modal.component.html',
  styleUrl: './orgchart-export-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgchartExportModalComponent {
  private readonly exportService = inject(OrgchartExportService);
  private readonly toast = inject(ToastService);

  readonly companyId = input.required<TCompanyId>();
  readonly companyName = input<string>('');
  readonly chart = input<TCompanyOrgChartViewModel | null>(null);

  readonly closed = output<void>();

  // Selected export mode — includes an extra 'svg' value for the sidecar.
  readonly selectedMode = signal<'fit' | 'by-root' | 'poster' | 'svg'>('fit');

  // PDF-specific options
  readonly format = signal<TOrgchartPdfPaperFormat>('A3');
  readonly landscape = signal(true);
  readonly withCoverPage = signal(true);
  readonly withHeaderFooter = signal(true);
  readonly watermark = signal('');

  // UI state
  readonly running = signal(false);

  // Derived labels
  readonly isSvgMode = computed(() => this.selectedMode() === 'svg');
  readonly paginationMode = computed<TOrgchartPdfPaginationMode>(() => {
    const mode = this.selectedMode();
    return mode === 'svg' ? 'fit' : mode;
  });

  readonly formatOptions: readonly TOrgchartPdfPaperFormat[] = [
    'A4', 'A3', 'A2', 'A1', 'Letter', 'Legal',
  ];

  // ── Actions ────────────────────────────────────────────────

  selectMode(mode: 'fit' | 'by-root' | 'poster' | 'svg'): void {
    this.selectedMode.set(mode);
    // Auto-pick a sensible paper format per mode.
    if (mode === 'fit') this.format.set('A3');
    if (mode === 'by-root') this.format.set('A3');
    if (mode === 'poster') this.format.set('A2');
  }

  onWatermarkInput(event: Event): void {
    this.watermark.set((event.target as HTMLInputElement).value);
  }

  cancel(): void {
    if (this.running()) return;
    this.closed.emit();
  }

  confirm(): void {
    if (this.running()) return;

    if (this.isSvgMode()) {
      this.runSvgExport();
      return;
    }

    this.runPdfExport();
  }

  // ── Runners ────────────────────────────────────────────────

  private runPdfExport(): void {
    const companyId = this.companyId();
    const watermark = this.watermark().trim();
    this.running.set(true);

    this.exportService
      .exportOrgchartPdf(companyId, {
        pagination: this.paginationMode(),
        format: this.format(),
        landscape: this.landscape(),
        withHeaderFooter: this.withHeaderFooter(),
        withCoverPage: this.withCoverPage(),
        watermark: watermark || undefined,
      })
      .subscribe({
        next: (result) => {
          const safeName = this.slugify(this.companyName() || companyId);
          const date = new Date().toISOString().slice(0, 10);
          const filename = `orgchart-${safeName}-${date}.pdf`;
          this.exportService.downloadBlob(result.blob, filename);
          this.toast.show(`PDF exported (${result.pages} page${result.pages === 1 ? '' : 's'})`, 'success');
          this.running.set(false);
          this.closed.emit();
        },
        error: () => {
          this.toast.show('Failed to export orgchart PDF', 'error');
          this.running.set(false);
        },
      });
  }

  private runSvgExport(): void {
    const chart = this.chart();
    if (!chart) {
      this.toast.show('Orgchart not loaded yet', 'error');
      return;
    }
    this.running.set(true);
    try {
      const exporter = new OrgchartSvgExporter();
      const blob = exporter.toBlob(chart);
      const safeName = this.slugify(this.companyName() || this.companyId());
      const filename = `orgchart-${safeName}.svg`;
      this.exportService.downloadBlob(blob, filename);
      this.toast.show('SVG exported', 'success');
      this.running.set(false);
      this.closed.emit();
    } catch {
      this.toast.show('Failed to export orgchart SVG', 'error');
      this.running.set(false);
    }
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40) || 'company';
  }
}
