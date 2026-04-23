import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../core/services/BaseHttpService';
import type { Observable } from 'rxjs';
import type {
  TCompanyContractViewModel,
  TCompanyId,
  TContractDetailViewModel,
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
}
