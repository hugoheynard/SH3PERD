import express from 'express';
import request from 'supertest';
import {notFound_404_Handler} from "../notFound_404_Handler.js";
import {jest} from '@jest/globals';

describe('notFoundHandler middleware', () => {
    const createApp = () => {
        const app = express();
        app.use(notFound_404_Handler);
        return app;
    };

    beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        (console.log as jest.Mock).mockRestore();
    });


    it('should return 404 with JSON if requested', async () => {
        const app = createApp();

        const res = await request(app)
            .get('/unknown-route')
            .set('Accept', 'application/json');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({
            error: true,
            message: 'Route does not exist',
        });
        expect(res.headers['content-type']).toMatch(/application\/json/);
    });
});
