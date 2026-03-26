import type { TTeamId, TUserId } from '@sh3pherd/shared-types';

export class TeamMemberRemovedEvent {
  constructor(
    public readonly teamId: TTeamId,
    public readonly userId: TUserId,
    public readonly leftAt: Date,
  ) {}
}
