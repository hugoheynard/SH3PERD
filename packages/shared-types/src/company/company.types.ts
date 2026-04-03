import { z } from 'zod';
import type { ZodOutput } from '../utils/zod.types.js';
import type { TRecordMetadata } from '../metadata.types.js';
import {
  SUserId,       type TUserId,
  SCompanyId,    type TCompanyId,
} from '../ids.js';
import type {
  TCompanyIntegration,
  TCompanyChannel,
} from './communication.types.js';
import {
  SCompanyIntegration,
  SCompanyChannel,
} from './communication.types.js';


// ─── Company Status ────────────────────────────────────────

/**
 * Lifecycle status of a company.
 * - `pending`   — created but not yet activated
 * - `active`    — fully operational
 * - `suspended` — temporarily disabled
 */
export enum TCompanyStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export const SCompanyStatus = z.enum(['pending', 'active', 'suspended']);


// ─── Company Address ───────────────────────────────────────

/** Physical address of a company. Empty strings represent unfilled fields. */
export interface TCompanyAddress {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export const SCompanyAddress: ZodOutput<TCompanyAddress> = z.object({
  street:  z.string(),
  city:    z.string(),
  zip:     z.string(),
  country: z.string(),
});

// ─── Company Info ──────────────────────────────────────────

/**
 * Editable company information — the subset of fields
 * that can be updated via the "Infos" settings tab.
 * Used as the DTO shape for both frontend forms and backend commands.
 */
export interface TCompanyInfo {
  /** Display name */
  name: string;
  description: string;
  address: TCompanyAddress;
}
export const SCompanyInfo: ZodOutput<TCompanyInfo> = z.object({
  name:        z.string().min(1),
  description: z.string(),
  address:     SCompanyAddress,
});


// ─── Company Domain Model ──────────────────────────────────

/**
 * Core domain model for a company.
 * Persisted as a MongoDB document in the `companies` collection.
 *
 * `description` and `address` are optional — a newly created company starts with just a name.
 * Use {@link TCompanyInfo} for the full form DTO shape where all info fields are required.
 *
 * **Note:** `admins` and `services` have been removed.
 * - Access control is managed through {@link TContractDomainModel.roles}
 * - Organizational hierarchy is managed through {@link TOrgNodeDomainModel}
 * - `orgLayers` defines the company-specific vocabulary for hierarchy levels
 */
export interface TCompanyDomainModel {
  /** Unique identifier, prefixed `company_` */
  id: TCompanyId;
  /** User who created and owns the company */
  owner_id: TUserId;
  /** Display name */
  name: string;
  /** Company description. Empty string when not filled. */
  description: string;
  /** Company address. Empty strings when not filled. */
  address: TCompanyAddress;
  /**
   * Display labels for each depth level in the org chart.
   * Index 0 = label for root nodes, index 1 = their children, etc.
   *
   * @example ["Direction", "Pole", "Equipe"]
   */
  orgLayers: string[];
  /** Connected platform integrations (Slack, WhatsApp, etc.) */
  integrations: TCompanyIntegration[];
  /** Registered communication channels available for org nodes to use */
  channels: TCompanyChannel[];
  status: TCompanyStatus;
}
export const SCompanyDomainModel = z.object({
  id:           SCompanyId,
  name:         z.string().min(1),
  owner_id:     SUserId,
  description:  z.string().default(''),
  address:      SCompanyAddress.default({ street: '', city: '', zip: '', country: '' }),
  orgLayers:    z.array(z.string()).default(['Department', 'Team', 'Sub-team']),
  integrations: z.array(SCompanyIntegration).default([]),
  channels:     z.array(SCompanyChannel).default([]),
  status:       SCompanyStatus.default('active'),
});

/** MongoDB record — domain model extended with audit metadata */
export type TCompanyRecord = TCompanyDomainModel & TRecordMetadata;


// ─── Company View Models ───────────────────────────────────
// Read-only projections returned by query handlers to the API layer.

/** Minimal company projection — used for lists and store updates */
export interface TCompanyViewModel {
  id: TCompanyId;
  name: string;
  status: TCompanyStatus;
}

/** Full company projection returned by the detail endpoint */
export interface TCompanyDetailViewModel {
  id: TCompanyId;
  name: string;
  owner_id: TUserId;
  status: TCompanyStatus;
  description: string;
  address: TCompanyAddress;
  orgLayers: string[];
  integrations: TCompanyIntegration[];
  channels: TCompanyChannel[];
  activeTeamCount: number;
  activeContractCount: number;
}

/** Company projection used in list / card views */
export interface TCompanyCardViewModel {
  id: TCompanyId;
  name: string;
  status: TCompanyStatus;
  createdAt: Date;
}
