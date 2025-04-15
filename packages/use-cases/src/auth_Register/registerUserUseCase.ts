import type {
    TFindUserByEmail_shared,
    TSaveUser_shared,
    TUserId_shared
} from "@sh3pherd/shared-types/user.types.shared";
import type {THashPassword} from "@sh3pherd/auth";


export type RegisterDTO = {
    email: string;
    password: string;
}

export type TRegisterUserUseCaseDeps = {
    findUserByEmailFn: TFindUserByEmail_shared;
    hashPasswordFn: THashPassword;
    createUserFn: (input: RegisterDTO & { user_id: string }) => any;
    saveUserFn: TSaveUser_shared;
    generateUserIdFn: () => TUserId_shared;
};


export const registerUserUseCase = (deps: TRegisterUserUseCaseDeps) => async (input : RegisterDTO): Promise<UserDTO> => {
    const { findUserByEmailFn, hashPasswordFn, createUserFn, saveUserFn, generateUserIdFn } = deps;

    const existing = await findUserByEmailFn({ email: dto.email });

    if (existing) throw new Error('Email already in use');


    const user = createUserFn({
        user_id: generateUserIdFn(),
        ...input,
        password: await hashPasswordFn({ password: dto.password }),
    });

    await saveUserFn(user);

    return user;
};
