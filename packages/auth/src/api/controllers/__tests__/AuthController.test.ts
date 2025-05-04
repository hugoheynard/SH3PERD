import type { Request, Response, NextFunction } from 'express';
import type { TAuthControllerDeps } from '@sh3pherd/shared-types';
import {AuthController} from "../AuthController";
import {jest} from "@jest/globals";


describe('AuthController', () => {
    let controller: AuthController;
    let deps: jest.Mocked<TAuthControllerDeps>;

    let req: Partial<Request>;
    let res: jest.Mocked<Response>;
    const next: NextFunction = jest.fn();

    beforeEach(() => {
        deps = {
            loginUseCase: jest.fn(),
            refreshSessionUseCase: jest.fn(),
            logoutUseCase: jest.fn(),
        } as unknown as jest.Mocked<TAuthControllerDeps>;

        controller = new AuthController(deps);

        res = {
            cookie: jest.fn().mockReturnThis(),
            clearCookie: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as jest.Mocked<Response>;
    });

    describe('login', () => {
        it('should authenticate and return auth token with secure cookie', async () => {
            req = {
                body: {
                    email: 'user@example.com',
                    password: 'securepassword'
                }
            };

            deps.loginUseCase.mockResolvedValue({
                authToken: 'access-token-123',
                user_id: 'user_abc',
                refreshTokenSecureCookie: {
                    name: 'sh3pherd_refreshToken',
                    value: 'refreshToken_abc',
                    options: {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                        path: '/',
                        maxAge: 3600
                    }
                }
            });

            await controller.login(req as Request, res, next);

            expect(deps.loginUseCase).toHaveBeenCalledWith({
                email: 'user@example.com',
                password: 'securepassword'
            });

            expect(res.cookie).toHaveBeenCalledWith(
                'sh3pherd_refreshToken',
                'refreshToken_abc',
                {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 3600
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                authToken: 'access-token-123',
                user_id: 'user_abc'
            });
        });
    });

    describe('refreshSession', () => {
        it('should refresh session and return new tokens with updated cookie', async () => {
            req = {
                cookies: {
                    sh3pherd_refreshToken: 'refreshToken_456'
                }
            };

            deps.refreshSessionUseCase.mockResolvedValue({
                user_id: 'user_xyz',
                authToken: 'new-access-token',
                refreshTokenSecureCookie: {
                    name: 'sh3pherd_refreshToken',
                    value: 'refreshToken_xyz',
                    options: {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                        path: '/',
                        maxAge: 3600
                    }
                }
            });

            await controller.refreshSession(req as Request, res, next);

            expect(deps.refreshSessionUseCase).toHaveBeenCalledWith({
                refreshToken: 'refreshToken_456'
            });

            expect(res.cookie).toHaveBeenCalledWith(
                'sh3pherd_refreshToken',
                'refreshToken_xyz',
                {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 3600
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                authToken: 'new-access-token',
                user_id: 'user_xyz'
            });
        });
    });

    describe('logout', () => {
        it('should revoke refresh token and clear cookie', async () => {
            req = {
                cookies: {
                    sh3pherd_refreshToken: 'refreshToken_789'
                }
            };

            await controller.logout(req as Request, res, next);

            expect(deps.logoutUseCase).toHaveBeenCalledWith({
                refreshToken: 'refreshToken_789'
            });

            expect(res.clearCookie).toHaveBeenCalledWith('sh3pherd_refreshToken', {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                path: '/'
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Logout successful' });
        });
    });
});