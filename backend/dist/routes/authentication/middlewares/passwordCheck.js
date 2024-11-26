import {} from "express";
export const passwordCheck = (verifyPasswordFunction) => async (req, res, next) => {
    const { user } = req.body;
    try {
        const userPass = user.login.inApp.password;
        const isMatch = await verifyPasswordFunction({ password: req.body.password, storedHash: userPass });
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials / password' });
            return;
        }
        req.body.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=passwordCheck.js.map