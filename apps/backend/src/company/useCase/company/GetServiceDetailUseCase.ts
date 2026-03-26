import { Inject, Injectable } from '@nestjs/common';
import type { TCompanyId, TContractId, TServiceId, TServiceDetailViewModel, TTeamId, TUserId } from '@sh3pherd/shared-types';
import { CAST_REPO, COMPANY_REPO, USER_PROFILE_REPO } from '../../company.tokens.js';
import type { ITeamRepository } from '../../repositories/TeamMongoRepository.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import type { IUserProfileRepository } from '../../../user/infra/UserProfileMongoRepo.repository.js';

@Injectable()
export class GetServiceDetailUseCase {
  constructor(
    @Inject(CAST_REPO) private readonly teamRepo: ITeamRepository,
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
    @Inject(USER_PROFILE_REPO) private readonly profileRepo: IUserProfileRepository,
  ) {}

  async execute(companyId: TCompanyId, serviceId: TServiceId): Promise<TServiceDetailViewModel> {
    const [company, teams] = await Promise.all([
      this.companyRepo.findById(companyId),
      this.teamRepo.findByServiceId(serviceId, companyId),
    ]);

    const service = company?.services.find(s => s.id === serviceId);

    const allUserIds = [...new Set(
      teams.flatMap(t => t.members.filter(m => !m.leftAt).map(m => m.user_id))
    )];

    const profiles = allUserIds.length > 0
      ? (await this.profileRepo.findMany({ filter: { user_id: { $in: allUserIds } } as any })) ?? []
      : [];

    const profileMap = new Map(profiles.map(p => [p.user_id as TUserId, p]));

    return {
      service_id: serviceId,
      name: service?.name ?? '',
      ...(service?.color ? { color: service.color } : {}),
      teams: teams.map(team => ({
        id: team.id as TTeamId,
        name: team.name,
        status: team.status,
        members: team.members
          .filter(m => !m.leftAt)
          .map(m => {
            const profile = profileMap.get(m.user_id as TUserId);
            return {
              user_id: m.user_id as TUserId,
              contract_id: m.contract_id as TContractId,
              joinedAt: m.joinedAt,
              first_name: profile?.first_name,
              last_name: profile?.last_name,
            };
          }),
      })),
    };
  }
}
