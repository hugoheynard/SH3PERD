export const passwordCheck = passwordHasher => async (req, res, next) => {
    const { user } = req.body;

    try{
        const userPass = user.login.inApp.password;
        const isMatch = await passwordHasher.verify({ password: req.body.password, storedHash: userPass});

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials / password' });
        }

        req.user = user;
        next();

    } catch (err) {
        next(err);
    }
};