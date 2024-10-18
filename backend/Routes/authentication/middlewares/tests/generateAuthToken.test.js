import { jest } from '@jest/globals';
import { generateAuthToken } from "../generateAuthToken.js";

describe('generateAuthToken middleware', () => {
    let req, res, next, tokenGenerator;

    beforeEach(() => {
        req = {
            user: {
                user: {
                    _id: 1,
                    login: {
                        inApp: {
                            email: 'test@example.com'
                        }
                    }
                }
            }
        };

        res = {};

        next = jest.fn();

        tokenGenerator = {
            getToken: jest.fn()
        };
    });

    test('should generate token and call next', () => {
        const fakeToken = 'fakeAuthToken123';
        tokenGenerator.getToken.mockReturnValue(fakeToken);

        const middleware = generateAuthToken(tokenGenerator);
        middleware(req, res, next);

        expect(tokenGenerator.getToken).toHaveBeenCalledWith({
            payload: {
                id: req.user.user._id,
                email: req.user.user.login.inApp.email
            }
        });

        expect(req.authToken).toBe(fakeToken);
        expect(next).toHaveBeenCalled();
    });

    test('should call next with error if token generation fails', () => {
        const error = new Error('Token generation error');
        tokenGenerator.getToken.mockImplementation(() => { throw error; });

        const middleware = generateAuthToken(tokenGenerator);
        middleware(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});