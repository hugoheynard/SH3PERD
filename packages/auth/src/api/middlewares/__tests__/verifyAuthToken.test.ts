import {verifyAuthToken} from "../verifyAuthToken.js";
import request from 'supertest';
import express, { type Request, type Response } from 'express';
import { jest } from '@jest/globals';
import {type TVerifyAuthToken} from "@sh3pherd/shared-types";
import {errorCatcher} from "@sh3pherd/shared-utils";



describe('verifyAuthToken middleware', () => {
    const mockVerifyAuthTokenFn = jest.fn<TVerifyAuthToken>();

    const app = express();
    app.use(express.json());

    app.get(
        '/secure',
        verifyAuthToken({ verifyAuthTokenFn: mockVerifyAuthTokenFn }),
        (req: Request, res: Response) => {
            res.status(200).json({ user: req.user });
        }
    );

    app.use(errorCatcher);

    it('should throw BusinessError if no token is provided', async () => {
        const response = await request(app).get('/secure');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            type: 'business_error',
            code: 'MISSING_AUTH_TOKEN',
            message: 'Missing auth token',
        });
    });

    it('should throw BusinessError if token is invalid', async () => {
        mockVerifyAuthTokenFn.mockResolvedValueOnce(null);

        const response = await request(app)
            .get('/secure')
            .set('Authorization', 'Bearer invalid.token');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            type: 'business_error',
            code: 'INVALID_AUTH_TOKEN',
            message: 'Invalid auth token',
        });
    });

    it('should allow access if token is valid', async () => {
        mockVerifyAuthTokenFn.mockResolvedValueOnce({ user_id: 'user_123' });

        const response = await request(app)
            .get('/secure')
            .set('Authorization', 'Bearer valid.token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ user: 'user_123' });
    });
});
