import { validManualRegisterInput } from '../validManualRegisterInput';
import type { Request, Response, NextFunction } from 'express';

describe('validManualRegisterInput middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    const mockNext = jest.fn();

    beforeEach(() => {
        mockReq = { body: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    const trigger = () =>
        validManualRegisterInput(
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
            message: 'Email is required and must be a string.',
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
