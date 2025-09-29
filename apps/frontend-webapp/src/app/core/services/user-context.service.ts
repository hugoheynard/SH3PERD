import { Injectable, signal } from '@angular/core';
import type { TUserMeViewModel } from '@sh3pherd/shared-types';
import { BaseHttpService } from './BaseHttpService';
import type { TUserPreferencesDomainModel } from '@sh3pherd/shared-types';


@Injectable({
  providedIn: 'root'
})
export class UserContextService extends BaseHttpService {
  private readonly userURL = this.apiURLService.api().protected().route('user').build();
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
