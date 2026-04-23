import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../core/services/BaseHttpService';
import type { Observable } from 'rxjs';
import type {
  TAddendumChanges,
  TAddendumId,
  TCompanyContractViewModel,
  TCompanyId,
  TContractAddendumDomainModel,
  TContractDetailViewModel,
  TContractDocument,
  TContractDocumentId,
  TContractId,
  TContractRecord,
  TContractRole,
  TContractStatus,
  TUserId,
} from '@sh3pherd/shared-types';

@Injectable({ providedIn: 'root' })
export class ContractService extends BaseHttpService {
  getCompanyContracts(
    companyId: TCompanyId,
  ): Observable<TCompanyContractViewModel[]> {
    return this.scopedHttp
      .withContract()
      .get<
        TCompanyContractViewModel[]
      >(this.UrlBuilder.apiProtectedRoute('contracts').route(`company/${companyId}`).build());
  }

  getContractById(
    contractId: TContractId,
  ): Observable<TContractDetailViewModel> {
    return this.scopedHttp
      .withContract()
      .get<TContractDetailViewModel>(
        this.UrlBuilder.apiProtectedRoute('contracts')
          .route(contractId)
          .build(),
      );
  }

  createContractForUser(dto: {
    company_id: TCompanyId;
    user_id: TUserId;
    status: TContractStatus;
    startDate: string;
    endDate?: string;
  }): Observable<TContractRecord> {
    return this.scopedHttp
      .withContract()
      .post<TContractRecord>(
        this.UrlBuilder.apiProtectedRoute('contracts').build(),
        dto,
      );
  }

  updateContract(
    contractId: TContractId,
    dto: {
      status?: TContractStatus;
      startDate?: string;
      endDate?: string | null;
    },
  ): Observable<TContractDetailViewModel> {
    return this.scopedHttp
      .withContract()
      .patch<TContractDetailViewModel>(
        this.UrlBuilder.apiProtectedRoute('contracts')
          .route(contractId)
          .build(),
        dto,
      );
  }

  assignContractRole(
    contractId: TContractId,
    role: TContractRole,
  ): Observable<unknown> {
    return this.scopedHttp
      .withContract()
      .post<unknown>(
        this.UrlBuilder.apiProtectedRoute('contracts')
          .route(`${contractId}/roles`)
          .build(),
        { role },
      );
  }

  removeContractRole(
    contractId: TContractId,
    role: TContractRole,
  ): Observable<unknown> {
    return this.scopedHttp
      .withContract()
      .delete<unknown>(
        this.UrlBuilder.apiProtectedRoute('contracts')
          .route(`${contractId}/roles/${role}`)
          .build(),
      );
  }

  uploadDocument(
    contractId: TContractId,
    file: File,
  ): Observable<TContractDocument> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.scopedHttp
      .withContract()
      .post<TContractDocument>(
        this.UrlBuilder.apiProtectedRoute('contracts')
          .route(`${contractId}/documents`)
          .build(),
        formData,
      );
  }

  getDocumentDownloadUrl(
    contractId: TContractId,
    documentId: TContractDocumentId,
  ): Observable<{ url: string }> {
    return this.scopedHttp
      .withContract()
      .get<{
        url: string;
      }>(this.UrlBuilder.apiProtectedRoute('contracts').route(`${contractId}/documents/${documentId}/download`).build());
  }

  patchDocument(
    contractId: TContractId,
    documentId: TContractDocumentId,
    patch: { requiresSignature?: boolean },
  ): Observable<TContractRecord> {
    return this.scopedHttp
      .withContract()
      .patch<TContractRecord>(
        this.UrlBuilder.apiProtectedRoute('contracts')
          .route(`${contractId}/documents/${documentId}`)
          .build(),
        patch,
      );
  }

  signContract(
    contractId: TContractId,
    notify = false,
  ): Observable<TContractRecord> {
    return this.scopedHttp
      .withContract()
      .post<TContractRecord>(
        this.UrlBuilder.apiProtectedRoute('contracts')
          .route(`${contractId}/sign`)
          .build(),
        { notify },
      );
  }

  getAddenda(
    contractId: TContractId,
  ): Observable<TContractAddendumDomainModel[]> {
    return this.scopedHttp
      .withContract()
      .get<
        TContractAddendumDomainModel[]
      >(this.UrlBuilder.apiProtectedRoute('contracts').route(`${contractId}/addenda`).build());
  }

  createAddendum(
    contractId: TContractId,
    body: { changes: TAddendumChanges; effectiveDate: string; reason?: string },
  ): Observable<TContractAddendumDomainModel> {
    return this.scopedHttp
      .withContract()
      .post<TContractAddendumDomainModel>(
        this.UrlBuilder.apiProtectedRoute('contracts')
          .route(`${contractId}/addenda`)
          .build(),
        body,
      );
  }

  signAddendum(
    contractId: TContractId,
    addendumId: TAddendumId,
  ): Observable<TContractAddendumDomainModel> {
    return this.scopedHttp
      .withContract()
      .post<TContractAddendumDomainModel>(
        this.UrlBuilder.apiProtectedRoute('contracts')
          .route(`${contractId}/addenda/${addendumId}/sign`)
          .build(),
        {},
      );
  }
}
