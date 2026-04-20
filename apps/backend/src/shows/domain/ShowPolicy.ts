import type { TUserId } from '@sh3pherd/shared-types';
import type { ShowEntity } from './ShowEntity.js';
import type { ShowSectionEntity } from './ShowSectionEntity.js';

/**
 * Structural invariants for the Show aggregate.
 *
 * Stays pure: methods either pass silently or throw with a
 * machine-readable code. Item-ref ownership (does this version / this
 * playlist belong to the show owner?) is NOT enforced here — that check
 * requires cross-aggregate lookups and lives in the command handler.
 */
export class ShowPolicy {
  // ── ownership ───────────────────────────────────────────

  ensureOwnedBy(actorId: TUserId, show: ShowEntity): void {
    if (!show.isOwnedBy(actorId)) {
      throw new Error('SHOW_NOT_OWNED');
    }
  }

  // ── section invariants ──────────────────────────────────

  /** At least one section must remain on the show. */
  ensureCanRemoveSection(sections: readonly ShowSectionEntity[]): void {
    if (sections.length <= 1) {
      throw new Error('SHOW_LAST_SECTION_CANNOT_BE_REMOVED');
    }
  }

  /** The reorder payload must cover every current section id exactly once. */
  ensureReorderCovers(sections: readonly ShowSectionEntity[], orderedIds: readonly string[]): void {
    if (orderedIds.length !== sections.length) {
      throw new Error('SHOW_SECTIONS_REORDER_MISMATCH');
    }
    const ids = new Set(sections.map((s) => s.id));
    for (const id of orderedIds) {
      if (!ids.has(id as ShowSectionEntity['id'])) {
        throw new Error('SHOW_SECTIONS_REORDER_MISMATCH');
      }
      ids.delete(id as ShowSectionEntity['id']);
    }
    if (ids.size !== 0) {
      throw new Error('SHOW_SECTIONS_REORDER_MISMATCH');
    }
  }
}
