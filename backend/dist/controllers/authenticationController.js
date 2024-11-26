export const authenticationController = (input) => {
    const { authenticationService } = input;
    return {
        async login(req, res, next) {
            try {
                const token = await authenticationService.login({ email: req.body.email, password: req.body.password });
                res.status(200).json({
                    message: 'Login successful',
                    body: {
                        authToken: token
                    }
                });
                return;
            }
            catch (err) {
                next(err);
            }
        },
        async autoLog(req, res, next) {
            try {
                const { authToken } = req.body;
                if (!authToken) {
                    return res.status(400).json({ message: 'auth_token is required' });
                }
                const authTokenValid = await authenticationService.autoLog({ authToken });
                if (!authTokenValid) {
                    res.status(401).json({
                        message: 'invalid auth_token'
                    });
                    return;
                }
                res.status(200).json({
                    message: 'valid auth_token'
                });
            }
            catch (err) {
                next(err);
            }
        }
    };
};
//# sourceMappingURL=authenticationController.js.map