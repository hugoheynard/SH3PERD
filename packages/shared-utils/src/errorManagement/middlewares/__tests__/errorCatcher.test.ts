import express, { type Request, type Response, type NextFunction } from 'express';
import request from 'supertest';
import {errorCatcher} from "../errorCatcher.js";
import {BusinessError, TechnicalError} from "../../errorClasses/index.js";

describe('errorCatcher', () => {
    let app: express.Express;

    beforeEach(() => {
        app = express();

        app.get('/business-error', (_req: Request, _res: Response, next: NextFunction) => {
            next(new BusinessError('Business rule violated', 'BUSINESS_RULE', 400));
        });

        app.get('/technical-error', (_req: Request, _res: Response, next: NextFunction) => {
            next(new TechnicalError('Database down', 'DATABASE_DOWN', 500));
        });

        app.get('/unknown-error', (_req: Request, _res: Response, next: NextFunction) => {
            next(new Error('Unknown error'));
        });

        app.use(errorCatcher);
    });

    it('should handle BusinessError correctly', async () => {
        const response = await request(app).get('/business-error');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            type: 'business_error',
            code: 'BUSINESS_RULE',
            message: 'Business rule violated'
        });
    });

    it('should handle TechnicalError correctly', async () => {
        const response = await request(app).get('/technical-error');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            type: 'technical_error',
            code: 'DATABASE_DOWN',
            message: 'An internal error occurred'
        });
    });

    it('should handle unknown errors correctly', async () => {
        const response = await request(app).get('/unknown-error');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            type: 'unknown_error',
            message: 'Unexpected server error'
        });
    });
});
