import { Global, Module, type Provider, type Type } from '@nestjs/common';
import {
  CONTRACT_READ_REPO,
  CONTRACT_REPO,
  EVENT_UNIT_REPO,
  MUSIC_REFERENCE_REPO,
  MUSIC_REPERTOIRE_REPO,
  MUSIC_VERSION_REPO,
  MUSIC_TAB_CONFIGS_REPO,
  PLATFORM_CONTRACT_REPO,
  USAGE_COUNTER_REPO,
  REFRESH_TOKEN_REPO,
  USER_CREDENTIALS_REPO,
  USER_GROUPS_REPO,
  USER_PREFERENCES_REPO,
  USER_PROFILE_REPO,
  GUEST_COMPANY_REPO,
  PASSWORD_RESET_TOKEN_REPO,
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
import {
  type IMusicTabConfigsRepository,
  MusicTabConfigsRepository,
} from '../../music/repositories/MusicTabConfigsRepository.js';
import type { IMusicRepertoireRepository } from '../../music/repositories/MusicRepertoireRepository.js';
import { MusicReferenceMongoRepository } from '../../music/repositories/MusicReferenceRepository.js';
import { MusicRepertoireMongoRepository } from '../../music/repositories/MusicRepertoireRepository.js';
import {
  type IUserGroupsMongoRepository,
  UserGroupsMongoRepository,
} from '../../userGroups/infra/UserGroupsMongoRepository.js';
import {
  type IGuestCompanyRepository,
  GuestCompanyMongoRepository,
} from '../../user/infra/GuestCompanyMongoRepo.repository.js';
import {
  type IPlatformContractRepository,
  PlatformContractMongoRepository,
} from '../../platform-contract/infra/PlatformContractMongoRepo.js';
import {
  type IUsageCounterRepository,
  UsageCounterMongoRepository,
} from '../../quota/infra/UsageCounterMongoRepo.js';
import {
  type ICreditPurchaseRepository,
  CreditPurchaseMongoRepository,
} from '../../quota/infra/CreditPurchaseMongoRepo.js';
import {
  type IAnalyticsEventRepository,
  AnalyticsEventMongoRepository,
} from '../../analytics/infra/AnalyticsEventMongoRepo.js';
import { MONGO_CLIENT } from './db.tokens.js';
import { ContractReadRepository } from '../../contracts/repositories/ContractReadRepository.js';
import {
  CompanyMongoRepository,
  type ICompanyRepository,
} from '../../company/repositories/CompanyMongoRepository.js';
import {
  OrgNodeMongoRepository,
  type IOrgNodeRepository,
} from '../../company/repositories/OrgNodeMongoRepository.js';
import {
  OrgMembershipEventMongoRepository,
  type IOrgMembershipEventRepository,
} from '../../company/repositories/OrgMembershipEventMongoRepository.js';
import {
  IntegrationCredentialsMongoRepository,
  type IIntegrationCredentialsRepository,
} from '../../integrations/repositories/IntegrationCredentialsRepository.js';
import {
  PasswordResetTokenMongoRepository,
  type IPasswordResetTokenRepository,
} from '../../auth/repositories/PasswordResetTokenMongoRepo.js';
import {
  COMPANY_REPO,
  ORG_NODE_REPO,
  ORG_MEMBERSHIP_EVENT_REPO,
  PLAYLIST_REPO,
  PLAYLIST_TRACK_REPO,
  ANALYTICS_EVENT_REPO,
  CREDIT_PURCHASE_REPO,
} from '../nestTokens.js';
import { INTEGRATION_CREDENTIALS_REPO } from '../../integrations/integrations.tokens.js';
import {
  type IPlaylistRepository,
  PlaylistMongoRepository,
} from '../../playlists-v2/repositories/PlaylistRepository.js';
import {
  type IPlaylistTrackRepository,
  PlaylistTrackMongoRepository,
} from '../../playlists-v2/repositories/PlaylistTrackRepository.js';

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
  //PLAYLISTS
  playlist: IPlaylistRepository;
  playlistTrack: IPlaylistTrackRepository;
  //COMPANY
  company: ICompanyRepository;
  orgNode: IOrgNodeRepository;
  orgMembershipEvent: IOrgMembershipEventRepository;
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
    mongoRepoProvider<IRefreshTokenRepository>(
      REFRESH_TOKEN_REPO,
      RefreshTokenMongoRepository,
      'refreshToken',
    ),
    mongoRepoProvider<IUserCredentialsRepository>(
      USER_CREDENTIALS_REPO,
      UserCredentialsMongoRepository,
      'user_credentials',
    ),
    mongoRepoProvider<IUserProfileRepository>(
      USER_PROFILE_REPO,
      UserProfileMongoRepository,
      'user_profiles',
    ),
    mongoRepoProvider<IUserPreferencesRepository>(
      USER_PREFERENCES_REPO,
      UserPreferencesMongoRepository,
      'user_preferences',
    ),
    mongoRepoProvider<IUserGroupsMongoRepository>(
      USER_GROUPS_REPO,
      UserGroupsMongoRepository,
      'user_groups',
    ),
    mongoRepoProvider<IGuestCompanyRepository>(
      GUEST_COMPANY_REPO,
      GuestCompanyMongoRepository,
      'guest_company',
    ),
    mongoRepoProvider<IPlatformContractRepository>(
      PLATFORM_CONTRACT_REPO,
      PlatformContractMongoRepository,
      'platform_contracts',
    ),
    mongoRepoProvider<IUsageCounterRepository>(
      USAGE_COUNTER_REPO,
      UsageCounterMongoRepository,
      'platform_usage',
    ),
    mongoRepoProvider<IContractRepository>(CONTRACT_REPO, ContractMongoRepository, 'contracts'),
    { provide: CONTRACT_READ_REPO, useClass: ContractReadRepository },
    mongoRepoProvider<IEventUnitRepository>(
      EVENT_UNIT_REPO,
      EventUnitMongoRepository,
      'eventUnits',
    ),
    mongoRepoProvider<IMusicReferenceRepository>(
      MUSIC_REFERENCE_REPO,
      MusicReferenceMongoRepository,
      'music_references',
    ),
    mongoRepoProvider<IMusicVersionRepository>(
      MUSIC_VERSION_REPO,
      MusicVersionRepository,
      'music_version',
    ),
    mongoRepoProvider<IMusicRepertoireRepository>(
      MUSIC_REPERTOIRE_REPO,
      MusicRepertoireMongoRepository,
      'music_repertoireEntries',
    ),
    mongoRepoProvider<IMusicTabConfigsRepository>(
      MUSIC_TAB_CONFIGS_REPO,
      MusicTabConfigsRepository,
      'music_tab_configs',
    ),
    mongoRepoProvider<IPlaylistRepository>(PLAYLIST_REPO, PlaylistMongoRepository, 'playlists'),
    mongoRepoProvider<IPlaylistTrackRepository>(
      PLAYLIST_TRACK_REPO,
      PlaylistTrackMongoRepository,
      'playlist_tracks',
    ),
    mongoRepoProvider<ICompanyRepository>(COMPANY_REPO, CompanyMongoRepository, 'companies'),
    mongoRepoProvider<IOrgNodeRepository>(ORG_NODE_REPO, OrgNodeMongoRepository, 'org_nodes'),
    mongoRepoProvider<IOrgMembershipEventRepository>(
      ORG_MEMBERSHIP_EVENT_REPO,
      OrgMembershipEventMongoRepository,
      'org_membership_events',
    ),
    mongoRepoProvider<IIntegrationCredentialsRepository>(
      INTEGRATION_CREDENTIALS_REPO,
      IntegrationCredentialsMongoRepository,
      'integration_credentials',
    ),
    mongoRepoProvider<IPasswordResetTokenRepository>(
      PASSWORD_RESET_TOKEN_REPO,
      PasswordResetTokenMongoRepository,
      'password_reset_tokens',
    ),
    mongoRepoProvider<ICreditPurchaseRepository>(
      CREDIT_PURCHASE_REPO,
      CreditPurchaseMongoRepository,
      'credit_purchases',
    ),
    mongoRepoProvider<IAnalyticsEventRepository>(
      ANALYTICS_EVENT_REPO,
      AnalyticsEventMongoRepository,
      'analytics_events',
    ),
  ],
  exports: [
    USER_PREFERENCES_REPO,
    REFRESH_TOKEN_REPO,
    USER_CREDENTIALS_REPO,
    USER_PROFILE_REPO,
    CONTRACT_REPO,
    CONTRACT_READ_REPO,
    USER_GROUPS_REPO,
    GUEST_COMPANY_REPO,
    PLATFORM_CONTRACT_REPO,
    USAGE_COUNTER_REPO,
    EVENT_UNIT_REPO,
    MUSIC_REFERENCE_REPO,
    MUSIC_VERSION_REPO,
    MUSIC_REPERTOIRE_REPO,
    MUSIC_TAB_CONFIGS_REPO,
    PLAYLIST_REPO,
    PLAYLIST_TRACK_REPO,
    COMPANY_REPO,
    ORG_NODE_REPO,
    ORG_MEMBERSHIP_EVENT_REPO,
    INTEGRATION_CREDENTIALS_REPO,
    PASSWORD_RESET_TOKEN_REPO,
    CREDIT_PURCHASE_REPO,
    ANALYTICS_EVENT_REPO,
  ],
})
export class CoreRepositoriesModule {}
