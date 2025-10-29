import { computed, inject, Injectable, signal } from '@angular/core';
import type { TUserMeViewModel, TUserPreferencesDomainModel } from '@sh3pherd/shared-types';
//import { BaseHttpService } from './BaseHttpService';
import type { TContractId } from '@sh3pherd/shared-types';
import { strictComputed } from '../utils/strictComputed';
import { HttpClient } from '@angular/common/http';
import { ApiURLService } from './api-url.service';


@Injectable({
  providedIn: 'root'
})
export class UserContextService  {
  private readonly http = inject(HttpClient);
  private readonly url = inject(ApiURLService);
  private readonly userURL = this.url.api().protected().route('user').build();
  private readonly _user = signal<TUserMeViewModel | null>(null);

  userMe = this._user.asReadonly();

  setUser(user: TUserMeViewModel | null) {
    this._user.set(user);
  };

  /** Getter strict (throw if user null) */
  get userStrict(): TUserMeViewModel {
    const value = this._user();
    if (!value) {
      throw new Error('User not initialized');
    }
    return value;
  };

  /**
   * The current contract ID from the user's preferences.
   * Nullable - may be null if not set in user preferences.
   */
  readonly currentContractId = computed<TContractId | null>(() => {
    return this._user()?.preferences?.preferences.contract_workspace ?? null;
  });

  /** signal strict (throw si null) */
  readonly currentContractIdStrict = strictComputed<TContractId>(this.currentContractId, 'Workspace');

  /**
   * Fetches the current user's profile from the backend and updates the user signal.
   * If the request fails, it logs the error and sets the user signal to null.
   */
  getUser(): void {
    this.http.get<TUserMeViewModel>(`${this.userURL}/me`).subscribe({
      next: (user) => this.setUser(user),
      error: (err) => {
        console.error('Failed to load user profile', err);
        this.setUser(null);
      }
    });
  };

  /**
   * Updates the current user's preferences.
   * @param data
   */
  updateUserPreferences(data: Partial<TUserPreferencesDomainModel>) {
    return this.http.patch<TUserPreferencesDomainModel>(`${this.userURL}/preferences`, data);
  };


}
