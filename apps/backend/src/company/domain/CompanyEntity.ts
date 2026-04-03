import { randomUUID } from 'crypto';
import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type {
  TCompanyAddress,
  TCompanyChannel,
  TCompanyDomainModel,
  TCompanyIntegration,
  TCommunicationPlatform,
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
 * Channels require a connected integration for their platform.
 * Disconnecting an integration cascades: removes all channels on that platform.
 */
export class CompanyEntity extends Entity<TCompanyDomainModel> {
  static readonly DEFAULT_ORG_LAYERS: string[] = ['Department', 'Team', 'Sub-team'];
  private static readonly VALID_STATUSES = new Set(Object.values(TCompanyStatus));

  constructor(props: TEntityInput<TCompanyDomainModel>) {
    const name = props.name?.trim();
    if (!name) {
      throw new Error('COMPANY_NAME_REQUIRED');
    }
    if (!props.owner_id) {
      throw new Error('COMPANY_OWNER_REQUIRED');
    }
    if (!CompanyEntity.VALID_STATUSES.has(props.status)) {
      throw new Error('COMPANY_INVALID_STATUS');
    }

    super({ ...props, name }, 'company');
  }

  /* ── Getters ── */

  get name(): string {
    return this.props.name;
  }
  get owner_id(): TUserId {
    return this.props.owner_id;
  }
  get description(): string {
    return this.props.description;
  }
  get address(): TCompanyAddress {
    return { ...this.props.address };
  }
  get orgLayers(): readonly string[] {
    return this.props.orgLayers;
  }
  get integrations(): readonly TCompanyIntegration[] {
    return this.props.integrations;
  }
  get channels(): readonly TCompanyChannel[] {
    return this.props.channels;
  }
  get status(): TCompanyStatus {
    return this.props.status;
  }

  /* ── Ownership ── */

  isOwnedBy(userId: TUserId): boolean {
    return this.props.owner_id === userId;
  }

  /* ── Info mutation ── */

  /**
   * Update company info (name, description, address).
   * @throws COMPANY_NAME_REQUIRED — if name is empty after trimming
   */
  updateInfo(info: TCompanyInfo): void {
    const name = info.name.trim();
    if (!name) throw new Error('COMPANY_NAME_REQUIRED');
    this.props.name = name;
    this.props.description = info.description;
    this.props.address = { ...info.address };
  }

  /* ── Org Layers ── */

  /**
   * Replace the company's org layer labels.
   * @throws COMPANY_ORG_LAYERS_EMPTY — if the array is empty
   * @throws COMPANY_ORG_LAYER_BLANK — if any label is blank after trimming
   */
  updateOrgLayers(layers: string[]): void {
    if (layers.length === 0) {
      throw new Error('COMPANY_ORG_LAYERS_EMPTY');
    }
    const trimmed = layers.map(l => l.trim());
    if (trimmed.some(l => !l)) {
      throw new Error('COMPANY_ORG_LAYER_BLANK');
    }
    this.props.orgLayers = trimmed;
  }

  /* ── Integrations ── */

  /**
   * Connect (or reconnect) a platform integration.
   * Replaces any existing integration for the same platform.
   */
  connectIntegration(platform: TCommunicationPlatform, config: Record<string, string>): void {
    const filtered = this.props.integrations.filter(i => i.platform !== platform);
    filtered.push({
      platform,
      status: 'connected',
      config,
      connectedAt: new Date(),
    });
    this.props.integrations = filtered;
  }

  /**
   * Disconnect a platform integration and remove all channels on that platform.
   * @throws INTEGRATION_NOT_FOUND — if no integration exists for the platform
   */
  disconnectIntegration(platform: TCommunicationPlatform): void {
    if (!this.props.integrations.some(i => i.platform === platform)) {
      throw new Error('INTEGRATION_NOT_FOUND');
    }
    this.props.integrations = this.props.integrations.filter(i => i.platform !== platform);
    this.props.channels = this.props.channels.filter(ch => ch.platform !== platform);
  }

  /* ── Channels ── */

  /**
   * Add a communication channel. The platform must be connected.
   * Server generates the channel ID.
   * @throws PLATFORM_NOT_CONNECTED — if platform has no connected integration
   */
  addChannel(input: { name: string; platform: TCommunicationPlatform; url: string }): TCompanyChannel {
    const integration = this.props.integrations.find(i => i.platform === input.platform);
    if (!integration || integration.status !== 'connected') {
      throw new Error('PLATFORM_NOT_CONNECTED');
    }
    const channel: TCompanyChannel = {
      id: `channel_${randomUUID()}`,
      name: input.name,
      platform: input.platform,
      url: input.url,
    };
    this.props.channels = [...this.props.channels, channel];
    return channel;
  }

  /**
   * Remove a channel by ID.
   * @throws CHANNEL_NOT_FOUND — if no channel with that ID exists
   */
  removeChannel(channelId: string): void {
    if (!this.props.channels.some(ch => ch.id === channelId)) {
      throw new Error('CHANNEL_NOT_FOUND');
    }
    this.props.channels = this.props.channels.filter(ch => ch.id !== channelId);
  }

  /* ── Status ── */

  updateStatus(status: TCompanyStatus): void {
    if (!CompanyEntity.VALID_STATUSES.has(status)) {
      throw new Error('COMPANY_INVALID_STATUS');
    }
    this.props.status = status;
  }
}
