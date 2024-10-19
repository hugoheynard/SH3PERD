/**
 * Middleware to generate an authentication token for a logged-in user.
 *
 * @param {Function} tokenGenerator - A function that generates a token. It takes an object containing the token payload.
 * @returns {Function} - Express middleware function that adds the generated authentication token to the request object.
 *
 * This middleware expects the `req.user` object to be populated with the user information prior to execution (e.g., by an earlier middleware).
 * The generated token is attached to `req.authToken` and passed to the next middleware.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.user - The user object, expected to contain `_id` and `login.inApp.email`.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the stack.
 *
 * @throws Will call `next(err)` if there is an error during token generation.
 */
export const generateAuthToken = tokenGenerator => (req, res, next) => {
    const { user } = req;

    try {
        req.authToken = tokenGenerator({
            payload: {
                id: user._id.toString(),
                email: user.login.inApp.email
            }
        });

        next()

    } catch(err) {
        next(err);
    }
};