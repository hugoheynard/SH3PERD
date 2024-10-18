export const generateAuthToken = tokenGenerator => (req, res, next) => {
    const { user } = req.user;

    try {
        req.authToken = tokenGenerator.getToken({
            payload: {
                id: user._id,
                email: user.login.inApp.email
            }
        });

        next()

    } catch(err) {
        next(err);
    }
};