import type {Db} from "mongodb";
import type {IRefreshTokenRepository, IUserRepository} from "@sh3pherd/shared-types";
import {RefreshTokenMongoRepository} from "@sh3pherd/auth";
import {UserMongoRepository} from "@sh3pherd/user";




export type Repositories = {
    refreshTokenRepository: IRefreshTokenRepository;
    userRepository: IUserRepository;
}

export const createRepositories = (input: { db : Db}): Repositories => {
    const { db } = input;

    return {
        refreshTokenRepository: new RefreshTokenMongoRepository({ refreshTokenCollection: db.collection("refreshTokens") }),
        userRepository: new UserMongoRepository({ userCollection: db.collection("users") }),
    }
}