import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../../core/services/BaseHttpService';
import type { Observable } from 'rxjs';
import type {
  TAddendumId,
  TContractAddendumDomainModel,
  TContractDetailViewModel,
  TContractDocumentId,
  TContractDomainModel,
  TContractId,
  TContractRecord,
} from '@sh3pherd/shared-types';

@Injectable({
  providedIn: 'root',
})
export class ContractsService extends BaseHttpService {
  private readonly contractURL =
    this.UrlBuilder.apiProtectedRoute('contracts').build();

  /** Get all contracts for the authenticated user. */
  getCurrentUserContractList(): Observable<TContractDomainModel[]> {
    return this.http.get<TContractDomainModel[]>(`${this.contractURL}/me`);
  }

  /** Read a single contract the recipient is a party to. */
  getContractById(
    contractId: TContractId,
  ): Observable<TContractDetailViewModel> {
    return this.scopedHttp
      .withHeader('X-Contract-Id', contractId)
      .get<TContractDetailViewModel>(`${this.contractURL}/${contractId}`);
  }

  /** Sign the contract on behalf of the current actor (side resolved server-side). */
  signContract(
    contractId: TContractId,
    notify = false,
  ): Observable<TContractRecord> {
    return this.scopedHttp
      .withHeader('X-Contract-Id', contractId)
      .post<TContractRecord>(`${this.contractURL}/${contractId}/sign`, {
        notify,
      });
  }

  /** List all addenda attached to a contract. */
  getAddenda(
    contractId: TContractId,
  ): Observable<TContractAddendumDomainModel[]> {
    return this.scopedHttp
      .withHeader('X-Contract-Id', contractId)
      .get<
        TContractAddendumDomainModel[]
      >(`${this.contractURL}/${contractId}/addenda`);
  }

  /** Sign an addendum (side resolved server-side from the actor's roles). */
  signAddendum(
    contractId: TContractId,
    addendumId: TAddendumId,
  ): Observable<TContractAddendumDomainModel> {
    return this.scopedHttp
      .withHeader('X-Contract-Id', contractId)
      .post<TContractAddendumDomainModel>(
        `${this.contractURL}/${contractId}/addenda/${addendumId}/sign`,
        {},
      );
  }

  /** Sign a document attached to the contract. */
  signDocument(
    contractId: TContractId,
    documentId: TContractDocumentId,
  ): Observable<TContractRecord> {
    return this.scopedHttp
      .withHeader('X-Contract-Id', contractId)
      .post<TContractRecord>(
        `${this.contractURL}/${contractId}/documents/${documentId}/sign`,
        {},
      );
  }

  /** Get a presigned download URL for a contract document. */
  getDocumentDownloadUrl(
    contractId: TContractId,
    documentId: TContractDocumentId,
  ): Observable<{ url: string }> {
    return this.scopedHttp.withHeader('X-Contract-Id', contractId).get<{
      url: string;
    }>(`${this.contractURL}/${contractId}/documents/${documentId}/download`);
  }
}
