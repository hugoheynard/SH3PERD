// Entry point for @sh3pherd/api-auth
import express, {type Router} from 'express';
import registerRoute from './routes/register.route';
import {registrationController} from "../../backend/dist/registration/registrationController";
import {validateRegistrationInput} from "./middlewares/validateRegistrationInput";
import {registrationMiddlewares} from "./middlewares";
//import loginRoute from './routes/login.route';

const router: Router = express.Router();

router.use('/register', registerRoute({
    registrationController: registrationController(),
    registrationMiddlewares,
})
);
//router.use('/login', loginRoute);

export default router;