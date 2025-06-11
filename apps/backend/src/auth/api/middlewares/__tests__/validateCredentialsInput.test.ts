import type { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';
import {validateCredentialsInput} from "../validateCredentialsInput.js";


describe('validManualRegisterInput middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    const mockNext = jest.fn();

    beforeEach(() => {
        mockReq = { body: {} };

        const res = {} as Response;
        res.status = jest.fn().mockReturnValue(res) as unknown as Response['status'];
        res.json = jest.fn().mockReturnValue(res) as unknown as Response['json'];

        mockRes = res;

        jest.clearAllMocks();
    });

    const trigger = () =>
        validateCredentialsInput(
            mockReq as Request,
            mockRes as Response,
            mockNext as NextFunction
        );

    it('should call next if email and password are valid', () => {
        mockReq.body = {
            email: 'user@example.com',
            password: 'validPass123',
        };

        trigger();

        expect(mockNext).toHaveBeenCalled();
    });

    it('should reject missing email', () => {
        mockReq.body = {
            password: 'validPass123',
        };

        trigger();

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Missing email or password',
        });
    });

    it('should reject missing password', () => {
        mockReq.body = {
            email: 'user@example.com',
        };

        trigger();

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Missing email or password',
        });
    });

    it('should reject invalid email format', () => {
        mockReq.body = {
            email: 'invalid-email',
            password: 'validPass123',
        };

        trigger();

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Invalid email format.',
        });
    });

    it('should reject passwords with spaces', () => {
        mockReq.body = {
            email: 'user@example.com',
            password: 'bad pass',
        };

        trigger();

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Password should not contain spaces.',
        });
    });

    it('should reject short passwords', () => {
        mockReq.body = {
            email: 'user@example.com',
            password: 'short',
        };

        trigger();

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Password should be at least 8 characters long.',
        });
    });
});
