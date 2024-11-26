import {} from "express";
import {} from "mongodb";
export const userExistsCheck = (collection) => async (req, res, next) => {
    try {
        const user = await collection.findOne({ 'login.inApp.email': req.body.email });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials / email' });
            return;
        }
        req.body.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=userExistCheck.js.map