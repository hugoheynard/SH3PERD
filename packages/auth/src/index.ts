// Entry point for @sh3pherd/auth

export type {
    THashPasswordFunction as THashPasswordFunction,
    TComparePasswordFunction as TComparePasswordFunction
} from './domain/types';

export type {IRegisterController} from './api/controllers/IRegisterController';

export {createRegisterRouter as createRegisterRouter} from './api/routes/createRegisterRouter';
export {createRegisterMiddlewares as createRegisterMiddlewares} from './api/middlewares/createRegisterMiddlewares';
export {createRegisterController as createRegisterController} from './api/controllers/createRegisterController';
export {RegisterService as RegisterService} from './core/services/RegisterService';

//Middleware Exports
export {validateRegistrationInput as validateRegistrationInput} from './api/middlewares/validateRegistrationInput';

