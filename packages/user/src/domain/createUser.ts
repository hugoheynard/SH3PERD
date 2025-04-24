import type {TCreateUserInput, TUserDomainModel} from "@sh3pherd/shared-types";


export const createUser = (input: TCreateUserInput): TUserDomainModel => {
    const { email, password, user_id } = input;
    return {
        user_id,
        email,
        password,
        created_at: new Date(),
        updated_at: new Date(),
    };
};