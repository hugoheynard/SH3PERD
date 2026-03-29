import { Global, Module, type Provider, type Type } from '@nestjs/common';
import {
  CONTRACT_READ_REPO,
  CONTRACT_REPO,
  EVENT_UNIT_REPO,
  MUSIC_REFERENCE_REPO,
  MUSIC_REPERTOIRE_REPO,
  MUSIC_VERSION_REPO,
  REFRESH_TOKEN_REPO,
  USER_CREDENTIALS_REPO, USER_GROUPS_REPO,
  USER_PREFERENCES_REPO,
  USER_PROFILE_REPO,
} from '../nestTokens.js';
import { ConfigService } from '@nestjs/config';
import type { MongoClient } from 'mongodb';
import {
  type IUserPreferencesRepository,
  UserPreferencesMongoRepository,
} from '../../user/infra/UserPreferencesMongoRepo.repository.js';
import {
  type IUserCredentialsRepository,
  UserCredentialsMongoRepository,
} from '../../user/infra/UserCredentialsMongoRepo.repository.js';
import {
  type IUserProfileRepository,
  UserProfileMongoRepository,
} from '../../user/infra/UserProfileMongoRepo.repository.js';
import {
  type IRefreshTokenRepository,
  RefreshTokenMongoRepository,
} from '../../auth/repositories/RefreshTokenMongoRepository.js';
import {
  ContractMongoRepository,
  type IContractRepository,
} from '../../contracts/repositories/ContractMongoRepository.js';
import {
  EventUnitMongoRepository,
  type IEventUnitRepository,
} from '../../calendar/repositories/EventUnitMongoRepository.js';
import type { IMusicReferenceRepository } from '../../music/types/musicReferences.types.js';
import {
  type IMusicVersionRepository,
  MusicVersionRepository,
} from '../../music/repositories/MusicVersionRepository.js';
import type { IMusicRepertoireRepository } from '../../music/repositories/MusicRepertoireRepository.js';
import { MusicReferenceMongoRepository } from '../../music/repositories/MusicReferenceRepository.js';
import { MusicRepertoireMongoRepository } from '../../music/repositories/MusicRepertoireRepository.js';
import {
  type IUserGroupsMongoRepository,
  UserGroupsMongoRepository,
} from '../../userGroups/infra/UserGroupsMongoRepository.js';
import { MONGO_CLIENT } from './db.tokens.js';
import { ContractReadRepository } from '../../contracts/repositories/ContractReadRepository.js';
import { CompanyMongoRepository, type ICompanyRepository } from '../../company/repositories/CompanyMongoRepository.js';
import { TeamMongoRepository, type ITeamRepository } from '../../company/repositories/TeamMongoRepository.js';
import { CastMembershipEventMongoRepository, type ICastMembershipEventRepository } from '../../company/repositories/CastMembershipEventMongoRepository.js';
import { COMPANY_REPO, CAST_REPO, CAST_MEMBERSHIP_EVENT_REPO } from '../nestTokens.js';


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
  userPreferences: IUserPreferencesRepository;
  userGroups: IUserGroupsMongoRepository;
  //CONTRACTS
  contract: IContractRepository;
  eventUnit: IEventUnitRepository;
  //MUSIC
  musicReference: IMusicReferenceRepository;
  musicVersion: IMusicVersionRepository;
  musicRepertoire: IMusicRepertoireRepository;
  //COMPANY
  company: ICompanyRepository;
  cast: ITeamRepository;
  castMembershipEvent: ICastMembershipEventRepository;
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
    mongoRepoProvider<IRefreshTokenRepository>(REFRESH_TOKEN_REPO, RefreshTokenMongoRepository, 'refreshToken'),
    mongoRepoProvider<IUserCredentialsRepository>(USER_CREDENTIALS_REPO, UserCredentialsMongoRepository, 'user_credentials'),
    mongoRepoProvider<IUserProfileRepository>(USER_PROFILE_REPO, UserProfileMongoRepository, 'user_profiles'),
    mongoRepoProvider<IUserPreferencesRepository>(USER_PREFERENCES_REPO, UserPreferencesMongoRepository, 'user_preferences'),
    mongoRepoProvider<IUserGroupsMongoRepository>(USER_GROUPS_REPO, UserGroupsMongoRepository, 'user_groups'),
    mongoRepoProvider<IContractRepository>(CONTRACT_REPO, ContractMongoRepository, 'contracts'),
    { provide: CONTRACT_READ_REPO, useClass: ContractReadRepository },
    mongoRepoProvider<IEventUnitRepository>(EVENT_UNIT_REPO, EventUnitMongoRepository, 'eventUnits'),
    mongoRepoProvider<IMusicReferenceRepository>(MUSIC_REFERENCE_REPO, MusicReferenceMongoRepository, 'music_references'),
    mongoRepoProvider<IMusicVersionRepository>(MUSIC_VERSION_REPO, MusicVersionRepository, 'music_version'),
    mongoRepoProvider<IMusicRepertoireRepository>(MUSIC_REPERTOIRE_REPO, MusicRepertoireMongoRepository, 'music_repertoireEntries'),
    mongoRepoProvider<ICompanyRepository>(COMPANY_REPO, CompanyMongoRepository, 'companies'),
    mongoRepoProvider<ITeamRepository>(CAST_REPO, TeamMongoRepository, 'teams'),
    mongoRepoProvider<ICastMembershipEventRepository>(CAST_MEMBERSHIP_EVENT_REPO, CastMembershipEventMongoRepository, 'cast_membership_events'),
  ],
  exports: [
    USER_PREFERENCES_REPO,
    REFRESH_TOKEN_REPO,
    USER_CREDENTIALS_REPO,
    USER_PROFILE_REPO,
    CONTRACT_REPO,
    CONTRACT_READ_REPO,
    USER_GROUPS_REPO,
    EVENT_UNIT_REPO,
    MUSIC_REFERENCE_REPO,
    MUSIC_VERSION_REPO,
    MUSIC_REPERTOIRE_REPO,
    COMPANY_REPO,
    CAST_REPO,
    CAST_MEMBERSHIP_EVENT_REPO,
  ],
})
export class CoreRepositoriesModule {}
