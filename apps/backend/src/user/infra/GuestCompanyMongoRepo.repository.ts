import { Injectable } from '@nestjs/common';
import { BaseMongoRepository, type TBaseMongoRepoDeps } from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';
import type { IBaseCRUD } from '../../utils/repoAdaptersHelpers/repository.genericFunctions.types.js';
import type { TUserId, TCompanyId } from '@sh3pherd/shared-types';

/**
 * Junction record linking a guest user to a company.
 *
 * Guests are real users (`user_credentials.is_guest: true`) but they don't carry
 * a contract → without this junction we can't tell which company they belong to.
 *
 * - One row per (user_id, company_id) pair → a guest can belong to multiple companies
 * - Created at guest creation time (settings tab) or when an existing guest is added to another company
 * - Removed when the company explicitly removes the guest from its directory
 */
export type TGuestCompanyRecord = {
  user_id: TUserId;
  company_id: TCompanyId;
  created_at: Date;
};

export interface IGuestCompanyRepository extends IBaseCRUD<TGuestCompanyRecord> {
  /** Returns the user IDs of all guests linked to a given company. */
  findGuestIdsByCompany(companyId: TCompanyId): Promise<TUserId[]>;
  /** Idempotent: creates the (user_id, company_id) link if it doesn't already exist. */
  link(userId: TUserId, companyId: TCompanyId): Promise<void>;
  /** Removes the (user_id, company_id) link. */
  unlink(userId: TUserId, companyId: TCompanyId): Promise<boolean>;
}

@Injectable()
export class GuestCompanyMongoRepository
  extends BaseMongoRepository<TGuestCompanyRecord>
  implements IGuestCompanyRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async findGuestIdsByCompany(companyId: TCompanyId): Promise<TUserId[]> {
    const links = await this.findMany({ filter: { company_id: companyId } as any });
    return links.map(l => l.user_id);
  }

  async link(userId: TUserId, companyId: TCompanyId): Promise<void> {
    const existing = await this.findOne({ filter: { user_id: userId, company_id: companyId } as any });
    if (existing) return;
    await this.save({ user_id: userId, company_id: companyId, created_at: new Date() });
  }

  async unlink(userId: TUserId, companyId: TCompanyId): Promise<boolean> {
    return this.deleteOne({ user_id: userId, company_id: companyId } as any);
  }
}
