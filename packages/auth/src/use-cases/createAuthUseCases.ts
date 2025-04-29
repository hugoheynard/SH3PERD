import {createRegisterUserUseCase} from "./createRegisterUserUseCase.js";
import {createLoginUseCase} from "./createLoginUseCase.js";


export const createAuthUseCases = (deps: any) => {
    const {
        findUserByEmailFn,
        hashPasswordFn,
        comparePasswordFn,
        createUserFn,
        saveUserFn,
        generateUserIdFn,
        createAuthSessionFn
    } = deps;

    try {
        const registerUserUseCase = createRegisterUserUseCase({
            generateUserIdFn,
            createUserFn,
            findUserByEmailFn,
            hashPasswordFn,
            saveUserFn,
        });

        const loginUseCase = createLoginUseCase({
            findUserByEmailFn,
            comparePasswordFn,
            createAuthSessionFn
        });

        return {
            registerUserUseCase,
            loginUseCase
        };
    } catch (err) {
        throw new Error(`Error creating auth register use cases: ${err}`);
    }
}