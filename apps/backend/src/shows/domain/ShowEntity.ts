import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type { TPlaylistColor, TShowDomainModel, TShowId, TUserId } from '@sh3pherd/shared-types';

/**
 * A user-owned show — the top-level container that holds sections.
 *
 * Invariants enforced here:
 * - name is trimmed and non-empty.
 * - `updatedAt` moves forward on every mutation (domain-side clock).
 * - `lastPlayedAt` is set via `markPlayed`.
 *
 * Structural invariants (≥ 1 section, dense positions, ownership of refs) live on
 * `ShowAggregate` / `ShowPolicy` — this entity only protects show-level state.
 */
export class ShowEntity extends Entity<TShowDomainModel> {
  constructor(props: TEntityInput<TShowDomainModel>) {
    const now = Date.now();
    super(
      {
        ...props,
        name: props.name.trim(),
        description: normaliseOptionalText(props.description),
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      },
      'show',
    );
    if (!this.props.name) {
      throw new Error('SHOW_NAME_REQUIRED');
    }
  }

  // ── getters ─────────────────────────────────────────────

  override get id(): TShowId {
    return this.props.id;
  }
  get owner_id(): TUserId {
    return this.props.owner_id;
  }
  get name(): string {
    return this.props.name;
  }
  get color(): TPlaylistColor {
    return this.props.color;
  }
  get description(): string | undefined {
    return this.props.description;
  }
  get lastPlayedAt(): number | undefined {
    return this.props.lastPlayedAt;
  }

  // ── queries ─────────────────────────────────────────────

  isOwnedBy(actorId: TUserId): boolean {
    return this.props.owner_id === actorId;
  }

  // ── mutations ───────────────────────────────────────────

  rename(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('SHOW_NAME_REQUIRED');
    this.props.name = trimmed;
    this.touch();
  }

  updateDescription(description: string | undefined): void {
    this.props.description = normaliseOptionalText(description);
    this.touch();
  }

  changeColor(color: TPlaylistColor): void {
    this.props.color = color;
    this.touch();
  }

  markPlayed(playedAt: number = Date.now()): void {
    this.props.lastPlayedAt = playedAt;
    this.touch();
  }

  /** Bumps `updatedAt`. Invoked by mutations on this entity AND by the
   *  aggregate whenever a child section mutates, so the show-level
   *  clock always reflects the most recent change. */
  touch(at: number = Date.now()): void {
    this.props.updatedAt = at;
  }
}

/** Trim + collapse empty → undefined. Keeps "no description" as a single
 *  canonical value in the DB so diffs don't flip between `undefined` and `''`. */
function normaliseOptionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}
