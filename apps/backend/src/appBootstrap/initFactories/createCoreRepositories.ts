import type {IRefreshTokenRepository} from "../../auth/types/auth.core.tokens.contracts.js";
import type {IUserRepository} from "../../user/types/user.core.repo.js";
import type {IContractRepository} from "../../contracts/types/contracts.core.types.js";
import type {MongoClient} from "mongodb";
import {TechnicalError} from "../../utils/errorManagement/errorClasses/TechnicalError.js";
import {RefreshTokenMongoRepository} from "../../auth/repositories/RefreshTokenMongoRepository.js";
import {UserMongoRepository} from "../../user/repository/adapters/mongo/MongoUserRepository.js";
import {ContractMongoRepository} from "../../contracts/core/ContractMongoRepository.js";
import {EventUnitMongoRepository} from "../../calendar/repositories/EventUnitMongoRepository.js";
import {MusicRepertoireMongoRepository} from "../../music/repositories/MusicRepertoireRepository.js";
import type { IMusicRepertoireRepository } from '../../music/types/musicRepertoire.core.types.js';
import type { IMusicReferenceRepository } from '../../music/types/musicReferences.types.js';
import { MusicReferenceMongoRepository } from '../../music/repositories/MusicReferenceRepository.js';


export type TCoreRepositories = {
    refreshTokenRepository: IRefreshTokenRepository;
    userCredentialsRepository: IUserRepository;
    contractRepository: IContractRepository;
    eventUnitsRepository: any;
    //MUSIC
    musicReferenceRepository: IMusicReferenceRepository;
    musicVersionRepository?: any;
    musicRepertoireRepository: IMusicRepertoireRepository;
}

export const createCoreRepositories = (input: {
    client: MongoClient
    dbName: string | undefined
}): TCoreRepositories => {
    try {
        const { client, dbName } = input;

        if (!dbName) {
            throw new TechnicalError("CREATE_MONGO_REPOSITORIES_FAILED", "Database name is required", 500);
        }

        return {
            refreshTokenRepository: new RefreshTokenMongoRepository({ client, dbName, collectionName: "refreshToken" }),
            userCredentialsRepository: new UserMongoRepository({ client, dbName, collectionName: "user_credentials" }),
            contractRepository: new ContractMongoRepository({ client, dbName, collectionName: "contracts" }),
            eventUnitsRepository: new EventUnitMongoRepository({ client, dbName, collectionName: "eventUnits" }),
            //music and playlists
            musicReferenceRepository: new MusicReferenceMongoRepository({ client, dbName, collectionName: "musicReferences" }),
            musicRepertoireRepository: new MusicRepertoireMongoRepository({ client, dbName, collectionName: "musicRepertoireEntries" }),
        }
    } catch (error) {
        if (error instanceof TechnicalError) {
            throw error;
        }
        throw new TechnicalError("CREATE_MONGO_REPOSITORIES_FAILED", "Error creating MongoDB repositories", 500);
    }
}