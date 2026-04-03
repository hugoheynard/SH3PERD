import { z } from 'zod';
import type { ZodOutput } from '../utils/zod.types.js';


// ─── Communication Platform ────────────────────────────────

/**
 * Communication platform for channels and integrations.
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


// ─── Company Integration ───────────────────────────────────

/**
 * A company-level platform integration (Slack workspace, WhatsApp Business, etc.).
 * Must be connected before channels from this platform can be created.
 *
 * `config` holds platform-specific credentials:
 * - Slack:    `{ webhook_url }` (later: OAuth token)
 * - WhatsApp: `{ invite_base_url }` (later: Business API key)
 * - Telegram: `{ bot_token }` (later: full Bot API)
 * - Discord:  `{ server_invite }` (later: Bot token)
 * - Teams:    `{ tenant_id }` (later: Graph API)
 */
export interface TCompanyIntegration {
  platform: TCommunicationPlatform;
  status: TIntegrationStatus;
  /** Platform-specific config — opaque key-value for now */
  config: Record<string, string>;
  connectedAt?: Date;
}
export const SCompanyIntegration: ZodOutput<TCompanyIntegration> = z.object({
  platform:    SCommunicationPlatform,
  status:      SIntegrationStatus,
  config:      z.record(z.string()),
  connectedAt: z.coerce.date().optional(),
});


// ─── Company Channel ───────────────────────────────────────

/**
 * A company-level communication channel registration.
 * These are the "available channels" that can be assigned to org nodes.
 * Requires the parent platform to be connected first.
 */
export interface TCompanyChannel {
  /** Unique id within the company */
  id: string;
  /** Human-readable label (e.g. "Slack — Design team") */
  name: string;
  /** Platform type (must match a connected integration) */
  platform: TCommunicationPlatform;
  /** Invite or direct link */
  url: string;
}
export const SCompanyChannel: ZodOutput<TCompanyChannel> = z.object({
  id:       z.string().min(1),
  name:     z.string().min(1),
  platform: SCommunicationPlatform,
  url:      z.string().url(),
});


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
