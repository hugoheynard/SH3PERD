export const validateAuthInput = (req, res, next) => {
    const { email, password } = req.body;

    try {

        if (!email) {
            return res.status(401).json({message: 'Missing email'});
        }

        if (!password) {
            return res.status(401).json({message: 'Missing password'});
        }

        req.body.email = email.trim().toLowerCase();
        req.body.password = password.trim();
        next();

    } catch (err) {
        next(err);
    }
};