import type {IRegisterMiddlewares} from "./IRegisterMiddlewares";

export const createRegisterMiddlewares = (input: IRegisterMiddlewares): IRegisterMiddlewares => {
    return {
        validateRegistrationInput: input.validateRegistrationInput
    }
};