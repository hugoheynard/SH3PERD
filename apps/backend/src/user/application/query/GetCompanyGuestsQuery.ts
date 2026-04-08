import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { USER_CREDENTIALS_REPO, USER_PROFILE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IUserCredentialsRepository } from '../../infra/UserCredentialsMongoRepo.repository.js';
import type { IUserProfileRepository } from '../../infra/UserProfileMongoRepo.repository.js';

export type TGuestViewModel = {
  user_id: TUserId;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_guest: boolean;
};

export class GetCompanyGuestsQuery {
  constructor(public readonly companyId: TCompanyId) {}
}

/**
 * Returns all guest users (is_guest: true) who are active members
 * of any org node in the given company.
 */
@QueryHandler(GetCompanyGuestsQuery)
export class GetCompanyGuestsHandler implements IQueryHandler<GetCompanyGuestsQuery, TGuestViewModel[]> {
  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly credsRepo: IUserCredentialsRepository,
    @Inject(USER_PROFILE_REPO) private readonly profileRepo: IUserProfileRepository,
  ) {}

  async execute(_query: GetCompanyGuestsQuery): Promise<TGuestViewModel[]> {
    // TODO: scope by company when multi-company is supported.
    // For now, return ALL guest users (is_guest: true).
    const allCreds = await this.credsRepo.findMany({ filter: { is_guest: true } as any });
    const guestCreds = allCreds ?? [];

    if (guestCreds.length === 0) return [];

    const guestIds = guestCreds.map(c => c.id);
    const profiles = await this.profileRepo.findMany({ filter: { user_id: { $in: guestIds } } as any }) ?? [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));

    return guestCreds.map(c => {
      const profile = profileMap.get(c.id);
      return {
        user_id: c.id,
        email: c.email,
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        phone: profile?.phone,
        is_guest: true,
      };
    });
  }
}
