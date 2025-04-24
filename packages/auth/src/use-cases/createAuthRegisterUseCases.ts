import type {TLoginUseCaseFactory, TRegisterUserUseCaseFactory} from "@sh3pherd/shared-types";
import {createRegisterUserUseCase} from "./createRegisterUserUseCase.js";
import {createLoginUseCase} from "./createLoginUseCase.js";


export const createAuthRegisterUseCases = (deps) => {
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
        const registerUserUseCase: TRegisterUserUseCaseFactory = createRegisterUserUseCase({
            generateUserIdFn,
            createUserFn,
            findUserByEmailFn,
            hashPasswordFn,
            saveUserFn,
        });

        const loginUseCase: TLoginUseCaseFactory = createLoginUseCase({
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