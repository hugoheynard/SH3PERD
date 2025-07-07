import type { TUserId } from './user.domain.js';
import type { TMusicGrade } from './music.domain.schemas.js';

/**
 * Domain types for music references.
 */

export type TMusicReferenceId = `musicReference_${string}`;
export type TMusicReferenceDomainModel = {
  music_id: TMusicReferenceId;
  title: string;
  artist: string;
  created_at: Date;
  updated_at: Date;
  created_by: TUserId;
  active: boolean;
};





export type TMusicVersionId = `musicVersion_${string}`;

export type TMusicRepertoireEntry_id = `musicRepertoireEntry_${string}`;
export type TMusicRepertoireEntryDomainModel = {
  musicVersion_id: TMusicVersionId;
  user_id: TUserId;
  energy: TMusicGrade;
  effort: TMusicGrade;
  mastery: TMusicGrade;
  affinity: TMusicGrade;
  created_at: Date;
  updated_at: Date;
  created_by: TUserId;
}