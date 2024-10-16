import express from "express";
import request from 'supertest';
import {validateAuthInput} from "../validateAuthInput.js";

describe('validateAuthInput - login middleware, ', () => {
    const app = express();
    app.use(express.json());

    app.post('/test', validateAuthInput, (req, res) => {
        res.status(200).json({ message: 'Success' });
    });

    test ('should return 401 if missing email', async () => {
        const response = await request(app)
            .post('/test')
            .send({ password: '12345' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Missing email');
    });

    test ('should return 401 if missing password', async () => {
        const response = await request(app)
            .post('/test')
            .send({ email: 'test@example.com' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Missing password');
    });

    test('should call next middleware when email and password are provided', async () => {
        const response = await request(app)
            .post('/test')
            .send({ email: 'test@example.com', password: '12345' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Success');
    });

});