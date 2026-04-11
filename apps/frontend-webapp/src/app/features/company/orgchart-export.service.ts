import { inject, Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseHttpService } from '../../core/services/BaseHttpService';
import { UserContextService } from '../../core/services/user-context.service';
import type { TCompanyId } from '@sh3pherd/shared-types';

/**
 * Pagination strategies recognised by the backend PDF renderer.
 * Mirrors `TOrgchartPdfPaginationMode` on the server.
 */
export type TOrgchartPdfPaginationMode = 'fit' | 'by-root' | 'poster';

/**
 * Paper formats accepted by the backend — kept as a closed union so the
 * UI can render a dropdown without duplicating the list.
 */
export type TOrgchartPdfPaperFormat = 'A4' | 'A3' | 'A2' | 'A1' | 'Letter' | 'Legal';

export interface TOrgchartPdfExportRequest {
  pagination?: TOrgchartPdfPaginationMode;
  format?: TOrgchartPdfPaperFormat;
  landscape?: boolean;
  withHeaderFooter?: boolean;
  withCoverPage?: boolean;
  watermark?: string;
}

/**
 * Metadata returned alongside the PDF blob. Values are pulled from the
 * `X-Orgchart-*` response headers the backend sets.
 */
export interface TOrgchartPdfExportResult {
  blob: Blob;
  pages: number;
  pagination: TOrgchartPdfPaginationMode;
  format: TOrgchartPdfPaperFormat;
}

/**
 * Drives the orgchart PDF export:
 * - POSTs to `companies/:id/orgchart/export`
 * - Consumes the response as a `Blob` (never as text)
 * - Surfaces pagination metadata from `X-Orgchart-*` headers
 * - Offers a `downloadBlob` helper to save to disk
 *
 * The client-side SVG exporter (`OrgchartSvgExporter`) is separate and
 * requires no network call.
 */
@Injectable({ providedIn: 'root' })
export class OrgchartExportService extends BaseHttpService {
  private readonly userCtx = inject(UserContextService);

  exportOrgchartPdf(
    companyId: TCompanyId,
    body: TOrgchartPdfExportRequest,
  ): Observable<TOrgchartPdfExportResult> {
    const url = this.UrlBuilder.apiProtectedRoute('companies')
      .route(`${companyId}/orgchart/export`)
      .build();

    const contractId = this.userCtx.currentContractId();
    let headers = new HttpHeaders();
    if (contractId) headers = headers.set('X-Contract-Id', contractId);

    return this.http
      .post(url, body, {
        headers,
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(
        map((response) => {
          const blob = response.body as Blob;
          const pagesHeader = response.headers.get('X-Orgchart-Pages');
          const paginationHeader = response.headers.get('X-Orgchart-Pagination');
          const formatHeader = response.headers.get('X-Orgchart-Format');
          return {
            blob,
            pages: pagesHeader ? parseInt(pagesHeader, 10) : 1,
            pagination: (paginationHeader as TOrgchartPdfPaginationMode) ?? body.pagination ?? 'fit',
            format: (formatHeader as TOrgchartPdfPaperFormat) ?? body.format ?? 'A3',
          } satisfies TOrgchartPdfExportResult;
        }),
      );
  }

  /** Saves a blob to disk via an ephemeral object URL. */
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    // Delay revoke so Safari doesn't cancel the download mid-flight.
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
}
