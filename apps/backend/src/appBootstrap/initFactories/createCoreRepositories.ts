
import type { IContractRepository } from '../../contracts/repositories/contracts.repository.types.js';
import type { MongoClient } from 'mongodb';
import { TechnicalError } from '../../utils/errorManagement/errorClasses/TechnicalError.js';
import {
  type IRefreshTokenRepository,
  RefreshTokenMongoRepository,
} from '../../auth/repositories/RefreshTokenMongoRepository.js';
import {
  type IUserCredentialsRepository,
  UserCredentialsMongoRepository,
} from '../../user/repository/UserCredentialsMongoRepository.js';
import { ContractMongoRepository } from '../../contracts/repositories/ContractMongoRepository.js';
import {
  EventUnitMongoRepository,
  type IEventUnitRepository,
} from '../../calendar/repositories/EventUnitMongoRepository.js';
import { MusicRepertoireMongoRepository } from '../../music/repositories/MusicRepertoireRepository.js';
import type { IMusicRepertoireRepository } from '../../music/types/musicRepertoire.core.types.js';
import type { IMusicReferenceRepository } from '../../music/types/musicReferences.types.js';
import { MusicReferenceMongoRepository } from '../../music/repositories/MusicReferenceRepository.js';
import type { IMusicVersionRepository } from '../../music/repositories/MusicVersionRepository.js';
import { MusicVersionRepository } from '../../music/repositories/MusicVersionRepository.js';
import type { IUserProfileRepository } from '../../user/types/user.profile.contracts.js';
import { UserProfileMongoRepository } from '../../user/repository/UserProfileMongoRepository.js';
import { UserPreferencesMongoRepository } from '../../user/repository/UserPreferencesMongoRepository.js';


export type TCoreRepositories = {
  refreshToken: IRefreshTokenRepository;
  //USER
  userCredentials: IUserCredentialsRepository;
  userProfile: IUserProfileRepository;
  userPreferences: any; // Add UserPreferencesRepository when implemented
  //CONTRACTS
  contract: IContractRepository;
  eventUnit: IEventUnitRepository;
  //MUSIC
  musicReference: IMusicReferenceRepository;
  musicVersion: IMusicVersionRepository;
  musicRepertoire: IMusicRepertoireRepository;
};

export const createCoreRepositories = (input: {
  client: MongoClient;
  dbName: string | undefined;
}): TCoreRepositories => {
  try {
    const { client, dbName } = input;

    if (!dbName) {
      throw new TechnicalError(
        'CREATE_MONGO_REPOSITORIES_FAILED',
        'Database name is required',
        500,
      );
    }

    return {
      refreshToken: new RefreshTokenMongoRepository({ client, dbName, collectionName: 'refreshToken' }),
      //USER
      userCredentials: new UserCredentialsMongoRepository({ client, dbName, collectionName: 'user_credentials'}),
      userProfile: new UserProfileMongoRepository({ client, dbName, collectionName: 'user_profiles' }),
      userPreferences: new UserPreferencesMongoRepository({ client, dbName, collectionName: 'user_preferences' }),
      //CONTRACT
      contract: new ContractMongoRepository({ client, dbName, collectionName: 'contracts' }),
      eventUnit: new EventUnitMongoRepository({ client, dbName, collectionName: 'eventUnits' }),
      //music and playlists
      musicReference: new MusicReferenceMongoRepository({ client, dbName, collectionName: 'music_references' }),
      musicVersion: new MusicVersionRepository({ client, dbName, collectionName: 'music_versions' }),
      musicRepertoire: new MusicRepertoireMongoRepository({ client, dbName, collectionName: 'music_repertoireEntries' }),
    };
  } catch (error) {
    if (error instanceof TechnicalError) {
      throw error;
    }
    throw new TechnicalError(
      'CREATE_MONGO_REPOSITORIES_FAILED',
      'Error creating MongoDB repositories',
      500,
    );
  }
};
