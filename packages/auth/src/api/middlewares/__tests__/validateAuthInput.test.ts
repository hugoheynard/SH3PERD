import type { Request, Response, NextFunction } from 'express';
import {validateAuthInput} from "../validateAuthInput";
import {jest} from '@jest/globals';

describe('validateAuthInput middleware', () => {
    let req: Partial<Request>;
    let res: jest.Mocked<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { body: {} };

        res = {
            status: jest.fn().mockReturnThis(), // ✅ retourne bien un Response
            json: jest.fn(),
        } as unknown as jest.Mocked<Response>; // ✅ on force le type

        next = jest.fn();
    });

        it('should return 400 if email is missing', () => {
            req.body = {password: 'password123'};

            validateAuthInput(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({message: 'Missing email'});
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 400 if password is missing', () => {
            req.body = {email: 'user@example.com'};

            validateAuthInput(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({message: 'Missing password'});
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 400 if email or password is not a string', () => {
            req.body = {email: 123 as unknown as string, password: true as unknown as string};

            validateAuthInput(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({message: 'Email and password must be a string'});
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next() and normalize input if valid', () => {
            req.body = {email: ' USER@EXAMPLE.COM ', password: ' secret '};

            validateAuthInput(req as Request, res as Response, next);

            expect(req.body.email).toBe('user@example.com');
            expect(req.body.password).toBe('secret');
            expect(next).toHaveBeenCalled();
        });
    });
