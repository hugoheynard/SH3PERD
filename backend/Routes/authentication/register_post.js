import {authenticationRouter} from "./authentication_Router.js";

authenticationRouter.post('/register', (req, res) => {
    const { email, password } = req.body;

    try {

    } catch (e){
        if (e.code === 1000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Server error', e });
    }
});