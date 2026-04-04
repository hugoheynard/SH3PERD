import { randomUUID } from 'crypto';
import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type {
  TIntegrationCredentialsDomainModel,
  TIntegrationChannel,
  TCommunicationPlatform,
} from '@sh3pherd/shared-types';

/**
 * Integration credentials entity — one per platform per company.
 *
 * Manages platform credentials (bot_token, team_id) and the
 * channels registered under this integration.
 *
 * Invariants:
 * - platform must be set
 * - company_id must be set
 * - channel names must be non-empty
 */
export class IntegrationCredentialsEntity extends Entity<TIntegrationCredentialsDomainModel> {

  constructor(props: TEntityInput<TIntegrationCredentialsDomainModel>) {
    if (!props.company_id) {
      throw new Error('INTEGRATION_COMPANY_REQUIRED');
    }
    if (!props.platform) {
      throw new Error('INTEGRATION_PLATFORM_REQUIRED');
    }
    super(props, 'intcred');
  }

  /* ── Getters ── */

  get company_id() { return this.props.company_id; }
  get platform(): TCommunicationPlatform { return this.props.platform; }
  get status() { return this.props.status; }
  get config() { return this.props.config; }
  get channels(): readonly TIntegrationChannel[] { return this.props.channels; }
  get connectedAt() { return this.props.connectedAt; }

  /* ── Connection lifecycle ── */

  /** Mark this integration as connected with the given config. */
  connect(config: Record<string, string>): void {
    this.props.status = 'connected';
    this.props.config = { ...config };
    this.props.connectedAt = new Date();
  }

  /** Mark as disconnected. Clears credentials but preserves channels for reconnection. */
  disconnect(): void {
    this.props.status = 'not_connected';
    this.props.config = {};
    this.props.connectedAt = undefined;
  }

  /* ── Channel management ── */

  /** Add a channel. Server generates the ID. */
  addChannel(input: { name: string; url: string }): TIntegrationChannel {
    if (this.props.status !== 'connected') {
      throw new Error('INTEGRATION_NOT_CONNECTED');
    }
    const channel: TIntegrationChannel = {
      id: `channel_${randomUUID()}`,
      name: input.name,
      url: input.url,
    };
    this.props.channels = [...this.props.channels, channel];
    return channel;
  }

  /** Remove a channel by ID. */
  removeChannel(channelId: string): void {
    if (!this.props.channels.some(ch => ch.id === channelId)) {
      throw new Error('CHANNEL_NOT_FOUND');
    }
    this.props.channels = this.props.channels.filter(ch => ch.id !== channelId);
  }

  /** Find a channel by ID. */
  findChannel(channelId: string): TIntegrationChannel | undefined {
    return this.props.channels.find(ch => ch.id === channelId);
  }
}
