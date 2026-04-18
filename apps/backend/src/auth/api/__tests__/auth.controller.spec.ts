import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AuthController } from '../auth.controller.js';
import { CommandBus } from '@nestjs/cqrs';
import { jest } from '@jest/globals';
import { TURNSTILE_SERVICE } from '../../auth.tokens.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

import type express from 'express';

type Request = express.Request;
type Response = express.Response;

type MockExecuteFn = (command: unknown) => Promise<unknown>;
type MockVerifyFn = (args: { token?: string; remoteIp?: string }) => Promise<void>;

function makeRequest(overrides: Partial<Request> = {}): Request {
  return { ip: '203.0.113.1', cookies: {}, ...overrides } as unknown as Request;
}

describe('AuthController', () => {
  let controller: AuthController;
  let commandBus: { execute: jest.Mock<MockExecuteFn> };
  let turnstile: { verify: jest.Mock<MockVerifyFn>; enabled: boolean };

  beforeEach(async () => {
    commandBus = { execute: jest.fn<MockExecuteFn>() };
    turnstile = {
      verify: jest.fn<MockVerifyFn>().mockResolvedValue(undefined),
      enabled: true,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CommandBus,
          useValue: commandBus,
        },
        {
          provide: TURNSTILE_SERVICE,
          useValue: turnstile,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should register a user', async () => {
    const dto = {
      email: 'test@example.com',
      password: '1234',
      first_name: 'John',
      last_name: 'Doe',
      account_type: 'artist' as const,
      turnstileToken: 'cf-token-abc',
    };
    const expected = { id: 'userCredential_1', email: 'test@example.com' };
    commandBus.execute.mockResolvedValue(expected);

    const result = await controller.register(dto, makeRequest({ ip: '198.51.100.2' }));
    expect(result).toEqual(expected);
    expect(turnstile.verify).toHaveBeenCalledWith({
      token: 'cf-token-abc',
      remoteIp: '198.51.100.2',
    });
    expect(commandBus.execute).toHaveBeenCalled();
  });

  it('rejects register when captcha fails — command bus is never hit', async () => {
    turnstile.verify.mockRejectedValue(
      new BusinessError('Captcha verification failed.', {
        code: 'CAPTCHA_FAILED',
        status: 400,
      }),
    );

    await expect(
      controller.register(
        {
          email: 'test@example.com',
          password: '1234',
          first_name: 'John',
          last_name: 'Doe',
          account_type: 'artist' as const,
          turnstileToken: 'bad',
        },
        makeRequest(),
      ),
    ).rejects.toMatchObject({ code: 'CAPTCHA_FAILED' });

    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('should login and set cookie', async () => {
    const dto = { email: 'test@example.com', password: '1234', turnstileToken: 'cf-token-abc' };
    const res = {
      cookie: jest.fn(),
    } as any as Response;

    const expected = {
      authToken: 'token',
      user_id: 'user_1',
      refreshTokenSecureCookie: {
        name: 'sh3pherd_refreshToken',
        value: 'cookieValue',
        options: { httpOnly: true, path: '/api/auth' },
      },
    };

    commandBus.execute.mockResolvedValue(expected);

    const result = await controller.login(dto, makeRequest({ ip: '198.51.100.7' }), res);
    expect(turnstile.verify).toHaveBeenCalledWith({
      token: 'cf-token-abc',
      remoteIp: '198.51.100.7',
    });
    expect(res.cookie).toHaveBeenCalledWith(
      expected.refreshTokenSecureCookie.name,
      expected.refreshTokenSecureCookie.value,
      expected.refreshTokenSecureCookie.options,
    );
    expect(result).toEqual({
      authToken: expected.authToken,
      user_id: expected.user_id,
    });
  });

  it('rejects login when captcha fails — command bus is never hit', async () => {
    turnstile.verify.mockRejectedValue(
      new BusinessError('Captcha verification is required.', {
        code: 'CAPTCHA_REQUIRED',
        status: 400,
      }),
    );
    const res = { cookie: jest.fn() } as any as Response;

    await expect(
      controller.login({ email: 'test@example.com', password: '1234' }, makeRequest(), res),
    ).rejects.toMatchObject({ code: 'CAPTCHA_REQUIRED' });

    expect(commandBus.execute).not.toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
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
        name: 'sh3pherd_refreshToken',
        value: 'cookieValue',
        options: { httpOnly: true, path: '/api/auth' },
      },
    };

    commandBus.execute.mockResolvedValue(expected);

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

    commandBus.execute.mockResolvedValue(undefined);

    const result = await controller.logout(req, res);

    expect(commandBus.execute).toHaveBeenCalled();
    expect(res.clearCookie).toHaveBeenCalledWith('sh3pherd_refreshToken', { path: '/api/auth' });
    expect(result).toEqual({ message: 'Logout successful' });
  });
});
