import { Inject, Injectable } from '@nestjs/common';
import type {
  TCompanyId,
  TCompanyOrgChartViewModel,
  TServiceDetailViewModel,
  TServiceTeamViewModel,
  TServiceMemberViewModel,
  TTeamId,
  TUserId,
  TContractId,
} from '@sh3pherd/shared-types';
import { CAST_REPO, COMPANY_REPO, USER_PROFILE_REPO } from '../../company.tokens.js';
import type { ITeamRepository } from '../../repositories/TeamMongoRepository.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import type { IUserProfileRepository } from '../../../user/infra/UserProfileMongoRepo.repository.js';

@Injectable()
export class GetCompanyOrgChartUseCase {
  constructor(
    @Inject(CAST_REPO)         private readonly teamRepo: ITeamRepository,
    @Inject(COMPANY_REPO)      private readonly companyRepo: ICompanyRepository,
    @Inject(USER_PROFILE_REPO) private readonly profileRepo: IUserProfileRepository,
  ) {}

  async execute(companyId: TCompanyId): Promise<TCompanyOrgChartViewModel> {
    const [company, teams] = await Promise.all([
      this.companyRepo.findById(companyId),
      this.teamRepo.findByCompany(companyId),
    ]);

    // Collect all active member user IDs across every team
    const allUserIds = [
      ...new Set(
        teams.flatMap(t => t.members.filter(m => !m.leftAt).map(m => m.user_id)),
      ),
    ];
    const profiles =
      allUserIds.length > 0
        ? ((await this.profileRepo.findMany({ filter: { user_id: { $in: allUserIds } } as any })) ?? [])
        : [];
    const profileMap = new Map(profiles.map(p => [p.user_id as TUserId, p]));

    const toTeamViewModel = (team: (typeof teams)[number]): TServiceTeamViewModel => ({
      id: team.id as TTeamId,
      name: team.name,
      status: team.status,
      members: team.members
        .filter(m => !m.leftAt)
        .map((m): TServiceMemberViewModel => {
          const profile = profileMap.get(m.user_id as TUserId);
          return {
            user_id:     m.user_id as TUserId,
            contract_id: m.contract_id as TContractId,
            joinedAt:    m.joinedAt,
            first_name:  profile?.first_name,
            last_name:   profile?.last_name,
          };
        }),
    });

    // Group teams by service
    const teamsByService = new Map<string, (typeof teams)[number][]>();
    const unassignedTeams: (typeof teams)[number][] = [];

    for (const team of teams) {
      if (team.service_id) {
        const bucket = teamsByService.get(team.service_id) ?? [];
        bucket.push(team);
        teamsByService.set(team.service_id, bucket);
      } else {
        unassignedTeams.push(team);
      }
    }

    const services: TServiceDetailViewModel[] = (company?.services ?? [])
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(service => ({
        service_id:    service.id,
        name:          service.name,
        color:         service.color,
        communication: service.communication,
        teams:      (teamsByService.get(service.id) ?? []).map(toTeamViewModel),
      }));

    return {
      company_id:      companyId,
      company_name:    company?.name ?? '',
      services,
      unassignedTeams: unassignedTeams.map(toTeamViewModel),
    };
  }
}
