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