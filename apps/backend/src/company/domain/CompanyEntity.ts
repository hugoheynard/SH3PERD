import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type {
  TCompanyAddress,
  TCompanyDomainModel,
  TCompanyInfo,
  TUserId,
} from '@sh3pherd/shared-types';
import { TCompanyStatus } from '@sh3pherd/shared-types';

/**
 * Company entity — represents an organisation.
 *
 * Enforces invariants on construction and mutation:
 * - name must be non-empty
 * - owner_id must be set
 * - status must be a valid TCompanyStatus value
 *
 * Integrations and channels are managed by the integrations module
 * in the `integration_credentials` collection.
 */
export class CompanyEntity extends Entity<TCompanyDomainModel> {
  static readonly DEFAULT_ORG_LAYERS: string[] = ['Department', 'Team', 'Sub-team'];
  private static readonly VALID_STATUSES = new Set(Object.values(TCompanyStatus));

  constructor(props: TEntityInput<TCompanyDomainModel>) {
    const name = props.name?.trim();
    if (!name) throw new Error('COMPANY_NAME_REQUIRED');
    if (!props.owner_id) throw new Error('COMPANY_OWNER_REQUIRED');
    if (!CompanyEntity.VALID_STATUSES.has(props.status)) throw new Error('COMPANY_INVALID_STATUS');

    super({ ...props, name }, 'company');
  }

  /* ── Getters ── */

  get name(): string { return this.props.name; }
  get owner_id(): TUserId { return this.props.owner_id; }
  get description(): string { return this.props.description; }
  get address(): TCompanyAddress { return { ...this.props.address }; }
  get orgLayers(): readonly string[] { return this.props.orgLayers; }
  get status(): TCompanyStatus { return this.props.status; }

  /* ── Ownership ── */

  isOwnedBy(userId: TUserId): boolean {
    return this.props.owner_id === userId;
  }

  /* ── Info mutation ── */

  updateInfo(info: TCompanyInfo): void {
    const name = info.name.trim();
    if (!name) throw new Error('COMPANY_NAME_REQUIRED');
    this.props.name = name;
    this.props.description = info.description;
    this.props.address = { ...info.address };
  }

  /* ── Org Layers ── */

  updateOrgLayers(layers: string[]): void {
    if (layers.length === 0) throw new Error('COMPANY_ORG_LAYERS_EMPTY');
    const trimmed = layers.map(l => l.trim());
    if (trimmed.some(l => !l)) throw new Error('COMPANY_ORG_LAYER_BLANK');
    this.props.orgLayers = trimmed;
  }

  /* ── Status ── */

  updateStatus(status: TCompanyStatus): void {
    if (!CompanyEntity.VALID_STATUSES.has(status)) throw new Error('COMPANY_INVALID_STATUS');
    this.props.status = status;
  }
}
