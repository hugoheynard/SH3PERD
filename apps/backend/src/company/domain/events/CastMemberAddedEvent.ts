import type { TCastId, TContractId, TUserId } from '@sh3pherd/shared-types';

export class CastMemberAddedEvent {
  constructor(
    public readonly castId: TCastId,
    public readonly userId: TUserId,
    public readonly contractId: TContractId,
    public readonly joinedAt: Date,
  ) {}
}
