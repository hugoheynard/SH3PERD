import type { TTeamId, TCompanyId } from '@sh3pherd/shared-types';

export class TeamCreatedEvent {
  constructor(
    public readonly teamId: TTeamId,
    public readonly companyId: TCompanyId,
    public readonly name: string,
  ) {}
}
