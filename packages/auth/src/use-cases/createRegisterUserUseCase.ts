import type {TRegisterUserUseCaseFactory} from "@sh3pherd/shared-types";
import {BusinessError, TechnicalError} from "@sh3pherd/shared-utils";


export const createRegisterUserUseCase: TRegisterUserUseCaseFactory = (deps) => {

    return async (request) => {
        const { findUserByEmailFn, hashPasswordFn, createUserFn, saveUserFn, generateUserIdFn } = deps;

        const existing = await findUserByEmailFn({ email: request.email });

        if (existing) {
            throw new BusinessError('Email already in use', 'USER_ALREADY_EXISTS', 409);
        }

        const user = createUserFn({
            user_id: generateUserIdFn(),
            email: request.email,
            password: await hashPasswordFn({ password: request.password }),
        });

        const saveResult = await saveUserFn({ user });

        if (!saveResult) {
            throw new TechnicalError('Failed to save user', 'USER_CREATION_FAILED', 500);
        }

        return { user_id: user.user_id };
    };

};
