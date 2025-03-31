// Entry point for @sh3pherd/api-auth
import express, {type Router} from 'express';
import {validateRegistrationInput} from "./middlewares/validateRegistrationInput";
import {registrationMiddlewares} from "./middlewares";
import {registerRouter} from "./routes/register.route";
//import loginRoute from './routes/login.route';

const router: Router = express.Router();

export {validateRegistrationInput} from './middlewares/validateRegistrationInput';

router.use('/register', registerRouter({
    registrationController: registrationController(),
    registrationMiddlewares,
})
);
//router.use('/login', loginRoute);

export default router;