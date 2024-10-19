export const passwordCheck = verifyPasswordFunction => async (req, res, next) => {
    const { user } = req;

    try{
        const userPass = user.login.inApp.password;
        const isMatch = await verifyPasswordFunction({ password: req.body.password, storedHash: userPass});

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials / password' });
        }

        req.user = user;

        next();

    } catch (err) {
        next(err);
    }
};