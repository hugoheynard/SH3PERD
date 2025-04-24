import type {TRegisterUserUseCaseFactory} from "@sh3pherd/shared-types";


export const createRegisterUserUseCase: TRegisterUserUseCaseFactory = (deps) => async (request) => {
    const { findUserByEmailFn, hashPasswordFn, createUserFn, saveUserFn, generateUserIdFn } = deps;

    const existing = await findUserByEmailFn({ email: request.email });

    if (existing) {
        throw new Error('Email already in use');
    }

    const user = createUserFn({
        user_id: generateUserIdFn(),
        email: request.email,
        password: await hashPasswordFn({ password: request.password }),
    });

    const saveResult = await saveUserFn({ user });

    if (!saveResult) {
        throw new Error('Failed to save user');
    }

    return user;
};
