import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TUserId, TCompanyId } from '@sh3pherd/shared-types';
import type { IUserCredentialsRepository } from '../../infra/UserCredentialsMongoRepo.repository.js';
import type { IUserProfileRepository } from '../../infra/UserProfileMongoRepo.repository.js';
import type { IGuestCompanyRepository } from '../../infra/GuestCompanyMongoRepo.repository.js';
import {
  USER_CREDENTIALS_REPO,
  USER_PROFILE_REPO,
  GUEST_COMPANY_REPO,
} from '../../../appBootstrap/nestTokens.js';
import { UserCredentialEntity } from '../../domain/UserCredential.entity.js';
import { UserProfileEntity } from '../../domain/UserProfileEntity.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export type TCreateGuestUserDTO = {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_id?: TCompanyId;
};

export type TCreateGuestUserResult = {
  user_id: TUserId;
  email: string;
  first_name: string;
  last_name: string;
  is_guest: true;
};

export class CreateGuestUserCommand {
  constructor(
    public readonly payload: TCreateGuestUserDTO,
    public readonly actorId: TUserId,
  ) {}
}

/**
 * Creates a guest user — a lightweight account with no password.
 *
 * The guest gets real user_credentials (is_guest: true, password: null)
 * and a user_profile. They can be added to org nodes as regular members.
 *
 * If the email already exists:
 * - as a guest → returns the existing user (deduplication)
 * - as a real user → throws 409 (use addMember with their user_id instead)
 */
@CommandHandler(CreateGuestUserCommand)
export class CreateGuestUserHandler implements ICommandHandler<
  CreateGuestUserCommand,
  TCreateGuestUserResult
> {
  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly credsRepo: IUserCredentialsRepository,
    @Inject(USER_PROFILE_REPO) private readonly profileRepo: IUserProfileRepository,
    @Inject(GUEST_COMPANY_REPO) private readonly guestCompanyRepo: IGuestCompanyRepository,
  ) {}

  async execute(cmd: CreateGuestUserCommand): Promise<TCreateGuestUserResult> {
    const { payload, actorId } = cmd;

    // Deduplication: check if email already exists
    const existing = await this.credsRepo.findOne({ filter: { email: payload.email } });

    if (existing) {
      if (existing.is_guest) {
        // Existing guest — link to this company too if requested (idempotent)
        if (payload.company_id) {
          await this.guestCompanyRepo.link(existing.id, payload.company_id);
        }
        return {
          user_id: existing.id,
          email: existing.email,
          first_name: payload.first_name,
          last_name: payload.last_name,
          is_guest: true,
        };
      }
      throw new BusinessError('Email belongs to an active user — add them as a regular member', {
        code: 'USER_ALREADY_EXISTS',
        status: 409,
      });
    }

    // Create guest credentials (no password)
    const credentials = new UserCredentialEntity({
      email: payload.email,
      password: null,
      email_verified: false,
      active: true,
      is_guest: true,
    });

    // Create profile
    const profile = new UserProfileEntity({
      user_id: credentials.id,
      first_name: payload.first_name,
      last_name: payload.last_name,
      phone: payload.phone,
      active: true,
    });

    const session = this.credsRepo.startSession();
    try {
      await session.withTransaction(async () => {
        await this.credsRepo.save(
          { ...credentials.toDomain, ...RecordMetadataUtils.create(actorId) },
          session,
        );
        await this.profileRepo.save(
          { ...profile.toDomain, ...RecordMetadataUtils.create(actorId) },
          session,
        );
      });

      // Link to company (outside the transaction — guest_company is idempotent and small)
      if (payload.company_id) {
        await this.guestCompanyRepo.link(credentials.id, payload.company_id);
      }

      return {
        user_id: credentials.id,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        is_guest: true,
      };
    } finally {
      await session.endSession();
    }
  }
}
