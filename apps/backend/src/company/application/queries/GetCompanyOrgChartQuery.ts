import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type {
  TCompanyId,
  TCompanyOrgChartViewModel,
  TOrgNodeHierarchyViewModel,
  TOrgNodeMemberViewModel,
  TOrgNodeRecord,
  TUserProfileRecord,
} from '@sh3pherd/shared-types';
import { ORG_NODE_REPO, COMPANY_REPO, USER_PROFILE_REPO } from '../../company.tokens.js';
import type { IOrgNodeRepository } from '../../repositories/OrgNodeMongoRepository.js';
import type { ICompanyRepository } from '../../repositories/CompanyMongoRepository.js';
import type { IUserProfileRepository } from '../../../user/infra/UserProfileMongoRepo.repository.js';
import type { Filter } from 'mongodb';

export class GetCompanyOrgChartQuery {
  constructor(public readonly companyId: TCompanyId) {}
}

/**
 * Returns the full company org chart as a tree.
 * Root nodes (parent_id: undefined) are top-level entries, children nested recursively.
 * Depth is computed at read time — not stored.
 */
@QueryHandler(GetCompanyOrgChartQuery)
export class GetCompanyOrgChartHandler implements IQueryHandler<
  GetCompanyOrgChartQuery,
  TCompanyOrgChartViewModel
> {
  constructor(
    @Inject(ORG_NODE_REPO) private readonly orgNodeRepo: IOrgNodeRepository,
    @Inject(COMPANY_REPO) private readonly companyRepo: ICompanyRepository,
    @Inject(USER_PROFILE_REPO) private readonly profileRepo: IUserProfileRepository,
  ) {}

  async execute(query: GetCompanyOrgChartQuery): Promise<TCompanyOrgChartViewModel> {
    const [company, allNodes] = await Promise.all([
      this.companyRepo.findOne({ filter: { id: query.companyId } }),
      this.orgNodeRepo.findByCompany(query.companyId),
    ]);

    // Collect all active member user IDs for profile enrichment
    const allUserIds = [
      ...new Set(allNodes.flatMap((n) => n.members.filter((m) => !m.leftAt).map((m) => m.user_id))),
    ];

    const profiles =
      allUserIds.length > 0
        ? ((await this.profileRepo.findMany({
            filter: { user_id: { $in: allUserIds } } satisfies Filter<TUserProfileRecord>,
          })) ?? [])
        : [];
    const profileMap = new Map(profiles.map((p) => [p.user_id, p]));

    const toMemberVM = (m: TOrgNodeRecord['members'][number]): TOrgNodeMemberViewModel => {
      const profile = profileMap.get(m.user_id);
      return {
        user_id: m.user_id,
        contract_id: m.contract_id,
        team_role: m.team_role,
        job_title: m.job_title,
        joinedAt: m.joinedAt,
        ...(m.leftAt ? { leftAt: m.leftAt } : {}),
        first_name: profile?.first_name,
        last_name: profile?.last_name,
      };
    };

    // Build tree recursively — depth computed by position in the tree
    const buildTree = (parentId: string | undefined): TOrgNodeHierarchyViewModel[] => {
      const children = allNodes.filter((n) =>
        parentId === undefined ? !n.parent_id : n.parent_id === parentId,
      );

      return children
        .sort(
          (a, b) =>
            (a.position ?? Infinity) - (b.position ?? Infinity) ||
            (a.name ?? '').localeCompare(b.name ?? ''),
        )
        .map(
          (node): TOrgNodeHierarchyViewModel => ({
            id: node.id,
            name: node.name,
            parent_id: node.parent_id,
            type: node.type,
            color: node.color,
            communications: node.communications ?? [],
            status: node.status,
            members: node.members.filter((m) => !m.leftAt).map(toMemberVM),
            guest_members: node.guest_members ?? [],
            children: buildTree(node.id),
          }),
        );
    };

    return {
      company_id: query.companyId,
      company_name: company?.name ?? '',
      orgLayers: company?.orgLayers ?? [],
      rootNodes: buildTree(undefined),
    };
  }
}
