import type {Db} from "mongodb";
import {createMongoUserRepository} from "@sh3pherd/user";
import {RefreshTokenMongoRepository} from "@sh3pherd/auth";
import type {IRefreshTokenRepository} from "@sh3pherd/shared-types";


export type Repositories = {
    refreshTokenRepository: IRefreshTokenRepository;
    userRepository: ReturnType<typeof createMongoUserRepository>;
}

export const createRepositories = (input: { db : Db}): Repositories => {
    const { db } = input;

    return {
        refreshTokenRepository: new RefreshTokenMongoRepository({ refreshTokenCollection: db.collection("refreshTokens") }),
        userRepository: createMongoUserRepository({ collection: db.collection("users") }),
    }
}