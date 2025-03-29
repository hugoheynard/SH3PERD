// userAlreadyExistsManual.test.ts
import type { Request, Response, NextFunction } from 'express';
import { userAlreadyExistsManual } from '../../../backend/src/registration/middlewares/userAlreadyExistsManual';

describe('userAlreadyExistsManual middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let mockCheckUserExistByMailFunction: jest.Mock;

    beforeEach(() => {
        mockCheckUserExistByMailFunction = jest.fn();
        mockReq = { body: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    const trigger = async () => {
        const middleware = userAlreadyExistsManual({ checkUserExistByMailFunction: mockCheckUserExistByMailFunction });
        await middleware(mockReq as Request, mockRes as Response, mockNext);
    };

    it('should return 400 if email is missing', async () => {
        mockReq.body = {};

        await trigger();

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Email is missing from request body.',
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 409 if user already exists', async () => {
        mockReq.body = { email: 'existing@example.com' };
        mockCheckUserExistByMailFunction.mockResolvedValue({ email: 'existing@example.com' });

        await trigger();

        expect(mockCheckUserExistByMailFunction).toHaveBeenCalledWith({ email: 'existing@example.com' });
        expect(mockRes.status).toHaveBeenCalledWith(409);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'User already exists',
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next if no user is found', async () => {
        mockReq.body = { email: 'new@example.com' };
        mockCheckUserExistByMailFunction.mockResolvedValue(null);

        await trigger();

        expect(mockCheckUserExistByMailFunction).toHaveBeenCalledWith({ email: 'new@example.com' });
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });
});
