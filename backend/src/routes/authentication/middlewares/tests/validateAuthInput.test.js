import { jest } from '@jest/globals';
import express from "express";
import request from 'supertest';
import { validateAuthInput } from "../validateAuthInput.js";
import {expect} from "@jest/globals";


describe('validateAuthInput - login middleware, ', () => {
    const app = express();
    app.use(express.json());

    app.post('/test', validateAuthInput, (req, res) => {
        res.status(200).json({ message: 'Success' });
    });

    const testMail = 'Test@example.com';
    const testPass = '12345 ';

    test ('should return 401 if missing email', async () => {
        const response = await request(app)
            .post('/test')
            .send({ password: testPass });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Missing email');
    });

    test ('should return 401 if missing password', async () => {
        const response = await request(app)
            .post('/test')
            .send({ email: testMail });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Missing password');
    });

    test('should call next middleware when email and password are provided', async () => {
        const response = await request(app)
            .post('/test')
            .send({ email: testMail, password: testPass });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Success');
    });


    test('should trim and lowercase email, trim password, and call next', async () => {
        const req = {
            body: {
                email: '  Test@Example.com ',
                password: '  12345  '
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();


        validateAuthInput(req, res, next);

        expect(req.body.email).toBe('test@example.com');
        expect(req.body.password).toBe('12345');
        expect(next).toHaveBeenCalled();
    });
});