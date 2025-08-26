import { TestBed } from '@angular/core/testing';

import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TokenService]
    });
    service = TestBed.inject(TokenService);
/*
    spyOn(localStorage, 'setItem').and.callThrough();
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'auth_token') {
        return 'test-token';
      }
      return null;
    });
    spyOn(localStorage, 'removeItem').and.callThrough();
*/
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save the token to localStorage', () => {
    service.setToken('test-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
  });

  it('should retrieve the token from localStorage', () => {
    const token = service.getToken();
    expect(localStorage.getItem).toHaveBeenCalledWith('auth_token');
    expect(token).toBe('test-token');
  });

  it('should remove the token from localStorage', () => {
    service.removeToken();
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
  });
});
