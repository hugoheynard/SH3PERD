import type { TUserId } from '@sh3pherd/shared-types';
import type { MusicVersionEntity } from './entities/MusicVersionEntity.js';
import type { RepertoireEntryEntity } from './entities/RepertoireEntryEntity.js';

/**
 * Business rules enforcement for the Music domain.
 */
export class MusicPolicy {

  /** Ensures the actor owns the version before mutating it. */
  ensureCanMutateVersion(actorId: TUserId, version: MusicVersionEntity): void {
    if (!version.isOwnedBy(actorId)) {
      throw new Error('MUSIC_VERSION_NOT_OWNED');
    }
  }

  /** Ensures the actor owns the repertoire entry. */
  ensureCanMutateEntry(actorId: TUserId, entry: RepertoireEntryEntity): void {
    if (!entry.isOwnedBy(actorId)) {
      throw new Error('REPERTOIRE_ENTRY_NOT_OWNED');
    }
  }
}
