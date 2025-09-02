import { Injectable, signal } from '@angular/core';
import type { TUser } from '@sh3pherd/shared-types';
import { BaseHttpService } from './BaseHttpService';

@Injectable({
  providedIn: 'root'
})
export class UserContextService extends BaseHttpService {
  private readonly _user = signal<TUser | null>(null);
  private readonly userURL = this.apiURLService.api().route('user').build;

  /** Current logged in user */
  readonly user = this._user.asReadonly();

  setUser(user: TUser | null) {
    this._user.set(user);
  };

  /**
   * Fetches the current user's profile from the backend and updates the user signal.
   * If the request fails, it logs the error and sets the user signal to null.
   */
  getUser(): void {
    this.http.get<TUser>(`${this.userURL()}/me`).subscribe({
      next: (user) => this.setUser(user),
      error: (err) => {
        console.error('Failed to load user profile', err);
        this.setUser(null);
      }
    });
  };
}
