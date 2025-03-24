import { addRegistrationMethod } from '../addRegistrationMethod';
import type { Request, Response, NextFunction } from 'express';
import type { IRegistrationMethods } from '../../interfaces/IRegistrationMethod';
import { jest } from '@jest/globals';

describe('addRegistrationMethod middleware', () => {
    const mockNext: NextFunction = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should inject registrationMethod into req.body and call next()', () => {
        const mockReq = {
            body: {},
        } as Request;

        const mockRes = {} as Response;

        const registrationMethod: IRegistrationMethods = 'manual';

        const middleware = addRegistrationMethod({ registrationMethod });

        middleware(mockReq, mockRes, mockNext);

        expect(mockReq.body.registrationMethod).toBe('manual');
        expect(mockNext).toHaveBeenCalled();
    });

    it('should throw an error if registrationMethod is missing in input object', () => {
        expect(() => {
            addRegistrationMethod({} as any);
        }).toThrowError('addRegistrationMethod: input.registrationMethod is required');
    });

    it('should throw an error if input is completely undefined', () => {
        expect(() => {
            addRegistrationMethod(undefined as any);
        }).toThrowError('addRegistrationMethod: input.registrationMethod is required');
    });
});
