import {registerUserUseCase} from "@sh3pherd/use-cases";
import {passwordManager} from "@sh3pherd/password-manager";
import {createMongoUserRepository} from "@sh3pherd/user";
import {RefreshTokenMongoRepository} from "@sh3pherd/auth";
import {mapMongoDocToDomainModel} from "@sh3pherd/shared-utils";
import type {Db} from "mongodb";


export const initAuthUseCase = (deps: { db: Db }) => {
    const userRepo = createMongoUserRepository({ collection: deps.db.collection('users') });
    const refreshTokenRepo = new RefreshTokenMongoRepository({
        collection: deps.db.collection('refreshTokens'),
        mapMongoDocToDomainModelFn: mapMongoDocToDomainModel
    });

    const registerUser = registerUserUseCase({
        findUserByEmailFn: userRepo.findUserByEmail,
        saveUserFn: userRepo.saveUser,
        hashPasswordFn: passwordManager.hashPassword,
        generateUserIdFn: () => 'user_123',
        createUserFn: userRepo.createUser,
    });

    return {
        registerUser,
    }
}