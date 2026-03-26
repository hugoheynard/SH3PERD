/**
 * Central ID schemas — import all entity IDs from here.
 * Keeping IDs in one place prevents circular dependencies between domain files
 * that reference each other's entity IDs.
 */

import { createIdSchema } from './utils/createIdSchema.js';

// ─── User ──────────────────────────────────────────────────
export const SUserId = createIdSchema('user');
export type TUserId = `user_${string}`;

// ─── Company & Service ─────────────────────────────────────
export const SCompanyId = createIdSchema('company');
export type TCompanyId = `company_${string}`;

export const SServiceId = createIdSchema('service');
export type TServiceId = `service_${string}`;

// ─── Contract & Addendum ───────────────────────────────────
export const SContractId = createIdSchema('contract');
export type TContractId = `contract_${string}`;

export const SContractSignatureId = createIdSchema('contract_signature');
export type TContractSignatureId = `contract_signature_${string}`;

export const SSignatureId = createIdSchema('signature_id');
export type TSignatureId = `signature_${string}`;

export const SAddendumId = createIdSchema('addendum');
export type TAddendumId = `addendum_${string}`;

// ─── Team ──────────────────────────────────────────────────
export const STeamId = createIdSchema('team');
export type TTeamId = `team_${string}`;

export const SCastMembershipEventId = createIdSchema('castevt');
export type TCastMembershipEventId = `castevt_${string}`;

// ─── Event / Calendar ─────────────────────────────────────
export const SEventId = createIdSchema('event');
export type TEventId = `event_${string}`;
