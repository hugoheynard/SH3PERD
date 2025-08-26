import { TestBed } from '@angular/core/testing';
import {ActivatedRouteSnapshot, CanActivateFn, provideRouter, Router, RouterStateSnapshot} from '@angular/router';

import { authGuard } from './auth.guard';
import {AuthService} from '../app/core/services/auth.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;
  const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {


    const authServiceMock = {
      isAuthenticatedSignal: jasmine.createSpyObj('AuthService', ['isAuthenticatedSignal'])
    };

    const routerMock = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true))
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        provideRouter([])
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true if the user is authenticated', async () => {
    // Arrange
    authService.isAuthenticatedSignal.and.returnValue(true); // User is authenticated

    const route: ActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const state: RouterStateSnapshot = {} as RouterStateSnapshot;
    // Act
    const result = await authGuard(route, state);

    // Assert
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled(); // Ensure navigation wasn't called
  });

  it('should navigate to login and return false if the user is not authenticated', async () => {
    // Arrange
    authService.isAuthenticatedSignal.and.returnValue(false); // User is not authenticated

    const route: ActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const state: RouterStateSnapshot = {} as RouterStateSnapshot;
    // Act
    const result = await authGuard(route, state);

    // Assert
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']); // Ensure navigation to login
  });


});
