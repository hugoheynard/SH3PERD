import type { Request, Response, NextFunction } from 'express';
import type {TRegisterControllerDeps, TRegisterResponseDTO} from '@sh3pherd/shared-types';
import { jest } from '@jest/globals';
import {RegisterController} from "../RegisterController";

describe('RegisterController', () => {
    let controller: RegisterController;
    let deps: jest.Mocked<TRegisterControllerDeps>;

    let req: Partial<Request>;
    let res: jest.Mocked<Response>;
    const next: NextFunction = jest.fn();

    beforeEach(() => {
        deps = {
            registerUserUseCase: jest.fn()
        } as unknown as jest.Mocked<TRegisterControllerDeps>;

        controller = new RegisterController(deps);

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as jest.Mocked<Response>;
    });

    describe('registerUser', () => {
        it('should call registerUserUseCase and return 201 with the result', async () => {
            req = {
                body: {
                    email: 'newuser@example.com',
                    password: 'strongpassword'
                }
            };

            const mockResult: TRegisterResponseDTO = {
                user_id: 'user_123' as `user_${string}`,
            };

            deps.registerUserUseCase.mockResolvedValue(mockResult);

            await controller.registerUser(req as Request, res, next);

            expect(deps.registerUserUseCase).toHaveBeenCalledWith({
                email: 'newuser@example.com',
                password: 'strongpassword'
            });

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });
    });
});
