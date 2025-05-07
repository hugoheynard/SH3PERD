import type {Db, MongoClient} from "mongodb";
import type {IContractRepository, IRefreshTokenRepository, IUserRepository} from "@sh3pherd/shared-types";
import {RefreshTokenMongoRepository} from "@sh3pherd/auth";
import {UserMongoRepository} from "@sh3pherd/user";
import {ContractMongoRepository} from "@sh3pherd/contracts";



export type Repositories = {
    refreshTokenRepository: IRefreshTokenRepository;
    userRepository: IUserRepository;
    contractRepository: IContractRepository;
}

export const createMongoRepositories = (input: {
    client: MongoClient
    dbName: string | undefined
}): Repositories => {
    const { client, dbName } = input;

    return {
        refreshTokenRepository: new RefreshTokenMongoRepository({ client, dbName, collectionName: "refreshToken" }),
        userRepository: new UserMongoRepository({ client, dbName, collectionName: "users" }),
        contractRepository: new ContractMongoRepository({ client, dbName, collectionName: "contracts" }),
    }
}