// Entry point for @sh3pherd/domain-user


export type {
    UserId as UserId,
    UserDomainModel as UserDomainModel,
    CreateUserInput as CreateUserInput,
    CreateUserFunction as CreateUserFunction,
    TSaveUserFunction as TSaveUserFunction,
    TFindUserByEmailFunction as TFindUserByEmailFunction,
    TSaveUserResult as TSaveUserResult,
    IUserRepository as IUserRepository,
} from "./domain/types";



export {createUser as createUser} from "./domain/createUser";
export {createMongoUserRepository as createMongoUserRepository} from "./repository/adapters/mongo/createMongoUserRepository";


