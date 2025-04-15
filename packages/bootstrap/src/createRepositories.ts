import type {Db} from "mongodb";
import {createMongoUserRepository} from "@sh3pherd/user";
import {RefreshTokenMongoRepository} from "@sh3pherd/auth";
import {mapMongoDocToDomainModel} from "@sh3pherd/shared-utils";


export const createRepositories = (input: { db : Db}): any => {
    const { db } = input;

    return {
        refreshTokenRepo: new RefreshTokenMongoRepository({
            refreshTokenCollection: db.collection("refreshTokens"),
            mapMongoDocToDomainModelFn: mapMongoDocToDomainModel,
        }),
        userRepo: createMongoUserRepository({ collection: db.collection("users") }),
    }
}