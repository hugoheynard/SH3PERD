import { computed, inject, Injectable, signal } from '@angular/core';
import type { TApiResponse, TUserMeViewModel, TUserPreferencesDomainModel, TPlatformRole } from '@sh3pherd/shared-types';
import type { TContractId } from '@sh3pherd/shared-types';
import { strictComputed } from '../utils/strictComputed';
import { HttpClient } from '@angular/common/http';
import { ApiURLService } from './api-url.service';


@Injectable({
  providedIn: 'root'
})
export class UserContextService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(ApiURLService);
  private readonly userURL = this.url.apiProtectedRoute('user').build();
  private readonly quotaURL = this.url.apiProtectedRoute('quota').build();
  private readonly _user = signal<TUserMeViewModel | null>(null);
  private readonly _plan = signal<TPlatformRole | null>(null);

  /** Raw user view model — null until loaded. */
  readonly userMe = this._user.asReadonly();

  /** The user's current platform plan (null until loaded). */
  readonly plan = this._plan.asReadonly();

  // ── Derived identity signals (safe defaults, never throw) ──

  readonly displayName = computed(() => {
    const u = this._user();
    if (!u?.profile) return '';
    return u.profile.display_name ?? `${u.profile.first_name} ${u.profile.last_name}`;
  });

  readonly userInitial = computed(() => {
    const u = this._user();
    return u?.profile?.first_name?.charAt(0)?.toUpperCase() ?? '';
  });

  readonly firstName = computed(() => this._user()?.profile?.first_name ?? '');
  readonly lastName = computed(() => this._user()?.profile?.last_name ?? '');

  // ── Derived preference signals ──

  readonly theme = computed<'light' | 'dark'>(() => {
    return this._user()?.preferences?.theme ?? 'dark';
  });

  /**
   * The current contract workspace from user preferences.
   * Nullable — null if user not loaded or preference not set.
   */
  readonly currentContractId = computed<TContractId | null>(() => {
    return this._user()?.preferences.contract_workspace ?? null;
  });

  /** Strict version — throws if workspace not set. */
  readonly currentContractIdStrict = strictComputed<TContractId>(this.currentContractId, 'Workspace');

  // ── Actions ──

  setUser(user: TUserMeViewModel | null) {
    this._user.set(user);
  };

  /**
   * Fetches the current user's profile from the backend and updates the user signal.
   */
  getUser(): void {
    this.http.get<TApiResponse<TUserMeViewModel>>(`${this.userURL}/me`).subscribe({
      next: (res) => {
        this.setUser(res.data);
        this.loadPlan();
      },
      error: (err) => {
        console.error('Failed to load user profile', err);
        this.setUser(null);
      }
    });
  };

  private loadPlan(): void {
    this.http.get<{ data: { plan: TPlatformRole } }>(`${this.quotaURL}/me`).subscribe({
      next: (res) => this._plan.set(res.data.plan),
      error: () => this._plan.set('plan_free'),
    });
  }

  // ── Preference setters (optimistic update + backend sync) ──

  /**
   * Switch theme — updates local signal immediately, then persists to backend.
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.patchPreferencesOptimistic({ theme });
  }

  /**
   * Switch workspace — updates local signal immediately, then persists to backend.
   */
  setWorkspace(contractId: TContractId): void {
    this.patchPreferencesOptimistic({ contract_workspace: contractId });
  }

  /**
   * Generic preference update: applies the patch to the local signal first (optimistic),
   * then syncs to the backend. Reverts on failure.
   */
  private patchPreferencesOptimistic(patch: Partial<TUserPreferencesDomainModel>): void {
    const prev = this._user();
    if (!prev) return;

    // Optimistic local update
    this._user.set({
      ...prev,
      preferences: { ...prev.preferences, ...patch },
    });

    // Persist to backend (fire-and-forget — don't revert on failure,
    // the local value is the session source of truth)
    this.http.patch<TUserPreferencesDomainModel>(`${this.userURL}/preferences`, patch).subscribe({
      error: (err) => {
        console.warn('Failed to persist preferences to backend', err);
      },
    });
  }
}
