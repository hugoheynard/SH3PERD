import { computed, inject, Injectable } from '@angular/core';
import type { TContractId } from '@sh3pherd/shared-types';
import { UserContextService } from './user-context.service';
import { strictComputed } from '../utils/strictComputed';


@Injectable({
  providedIn: 'root'
})
export class WorkspaceContextService {
  private readonly userCtx = inject(UserContextService);

  /**
   * The current contract ID from the user's preferences.
   * Nullable - may be null if not set in user preferences.
   */
  readonly currentContractId = computed<TContractId | null>(() => {
    const user = this.userCtx.userMe();
    return user?.preferences?.preferences.contract_workspace ?? null;
  });

  /** signal strict (throw si null) */
  readonly currentContractIdStrict = strictComputed<TContractId>(this.currentContractId, 'Workspace');
}
