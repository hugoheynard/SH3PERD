import { jest } from '@jest/globals'
import {validateDateReq} from "../validateDateReq.js";

describe('validateDateReq middleware', () => {
    let req, res, next;

    beforeEach(() =>{
        req = {
            body: {}
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    test('should return 400 if no date', ()=> {
        req.body.date = null;

        validateDateReq(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Date is required' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 400 if invalid date format', ()=> {
        req.body.date = 'invalid-date';

        validateDateReq(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid date format' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should call next() and pass the req if date ok', ()=> {
        req.body.date = '2023-10-20';

        validateDateReq(req, res, next);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(req);
    });
});