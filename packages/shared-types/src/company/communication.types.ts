import { z } from 'zod';
import type { ZodOutput } from '../utils/zod.types.js';


// ─── Communication Platform ────────────────────────────────

/**
 * Communication platform for integrations and channels.
 * Used to link a Slack channel, WhatsApp group, Teams channel, etc.
 */
export type TCommunicationPlatform =
  | 'slack'
  | 'whatsapp'
  | 'teams'
  | 'discord'
  | 'telegram'
  | 'other';

export const SCommunicationPlatform: ZodOutput<TCommunicationPlatform> =
  z.enum(['slack', 'whatsapp', 'teams', 'discord', 'telegram', 'other']);


// ─── Integration Status ────────────────────────────────────

/**
 * Connection status of a platform integration.
 * - `not_connected` — no credentials, not usable yet
 * - `connected`     — credentials stored, channels can be created
 */
export type TIntegrationStatus = 'not_connected' | 'connected';
export const SIntegrationStatus: ZodOutput<TIntegrationStatus> =
  z.enum(['not_connected', 'connected']);


// ─── OrgNode Communication ─────────────────────────────────

/** A communication channel link attached to an org node */
export interface TOrgNodeCommunication {
  /** Platform hosting the channel */
  platform: TCommunicationPlatform;
  /** Invite or direct link to the channel/group */
  url: string;
}
export const SOrgNodeCommunication: ZodOutput<TOrgNodeCommunication> = z.object({
  platform: SCommunicationPlatform,
  url:      z.string().url(),
});
