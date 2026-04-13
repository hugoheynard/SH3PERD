import type {
  TCompanyId,
  TOrgNodeId,
  TContractId,
  TUserId,
  TOrgNodeDomainModel,
  TOrgNodeGuestMember,
  TOrgNodeCommunication,
  TCompanyDomainModel,
} from '@sh3pherd/shared-types';
import { TCompanyStatus } from '@sh3pherd/shared-types';
import type { TEntityInput } from '../../../utils/entities/Entity.js';
import { OrgNodeEntity } from '../OrgNodeEntity.js';
import { CompanyEntity } from '../CompanyEntity.js';

// ─── Typed ID helpers ────────────────────────────────────

export const companyId = (n = 1) => `company_test-${n}` as TCompanyId;
export const nodeId = (n = 1) => `orgnode_test-${n}` as TOrgNodeId;
export const userId = (n = 1) => `user_test-${n}` as TUserId;
export const contractId = (n = 1) => `contract_test-${n}` as TContractId;

// ─── Factory helpers ─────────────────────────────────────

export function makeNode(
  overrides: Partial<TEntityInput<TOrgNodeDomainModel>> = {},
): OrgNodeEntity {
  return new OrgNodeEntity({
    company_id: companyId(),
    name: 'Test Node',
    status: 'active',
    communications: [],
    members: [],
    guest_members: [],
    ...overrides,
  });
}

export function makeGuest(overrides: Partial<TOrgNodeGuestMember> = {}): TOrgNodeGuestMember {
  return {
    id: `guest_${Math.random().toString(36).slice(2)}`,
    display_name: 'Guest User',
    team_role: 'member',
    ...overrides,
  };
}

export function makeComm(overrides: Partial<TOrgNodeCommunication> = {}): TOrgNodeCommunication {
  return {
    platform: 'slack',
    url: 'https://slack.com/app_redirect?channel=C123',
    ...overrides,
  };
}

export function makeCompany(
  overrides: Partial<TEntityInput<TCompanyDomainModel>> = {},
): CompanyEntity {
  return new CompanyEntity({
    owner_id: userId(),
    name: 'Test Company',
    description: '',
    address: { street: '', city: '', zip: '', country: '' },
    orgLayers: [...CompanyEntity.DEFAULT_ORG_LAYERS],
    status: TCompanyStatus.ACTIVE,
    ...overrides,
  });
}
