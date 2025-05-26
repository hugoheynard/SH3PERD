import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import request from 'supertest';
import {jest} from '@jest/globals';
import {errorCatcherMw_simple} from "../errorCatcherMw_simple.js";


describe('Basic errorCatcherMw_simple (500 only)', () => {
    const createTestApp = (errorToThrow: any) => {
        const app = express();

        app.get('/test-error', (_req: Request, _res: Response, next: NextFunction) => {
            next(errorToThrow);
        });

        app.use(errorCatcherMw_simple);

        return app;
    };

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        (console.error as jest.Mock).mockRestore();
    });

    it('should always return 500 with provided error message', async () => {
        const app = createTestApp(new Error('Something went wrong'));

        const res = await request(app).get('/test-error');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            error: true,
            message: 'Something went wrong',
        });
    });

    it('should fallback to "Internal Server Error" if message is empty', async () => {
        const app = createTestApp(new Error('   '));

        const res = await request(app).get('/test-error');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            error: true,
            message: 'Internal Server Error',
        });
    });

    it('should fallback to "Internal Server Error" if message is missing', async () => {
        const app = createTestApp({});

        const res = await request(app).get('/test-error');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            error: true,
            message: 'Internal Server Error',
        });
    });
});

