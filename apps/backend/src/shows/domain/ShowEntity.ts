import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type {
  TPlaylistColor,
  TShowAxisCriterion,
  TShowDomainModel,
  TShowId,
  TUserId,
} from '@sh3pherd/shared-types';

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
  get totalDurationTargetSeconds(): number | undefined {
    return this.props.totalDurationTargetSeconds;
  }
  get totalTrackCountTarget(): number | undefined {
    return this.props.totalTrackCountTarget;
  }
  get startAt(): number | undefined {
    return this.props.startAt;
  }
  get axisCriteria(): readonly TShowAxisCriterion[] | undefined {
    return this.props.axisCriteria;
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

  /** Set (or clear) the whole-show duration target. `undefined` removes
   *  the target, a positive integer (seconds) sets it. Negative or zero
   *  values are rejected — use `undefined` to clear. */
  setTotalDurationTarget(seconds: number | undefined): void {
    if (seconds === undefined) {
      this.props.totalDurationTargetSeconds = undefined;
    } else {
      if (!Number.isFinite(seconds) || seconds <= 0) {
        throw new Error('SHOW_TOTAL_DURATION_TARGET_INVALID');
      }
      this.props.totalDurationTargetSeconds = Math.floor(seconds);
    }
    this.touch();
  }

  /** Set (or clear) the whole-show track-count target. Same semantics
   *  as `setTotalDurationTarget` — they are stored independently but
   *  meant to be mutually exclusive in the UI. */
  setTotalTrackCountTarget(count: number | undefined): void {
    if (count === undefined) {
      this.props.totalTrackCountTarget = undefined;
    } else {
      if (!Number.isFinite(count) || count <= 0) {
        throw new Error('SHOW_TOTAL_TRACK_COUNT_TARGET_INVALID');
      }
      this.props.totalTrackCountTarget = Math.floor(count);
    }
    this.touch();
  }

  /** Set (or clear) the absolute scheduled start time. `undefined`
   *  clears the schedule. Any finite positive number is accepted — we
   *  don't gate on "future" because the artist may backfill past plans. */
  setStartAt(startAt: number | undefined): void {
    if (startAt === undefined) {
      this.props.startAt = undefined;
    } else {
      if (!Number.isFinite(startAt) || startAt < 0) {
        throw new Error('SHOW_START_AT_INVALID');
      }
      this.props.startAt = Math.floor(startAt);
    }
    this.touch();
  }

  /** Replace the per-axis criteria list. Pass `undefined` to clear.
   *  Empty array clears too — both are collapsed to `undefined` on
   *  storage so diffs stay clean. At most one entry per axis: the last
   *  occurrence wins if the caller passes duplicates. */
  setAxisCriteria(criteria: readonly TShowAxisCriterion[] | undefined): void {
    if (!criteria || criteria.length === 0) {
      this.props.axisCriteria = undefined;
    } else {
      // Dedupe by axis keeping the last occurrence (caller-friendly).
      const byAxis = new Map<string, TShowAxisCriterion>();
      for (const c of criteria) byAxis.set(c.axis, { ...c });
      this.props.axisCriteria = Array.from(byAxis.values());
    }
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
