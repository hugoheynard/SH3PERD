/**
 * Central ID schemas — import all entity IDs from here.
 * Keeping IDs in one place prevents circular dependencies between domain files
 * that reference each other's entity IDs.
 *
 * Pattern: type is declared first (documentation), schema implements it.
 * createIdSchema<TId> ensures the schema outputs the branded type, enabling
 * z.ZodType<T> annotations on all domain schemas that contain these IDs.
 */

import { createIdSchema } from './utils/createIdSchema.js';

// ─── User ──────────────────────────────────────────────────
export type TUserId = `user_${string}`;
export const SUserId = createIdSchema<TUserId>('user');

// ─── Company & Service ─────────────────────────────────────
export type TCompanyId = `company_${string}`;
export const SCompanyId = createIdSchema<TCompanyId>('company');

export type TServiceId = `service_${string}`;
export const SServiceId = createIdSchema<TServiceId>('service');

// ─── Contract & Addendum ───────────────────────────────────
export type TContractId = `contract_${string}`;
export const SContractId = createIdSchema<TContractId>('contract');

export type TContractSignatureId = `contract_signature_${string}`;
export const SContractSignatureId = createIdSchema<TContractSignatureId>('contract_signature');

export type TSignatureId = `signature_${string}`;
export const SSignatureId = createIdSchema<TSignatureId>('signature_id');

export type TAddendumId = `addendum_${string}`;
export const SAddendumId = createIdSchema<TAddendumId>('addendum');

// ─── Team ──────────────────────────────────────────────────
export type TTeamId = `team_${string}`;
export const STeamId = createIdSchema<TTeamId>('team');

export type TCastMembershipEventId = `castevt_${string}`;
export const SCastMembershipEventId = createIdSchema<TCastMembershipEventId>('castevt');

// ─── Music ─────────────────────────────────────────────────
export type TMusicReferenceId = `musicRef_${string}`;
export const SMusicReferenceId = createIdSchema<TMusicReferenceId>('musicRef');

export type TMusicVersionId = `musicVer_${string}`;
export const SMusicVersionId = createIdSchema<TMusicVersionId>('musicVer');

export type TRepertoireEntryId = `repEntry_${string}`;
export const SRepertoireEntryId = createIdSchema<TRepertoireEntryId>('repEntry');

export type TVersionTrackId = `track_${string}`;
export const SVersionTrackId = createIdSchema<TVersionTrackId>('track');

// ─── Event / Calendar ──────────────────────────────────────
export type TEventId = `event_${string}`;
export const SEventId = createIdSchema<TEventId>('event');
