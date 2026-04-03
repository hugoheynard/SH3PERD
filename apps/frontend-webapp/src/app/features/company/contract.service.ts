import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../core/services/BaseHttpService';
import type { Observable } from 'rxjs';
import type {
  TApiResponse,
  TCompanyContractViewModel,
  TCompanyId,
  TContractDetailViewModel,
  TContractId,
  TContractRole,
  TContractStatus,
  TUserId,
} from '@sh3pherd/shared-types';

@Injectable({ providedIn: 'root' })
export class ContractService extends BaseHttpService {

  getCompanyContracts(companyId: TCompanyId): Observable<TCompanyContractViewModel[]> {
    return this.http.get<TCompanyContractViewModel[]>(
      this.UrlBuilder.apiProtectedRoute('contracts').route(`company/${companyId}`).build()
    );
  }

  getContractById(contractId: TContractId): Observable<TContractDetailViewModel> {
    return this.http.get<TContractDetailViewModel>(
      this.UrlBuilder.apiProtectedRoute('contracts').route(contractId).build()
    );
  }

  createContractForUser(dto: { company_id: TCompanyId; user_id: TUserId; status: TContractStatus; startDate: string; endDate?: string }): Observable<TApiResponse<TCompanyContractViewModel>> {
    return this.http.post<TApiResponse<TCompanyContractViewModel>>(
      this.UrlBuilder.apiProtectedRoute('contracts').build(),
      { requestDTO: dto }
    );
  }

  updateContract(contractId: TContractId, dto: { status?: TContractStatus; startDate?: string; endDate?: string | null }): Observable<TContractDetailViewModel> {
    return this.http.patch<TContractDetailViewModel>(
      this.UrlBuilder.apiProtectedRoute('contracts').route(contractId).build(),
      dto
    );
  }

  assignContractRole(contractId: TContractId, role: TContractRole): Observable<unknown> {
    return this.http.post<unknown>(
      this.UrlBuilder.apiProtectedRoute('contracts').route(`${contractId}/roles`).build(),
      { role }
    );
  }

  removeContractRole(contractId: TContractId, role: TContractRole): Observable<unknown> {
    return this.http.delete<unknown>(
      this.UrlBuilder.apiProtectedRoute('contracts').route(`${contractId}/roles/${role}`).build()
    );
  }
}
