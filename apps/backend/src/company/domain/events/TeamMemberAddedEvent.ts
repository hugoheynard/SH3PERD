import type { TTeamId, TContractId, TUserId } from '@sh3pherd/shared-types';

export class TeamMemberAddedEvent {
  constructor(
    public readonly teamId: TTeamId,
    public readonly userId: TUserId,
    public readonly contractId: TContractId,
    public readonly joinedAt: Date,
  ) {}
}
