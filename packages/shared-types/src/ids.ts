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

// ─── Company ────────────────────────────────────────────────
export type TCompanyId = `company_${string}`;
export const SCompanyId = createIdSchema<TCompanyId>('company');

// ─── Contract & Addendum ───────────────────────────────────
export type TContractId = `contract_${string}`;
export const SContractId = createIdSchema<TContractId>('contract');

export type TContractSignatureId = `contract_signature_${string}`;
export const SContractSignatureId =
  createIdSchema<TContractSignatureId>('contract_signature');

export type TSignatureId = `signature_${string}`;
export const SSignatureId = createIdSchema<TSignatureId>('signature_id');

export type TAddendumId = `addendum_${string}`;
export const SAddendumId = createIdSchema<TAddendumId>('addendum');

// ─── OrgNode (organizational tree node) ─────────────────────
export type TOrgNodeId = `orgnode_${string}`;
export const SOrgNodeId = createIdSchema<TOrgNodeId>('orgnode');

export type TOrgMembershipEventId = `orgevt_${string}`;
export const SOrgMembershipEventId =
  createIdSchema<TOrgMembershipEventId>('orgevt');

// ─── Backward-compat aliases (will be removed) ─────────────
/** @deprecated Use TOrgNodeId */
export type TTeamId = TOrgNodeId;
/** @deprecated Use SOrgNodeId */
export const STeamId = SOrgNodeId;
/** @deprecated Use TOrgMembershipEventId */
export type TCastMembershipEventId = TOrgMembershipEventId;
/** @deprecated Use SOrgMembershipEventId */
export const SCastMembershipEventId = SOrgMembershipEventId;

// ─── Music ─────────────────────────────────────────────────
export type TMusicReferenceId = `musicRef_${string}`;
export const SMusicReferenceId = createIdSchema<TMusicReferenceId>('musicRef');

export type TMusicVersionId = `musicVer_${string}`;
export const SMusicVersionId = createIdSchema<TMusicVersionId>('musicVer');

export type TRepertoireEntryId = `repEntry_${string}`;
export const SRepertoireEntryId =
  createIdSchema<TRepertoireEntryId>('repEntry');

export type TVersionTrackId = `track_${string}`;
export const SVersionTrackId = createIdSchema<TVersionTrackId>('track');

// ─── Integration Credentials ─────────────────────────────
export type TIntegrationCredentialsId = `intcred_${string}`;
export const SIntegrationCredentialsId =
  createIdSchema<TIntegrationCredentialsId>('intcred');

// ─── Playlist ─────────────────────────────────────────────
export type TPlaylistId = `playlist_${string}`;
export const SPlaylistId = createIdSchema<TPlaylistId>('playlist');

export type TPlaylistTrackId = `plTrack_${string}`;
export const SPlaylistTrackId = createIdSchema<TPlaylistTrackId>('plTrack');

// ─── Event / Calendar ──────────────────────────────────────
export type TEventId = `event_${string}`;
export const SEventId = createIdSchema<TEventId>('event');

// ─── Show (artist personal performance planner) ────────────
export type TShowId = `show_${string}`;
export const SShowId = createIdSchema<TShowId>('show');

export type TShowSectionId = `showSection_${string}`;
export const SShowSectionId = createIdSchema<TShowSectionId>('showSection');

export type TShowSectionItemId = `showItem_${string}`;
export const SShowSectionItemId =
  createIdSchema<TShowSectionItemId>('showItem');
