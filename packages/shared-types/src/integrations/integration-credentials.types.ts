import { z } from 'zod';
import type { ZodOutput } from '../utils/zod.types.js';
import type { TRecordMetadata } from '../metadata.types.js';
import {
  SCompanyId,    type TCompanyId,
  SIntegrationCredentialsId, type TIntegrationCredentialsId,
} from '../ids.js';
import {
  SCommunicationPlatform, type TCommunicationPlatform,
  SIntegrationStatus, type TIntegrationStatus,
} from '../company/communication.types.js';


// ─── Integration Channel ──────────────────────────────────

/**
 * A communication channel within an integration.
 * Platform is implicit from the parent integration document.
 */
export interface TIntegrationChannel {
  id: string;
  name: string;
  url: string;
}
export const SIntegrationChannel: ZodOutput<TIntegrationChannel> = z.object({
  id:   z.string().min(1),
  name: z.string().min(1),
  url:  z.string(),
});


// ─── Integration Credentials Domain Model ─────────────────

/**
 * One document per platform per company.
 * Stores platform credentials and associated channels.
 *
 * Persisted in the `integration_credentials` MongoDB collection.
 */
export interface TIntegrationCredentialsDomainModel {
  id: TIntegrationCredentialsId;
  company_id: TCompanyId;
  platform: TCommunicationPlatform;
  status: TIntegrationStatus;
  /** Platform-specific credentials (bot_token, team_id, etc.) */
  config: Record<string, string>;
  /** Channels registered under this integration */
  channels: TIntegrationChannel[];
  connectedAt?: Date;
}

export const SIntegrationCredentialsDomainModel = z.object({
  id:           SIntegrationCredentialsId,
  company_id:   SCompanyId,
  platform:     SCommunicationPlatform,
  status:       SIntegrationStatus,
  config:       z.record(z.string()),
  channels:     z.array(SIntegrationChannel).default([]),
  connectedAt:  z.coerce.date().optional(),
});

/** MongoDB record with audit metadata */
export type TIntegrationCredentialsRecord = TIntegrationCredentialsDomainModel & TRecordMetadata;


// ─── View Model ───────────────────────────────────────────

/**
 * Projection returned to the frontend.
 * Hides sensitive config fields (bot_token etc.) — only exposes platform, status, channels.
 */
export interface TIntegrationViewModel {
  id: TIntegrationCredentialsId;
  platform: TCommunicationPlatform;
  status: TIntegrationStatus;
  channels: TIntegrationChannel[];
  connectedAt?: Date;
}
