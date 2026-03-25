import type { TCastId, TUserId } from '@sh3pherd/shared-types';

export class CastMemberRemovedEvent {
  constructor(
    public readonly castId: TCastId,
    public readonly userId: TUserId,
    public readonly leftAt: Date,
  ) {}
}
