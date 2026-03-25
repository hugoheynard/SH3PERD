import type { TCastId, TCompanyId } from '@sh3pherd/shared-types';

export class CastCreatedEvent {
  constructor(
    public readonly castId: TCastId,
    public readonly companyId: TCompanyId,
    public readonly name: string,
  ) {}
}
