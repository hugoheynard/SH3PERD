import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { USE_CASES_TOKENS } from '../../../appBootstrap/nestTokens';
import type { TCoreUseCasesTypeMap } from '../../../appBootstrap/nestTokens';
import { UnauthorizedException } from '@nestjs/common';
import { jest } from '@jest/globals';

import express from 'express';

type Request = express.Request;
type Response = express.Response;

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthUseCases: TCoreUseCasesTypeMap['auth'] = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: USE_CASES_TOKENS.auth,
          useValue: mockAuthUseCases,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should register a user', async () => {
    const dto = { email: 'test@example.com', password: '1234' };
    const expected = { user_id: 'user_1' };
    mockAuthUseCases.register.mockResolvedValue(expected);

    const result = await controller.register(dto);
    expect(result).toEqual(expected);
    expect(mockAuthUseCases.register).toHaveBeenCalledWith(dto);
  });


  it('should login and set cookie', async () => {
    const dto = { email: 'test@example.com', password: '1234' };
    const res = {
      cookie: jest.fn(),
    } as any as Response;

    const expected = {
      authToken: 'token',
      user_id: 'user_1',
      refreshTokenSecureCookie: {
        name: 'cookieName',
        value: 'cookieValue',
        options: { httpOnly: true },
      },
    };

    mockAuthUseCases.login.mockResolvedValue(expected);

    const result = await controller.login(dto, res);
    expect(res.cookie).toHaveBeenCalledWith(
      expected.refreshTokenSecureCookie.name,
      expected.refreshTokenSecureCookie.value,
      expected.refreshTokenSecureCookie.options
    );
    expect(result).toEqual({
      authToken: expected.authToken,
      user_id: expected.user_id,
    });
  });

  it('should refresh session and return new tokens', async () => {
    const req = {
      cookies: {
        sh3pherd_refreshToken: 'refresh_123',
      },
    } as any as Request;

    const res = {
      cookie: jest.fn(),
    } as any as Response;

    const expected = {
      user_id: 'user_1',
      authToken: 'newToken',
      refreshTokenSecureCookie: {
        name: 'cookieName',
        value: 'cookieValue',
        options: { httpOnly: true },
      },
    };

    mockAuthUseCases.refresh.mockResolvedValue(expected);

    const result = await controller.refreshSession(req, res);
    expect(res.cookie).toHaveBeenCalled();
    expect(result).toEqual({
      authToken: expected.authToken,
      user_id: expected.user_id,
    });
  });

  it('should logout and clear cookie', async () => {
    const req = {
      cookies: {
        sh3pherd_refreshToken: 'refresh_123',
      },
      user_id: 'user_1',
    } as any as Request;

    const res = {
      clearCookie: jest.fn(),
    } as any as Response;

    const result = await controller.logout(req, res);
    expect(mockAuthUseCases.logout).toHaveBeenCalledWith({
      user_id: 'user_1',
      refreshToken: 'refresh_123',
    });

    expect(result).toEqual({ message: 'Logout successful' });
  });
});
