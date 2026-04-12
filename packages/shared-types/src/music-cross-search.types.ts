import type { TUserId, TMusicReferenceId, TMusicVersionId, TCompanyId } from './ids.js';
import type { TMusicRating } from './music.domain.schemas.js';
import type { TVersionTrackDomainModel } from './music-tracks.js';

// ─── Cross Search View Models ─────────────────────────────

/**
 * A member in the cross search context — represents an artist
 * under contract at the company being queried.
 */
export interface TCrossMember {
  userId: TUserId;
  displayName: string;
  avatarInitials: string;
}

/**
 * One member's contribution to a cross-referenced song.
 * `hasVersion = true` means the member has this song in their repertoire.
 */
export interface TCrossMemberVersion {
  hasVersion: boolean;
  versions: Array<{
    id: TMusicVersionId;
    label: string;
    bpm: number | null;
    key: string | null;
    mastery: TMusicRating;
    energy: TMusicRating;
    effort: TMusicRating;
    tracks: TVersionTrackDomainModel[];
  }>;
}

/**
 * One row in the cross table — a song (reference) with each member's
 * version data. `compatibleCount` = how many members have this song.
 */
export interface TCrossReferenceResult {
  referenceId: TMusicReferenceId;
  title: string;
  originalArtist: string;
  /** Map of userId → version data. */
  members: Record<string, TCrossMemberVersion>;
  /** Number of members who have this song in their repertoire. */
  compatibleCount: number;
}

/**
 * Full response from the cross library endpoint.
 */
export interface TCrossSearchResult {
  companyId: TCompanyId;
  members: TCrossMember[];
  results: TCrossReferenceResult[];
  /** Total unique references across all members. */
  totalReferences: number;
}
