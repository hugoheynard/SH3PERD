import { jest } from '@jest/globals';
import { generateAuthToken } from "../generateAuthToken.js";

describe('generateAuthToken middleware', () => {
    let req, res, next, tokenGenerator;

    beforeEach(() => {
        req = {
            user: {
                _id: 1,
                login: {
                    inApp: {
                        email: 'test@example.com'
                    }
                }
            }
        };

        res = {};

        next = jest.fn();

        tokenGenerator = jest.fn();
    });

    test('should generate token and call next', () => {
        const fakeToken = 'fakeAuthToken123';
        tokenGenerator.mockReturnValue(fakeToken);

        const middleware = generateAuthToken(tokenGenerator);
        middleware(req, res, next);

        expect(tokenGenerator).toHaveBeenCalledWith({
            payload: {
                id: req.user._id.toString(),
                email: req.user.login.inApp.email
            }
        });

        expect(req.authToken).toBe(fakeToken);
        expect(next).toHaveBeenCalled();
    });

    test('should call next with error if token generation fails', () => {
        const error = new Error('Token generation error');
        tokenGenerator.mockImplementation(() => { throw error; });

        const middleware = generateAuthToken(tokenGenerator);
        middleware(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});