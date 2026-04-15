import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { Filter } from 'mongodb';
import type {
  TCompanyId,
  TUserCredentialsRecord,
  TUserId,
  TUserProfileRecord,
} from '@sh3pherd/shared-types';
import {
  USER_CREDENTIALS_REPO,
  USER_PROFILE_REPO,
  GUEST_COMPANY_REPO,
} from '../../../appBootstrap/nestTokens.js';
import type { IUserCredentialsRepository } from '../../infra/UserCredentialsMongoRepo.repository.js';
import type { IUserProfileRepository } from '../../infra/UserProfileMongoRepo.repository.js';
import type { IGuestCompanyRepository } from '../../infra/GuestCompanyMongoRepo.repository.js';

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
 * Returns all guest users linked to the given company via the `guest_company` junction.
 *
 * A guest belongs to a company because someone explicitly added them to that company's
 * directory (settings tab) or to one of its nodes. The same guest can belong to multiple
 * companies — the junction allows it.
 */
@QueryHandler(GetCompanyGuestsQuery)
export class GetCompanyGuestsHandler implements IQueryHandler<
  GetCompanyGuestsQuery,
  TGuestViewModel[]
> {
  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly credsRepo: IUserCredentialsRepository,
    @Inject(USER_PROFILE_REPO) private readonly profileRepo: IUserProfileRepository,
    @Inject(GUEST_COMPANY_REPO) private readonly guestCompanyRepo: IGuestCompanyRepository,
  ) {}

  async execute(query: GetCompanyGuestsQuery): Promise<TGuestViewModel[]> {
    const guestIds = await this.guestCompanyRepo.findGuestIdsByCompany(query.companyId);
    if (guestIds.length === 0) return [];

    const credentialsFilter: Filter<TUserCredentialsRecord> = {
      id: { $in: guestIds },
      is_guest: true,
    };
    const profilesFilter: Filter<TUserProfileRecord> = { user_id: { $in: guestIds } };

    const [creds, profiles] = await Promise.all([
      this.credsRepo.findMany({ filter: credentialsFilter }),
      this.profileRepo.findMany({ filter: profilesFilter }),
    ]);

    const credsList = creds ?? [];
    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

    return credsList.map((c) => {
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
