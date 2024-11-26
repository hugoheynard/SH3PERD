import { jest } from '@jest/globals';
import {userExistsCheck} from "../userExistCheck.js";


describe('userExistsCheck middleware', () => {
    let req, res, next, collection;

    beforeEach(() => {
        req = { body: { email: 'test@example.com' } };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();

        collection = {
            findOne: jest.fn(),
        };
    });

    test('should call next if user is found', async () => {

        collection.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });


        const middleware = userExistsCheck(collection);
        await middleware(req, res, next);

        expect(req.user).toEqual({ id: 1, email: 'test@example.com' });
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled(); // On ne doit pas appeler res.status car next() est appelé
    });

    test('should return 401 if user is not found', async () => {

        collection.findOne.mockResolvedValue(null);

        const middleware = userExistsCheck(collection);
        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials / email' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should call next with an error if something goes wrong', async () => {
        // Mock de la collection qui lance une erreur
        const error = new Error('DB error');
        collection.findOne.mockRejectedValue(error);

        // Appel du middleware
        const middleware = userExistsCheck(collection);
        await middleware(req, res, next);

        // On vérifie que next() est appelé avec l'erreur
        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled(); // res.status ne doit pas être appelé en cas d'erreur
    });

});