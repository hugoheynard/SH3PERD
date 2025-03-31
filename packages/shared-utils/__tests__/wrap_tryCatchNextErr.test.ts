
import type { Request, Response, NextFunction } from 'express';
import {wrap_TryCatchNextErr} from "../src/tryCatch/wrap_tryCatchNextErr";

describe('wrap_TryCatchNextErr', () => {
    let req: Request;
    let res: Response;
    let next: jest.Mock;

    beforeEach(() => {
        req = {} as Request;
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        } as unknown as Response;
        next = jest.fn();
    });

    it('should wrap all methods of an object with try-catch handling', async () => {
        const originalObject = {
            async methodOne(req: Request, res: Response, next: NextFunction) {
                res.json({ success: true });
            },
            async methodTwo(req: Request, res: Response, next: NextFunction) {
                res.json({ message: 'Another method' });
            },
        };

        const wrappedObject = wrap_TryCatchNextErr(originalObject);

        // Appeler la première méthode
        await wrappedObject.methodOne(req, res, next);

        expect(res.json).toHaveBeenCalledWith({ success: true });
        expect(next).not.toHaveBeenCalled();

        // Appeler la deuxième méthode
        await wrappedObject.methodTwo(req, res, next);

        expect(res.json).toHaveBeenCalledWith({ message: 'Another method' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next with an error if a wrapped method throws', async () => {
        const originalObject = {
            async methodThatFails(req: Request, res: Response, next: NextFunction) {
                throw new Error('Something went wrong');
            },
        };

        const wrappedObject = wrap_TryCatchNextErr(originalObject);

        // Appeler une méthode qui lève une erreur
        await wrappedObject.methodThatFails(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].message).toBe('Something went wrong');
    });

    it('should preserve non-function properties in the wrapped object', () => {
        const originalObject = {
            value: 42,
            async method(req: Request, res: Response, next: NextFunction) {
                res.json({ success: true });
            },
        };

        const wrappedObject = wrap_TryCatchNextErr(originalObject);

        expect(wrappedObject.value).toBe(42);


        wrappedObject.method(req, res, next);
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });
});
