import type {MongoClient} from "mongodb";
import type {IContractRepository, IRefreshTokenRepository, IUserRepository} from "@sh3pherd/shared-types";
import {RefreshTokenMongoRepository} from "@sh3pherd/auth";
import {UserMongoRepository} from "@sh3pherd/user";
import {ContractMongoRepository} from "@sh3pherd/contracts";
import {TechnicalError} from "@sh3pherd/shared-utils";
import {EventUnitMongoRepository} from "@sh3pherd/calendar";



export type Repositories = {
    refreshTokenRepository: IRefreshTokenRepository;
    userRepository: IUserRepository;
    contractRepository: IContractRepository;
    eventUnitsRepository: any;
}

export const createMongoRepositories = (input: {
    client: MongoClient
    dbName: string | undefined
}): Repositories => {
    try {
        const { client, dbName } = input;

        if (!dbName) {
            throw new TechnicalError("CREATE_MONGO_REPOSITORIES_FAILED", "Database name is required", 500);
        }

        return {
            refreshTokenRepository: new RefreshTokenMongoRepository({ client, dbName, collectionName: "refreshToken" }),
            userRepository: new UserMongoRepository({ client, dbName, collectionName: "users" }),
            contractRepository: new ContractMongoRepository({ client, dbName, collectionName: "contracts" }),
            eventUnitsRepository: new EventUnitMongoRepository({ client, dbName, collectionName: "eventUnits" }),
        }
    } catch (error) {
        if (error instanceof TechnicalError) {
            throw error;
        }
        throw new TechnicalError("CREATE_MONGO_REPOSITORIES_FAILED", "Error creating MongoDB repositories", 500);
    }
}