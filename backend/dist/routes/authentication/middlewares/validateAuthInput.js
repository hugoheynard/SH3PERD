import {} from 'express';
export const validateAuthInput = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email) {
            res.status(401).json({ message: 'Missing email' });
            return;
        }
        if (!password) {
            res.status(401).json({ message: 'Missing password' });
            return;
        }
        req.body.email = email.trim().toLowerCase();
        req.body.password = password.trim();
        next();
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=validateAuthInput.js.map