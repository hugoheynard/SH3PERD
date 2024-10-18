export const userExistsCheck = (collection) => async (req, res, next) => {
    try {
        const user = await collection.findOne({'login.inApp.email': req.body.email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials / email' });
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
};