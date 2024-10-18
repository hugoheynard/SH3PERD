import { jest } from '@jest/globals';
import {passwordCheck} from "../passwordCheck.js";

describe('passwordCheck middleware', ()=> {
    let req, res, next, hasher, user
    const validPass ='d4b4385fbfbf321792b1ad154d514c56:aebb9aad2ddc4d0bb12be6675e28eb018186754422943e1d148fd4a821fc6a8e311fae37d863dc0541d93b2ab8249b4c7ac65422a60bc004be133e127696b326';
    const invalidPass ='invalidHash';

    beforeEach(()=> {
        req = {
            body: {
                password: 'plainPassword',
                user: {
                    _id: 1,
                    username: 'test user',
                    login: {
                        inApp: {
                            email: 'test@example.com',
                            password: validPass
                        }
                    }
                }
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();

        hasher = {
            verify: jest.fn()
        };
    })


    test('should verify the password with the hasher and call next if valid', async () => {
        hasher.verify.mockResolvedValue(true);

        const middleware = passwordCheck(hasher);
        await middleware(req, res, next);

        expect(hasher.verify).toHaveBeenCalledWith({
            password: 'plainPassword',
            storedHash: validPass
        });

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    })

    test('should return 401 if the password is invalid', async () => {
        hasher.verify.mockResolvedValue(false);

        const middleware = passwordCheck(hasher);
        await middleware(req, res, next);

        expect(hasher.verify).toHaveBeenCalledWith({
            password: 'plainPassword',
            storedHash: validPass
        });

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials / password' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should call next with error if hasher throws an error', async () => {
        const error = new Error('Hasher error');
        hasher.verify.mockRejectedValue(error);

        const middleware = passwordCheck(hasher);
        await middleware(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});