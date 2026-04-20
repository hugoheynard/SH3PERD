import { type CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  catchError,
  filter,
  map,
  type Observable,
  of,
  take,
  timeout,
} from 'rxjs';
import { UserContextService } from '../app/core/services/user-context.service';

const WAIT_FOR_CONTEXT_MS = 3000;
const FALLBACK_ROUTE = '/app/home';

/**
 * Waits for the platform plan to load. Runs after `authGuard`, so
 * `AuthService.refreshSession$` has already triggered `UserContextService.getUser()`
 * which loads the plan as part of its success handler. On timeout, resolves
 * with `null` so the caller falls through to the current (possibly empty) signals.
 */
function waitForPlan(userCtx: UserContextService): Observable<unknown> {
  return toObservable(userCtx.plan).pipe(
    filter((p) => p !== null),
    take(1),
    timeout(WAIT_FOR_CONTEXT_MS),
    catchError(() => of(null)),
  );
}

/**
 * Blocks routes reserved for company accounts. Artists (or users whose plan
 * never loads) are redirected to `/app/home`.
 */
export const requireCompanyAccountGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const userCtx = inject(UserContextService);
  const router = inject(Router);

  return waitForPlan(userCtx).pipe(
    map(() =>
      userCtx.isCompany() ? true : router.createUrlTree([FALLBACK_ROUTE]),
    ),
  );
};

/**
 * Blocks routes that require an active contract workspace (company-scoped
 * features like programs). Users without a selected workspace are redirected
 * to `/app/home`.
 */
export const requireContractWorkspaceGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const userCtx = inject(UserContextService);
  const router = inject(Router);

  return waitForPlan(userCtx).pipe(
    map(() =>
      userCtx.hasContractWorkspace()
        ? true
        : router.createUrlTree([FALLBACK_ROUTE]),
    ),
  );
};

/**
 * Blocks the Shows feature for plans that don't include it (artist_free,
 * company_free, company_pro). Mirrors `canUseShows` on UserContextService —
 * keep the two in sync when the plan matrix changes.
 */
export const requireShowsAccessGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const userCtx = inject(UserContextService);
  const router = inject(Router);

  return waitForPlan(userCtx).pipe(
    map(() =>
      userCtx.canUseShows() ? true : router.createUrlTree([FALLBACK_ROUTE]),
    ),
  );
};
