// helloModule.test.ts
import request from 'supertest';
import express from 'express';
import {helloModule} from "./demo_basicUsage.js";
import {routerBuilder} from "../index.js";

describe('GET /hello', () => {
    it('should respond with "Hello World + mw without injection from injected middleware"', async () => {
        const app = express();

        const router = await routerBuilder.build({ routeDefs: [helloModule] });
        app.use(router);

        const res = await request(app).get('/hello');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: 'Hello World + mw without injection from injected middleware'
        });
    });
});

describe('Middleware injection via defineModule', () => {
    it('applies all declared route middlewares in correct order', async () => {
        const app = express();
        const router = await routerBuilder.build({ routeDefs: [helloModule] });
        app.use(router);

        const res = await request(app).get('/hello');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: 'Hello World + mw without injection from DI'
        });
    });
});
