import { Global, Module, type Provider, type Type } from '@nestjs/common';
import {
  CONTRACT_REPO,
  CORE_REPOSITORIES,
  EVENT_UNIT_REPO,
  MUSIC_REFERENCE_REPO,
  MUSIC_REPERTOIRE_REPO,
  MUSIC_VERSION_REPO,
  REFRESH_TOKEN_REPO,
  USER_CREDENTIALS_REPO,
  USER_PREFERENCES_REPO,
  USER_PROFILE_REPO,
} from '../nestTokens.js';
import { ConfigService } from '@nestjs/config';
import type { MongoClient } from 'mongodb';
import { createCoreRepositories } from '../initFactories/createCoreRepositories.js';
import { MONGO_CLIENT } from './MongoModule.js';
import {
  type IUserPreferencesRepository,
  UserPreferencesMongoRepository,
} from '../../user/repository/UserPreferencesMongoRepository.js';
import {
  type IUserCredentialsRepository,
  UserCredentialsMongoRepository,
} from '../../user/repository/UserCredentialsMongoRepository.js';
import {
  type IUserProfileRepository,
  UserProfileMongoRepository,
} from '../../user/repository/UserProfileMongoRepository.js';
import {
  type IRefreshTokenRepository,
  RefreshTokenMongoRepository,
} from '../../auth/repositories/RefreshTokenMongoRepository.js';
import type { IContractRepository } from '../../contracts/repositories/contracts.repository.types.js';
import { ContractMongoRepository } from '../../contracts/repositories/ContractMongoRepository.js';
import {
  EventUnitMongoRepository,
  type IEventUnitRepository,
} from '../../calendar/repositories/EventUnitMongoRepository.js';
import type { IMusicReferenceRepository } from '../../music/types/musicReferences.types.js';
import {
  type IMusicVersionRepository,
  MusicVersionRepository,
} from '../../music/repositories/MusicVersionRepository.js';
import type { IMusicRepertoireRepository } from '../../music/types/musicRepertoire.core.types.js';
import { MusicReferenceMongoRepository } from '../../music/repositories/MusicReferenceRepository.js';
import { MusicRepertoireMongoRepository } from '../../music/repositories/MusicRepertoireRepository.js';


// --- HELPERS ---
/**
 * Generic provider factory for creating MongoDB repository providers.
 * @param token
 * @param useClass
 * @param collectionName
 */
export function mongoRepoProvider<T>(
  token: symbol,
  useClass: Type<T>,
  collectionName: string,
): Provider<T> {
  return {
    provide: token,
    useFactory: (client: MongoClient, config: ConfigService): T => {
      const dbName = config.getOrThrow<string>('CORE_DB_NAME');
      return new useClass({ client, dbName, collectionName });
    },
    inject: [MONGO_CLIENT, ConfigService],
  };
}

export type TCoreRepositories = {
  refreshToken: IRefreshTokenRepository;
  //USER
  userCredentials: IUserCredentialsRepository;
  userProfile: IUserProfileRepository;
  userPreferences: IUserPreferencesRepository; // Add UserPreferencesRepository when implemented
  //CONTRACTS
  contract: IContractRepository;
  eventUnit: IEventUnitRepository;
  //MUSIC
  musicReference: IMusicReferenceRepository;
  musicVersion: IMusicVersionRepository;
  musicRepertoire: IMusicRepertoireRepository;
};

/**
 * @module CoreRepositoriesModule
 * @description
 * Global NestJS module that provides core repository implementations for the application.
 * It uses factory providers to create instances of various repositories, each connected to a specific MongoDB collection.
 *
 * This module is marked as `@Global()`, making the repositories injectable across all other modules
 * without needing to explicitly import `CoreRepositoriesModule`.
 */
@Global()
@Module({
  providers: [
    {
      provide: CORE_REPOSITORIES,
      useFactory: (client: MongoClient, config: ConfigService): TCoreRepositories => {
        return createCoreRepositories({
          client,
          dbName: config.get<string>('CORE_DB_NAME'),
        });
      },
      inject: [MONGO_CLIENT, ConfigService],
    },
    mongoRepoProvider<IRefreshTokenRepository>(REFRESH_TOKEN_REPO, RefreshTokenMongoRepository, 'refreshToken'),
    mongoRepoProvider<IUserCredentialsRepository>(USER_CREDENTIALS_REPO, UserCredentialsMongoRepository, 'user_credentials'),
    mongoRepoProvider<IUserProfileRepository>(USER_PROFILE_REPO, UserProfileMongoRepository, 'user_profiles'),
    mongoRepoProvider<IUserPreferencesRepository>(USER_PREFERENCES_REPO, UserPreferencesMongoRepository, 'user_preferences'),
    mongoRepoProvider<IContractRepository>(CONTRACT_REPO, ContractMongoRepository, 'contracts'),
    mongoRepoProvider<IEventUnitRepository>(EVENT_UNIT_REPO, EventUnitMongoRepository, 'eventUnits'),
    mongoRepoProvider<IMusicReferenceRepository>(MUSIC_REFERENCE_REPO, MusicReferenceMongoRepository, 'music_references'),
    mongoRepoProvider<IMusicVersionRepository>(MUSIC_VERSION_REPO, MusicVersionRepository, 'music_version'),
    mongoRepoProvider<IMusicRepertoireRepository>(MUSIC_REPERTOIRE_REPO, MusicRepertoireMongoRepository, 'music_repertoireEntries'),
  ],
  exports: [CORE_REPOSITORIES, USER_PREFERENCES_REPO, REFRESH_TOKEN_REPO, USER_CREDENTIALS_REPO, USER_PROFILE_REPO, CONTRACT_REPO, EVENT_UNIT_REPO, MUSIC_REFERENCE_REPO, MUSIC_VERSION_REPO, MUSIC_REPERTOIRE_REPO],
})
export class CoreRepositoriesModule {}
