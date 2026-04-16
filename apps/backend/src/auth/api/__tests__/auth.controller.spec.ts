import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AuthController } from '../auth.controller.js';
import { CommandBus } from '@nestjs/cqrs';
import { jest } from '@jest/globals';

import type express from 'express';

type Request = express.Request;
type Response = express.Response;

describe('AuthController', () => {
  let controller: AuthController;
  let commandBus: { execute: jest.Mock };

  beforeEach(async () => {
    commandBus = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CommandBus,
          useValue: commandBus,
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
    };
    const expected = { id: 'userCredential_1', email: 'test@example.com' };
    commandBus.execute.mockResolvedValue(expected);

    const result = await controller.register(dto);
    expect(result).toEqual(expected);
    expect(commandBus.execute).toHaveBeenCalled();
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
        name: 'sh3pherd_refreshToken',
        value: 'cookieValue',
        options: { httpOnly: true, path: '/api/auth' },
      },
    };

    commandBus.execute.mockResolvedValue(expected);

    const result = await controller.login(dto, res);
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
