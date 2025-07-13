import type { TUserId } from './user.domain.js';
import type { TMusicGrade } from './music.domain.schemas.js';
import type { TMusicVersionId } from './music.versions.js';


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