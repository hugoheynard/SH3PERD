import * as request from 'supertest';
import  { type Request, type Response, type NextFunction } from 'express';
import * as express from 'express';
import {errorCatcher} from "../errorCatcher";


const app = express();

app.get('/error', (req: Request, res: Response, next: NextFunction) => {
    const error = new Error('Test error');
    next(error);
});

app.get('/no-message-error', (req: Request, res: Response, next: NextFunction) => {
    const error = new Error();
    next(error);
});

app.use(errorCatcher);

describe('Middleware errorCatcher', () => {
    it('should catch error and return a JSON 500', async () => {
        const response = await request(app).get('/error');

        // Vérifications
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', true);
        expect(response.body).toHaveProperty('message', 'Test error');
    });

    it('should return "Internal Server Error" if err message is missing', async () => {
        const response = await request(app).get('/no-message-error');

        // Vérifications
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', true);
        expect(response.body).toHaveProperty('message', 'Internal Server Error');
    });
});
