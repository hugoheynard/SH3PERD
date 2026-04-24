import type {
  TNotificationDomainModel,
  TNotificationId,
  TNotificationKind,
  TUserId,
} from '@sh3pherd/shared-types';
import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';

/**
 * A user-facing notification. Once created the content is immutable —
 * only the read state can change (`markRead`). The entity wraps the
 * shared-types discriminated union so callers get the narrowed payload
 * through `toDomain`.
 *
 * Invariants:
 * - `title` is trimmed + non-empty.
 * - `read` and `readAt` move together: marking read sets the timestamp,
 *   and `read === true` implies `readAt` is set.
 */
export class NotificationEntity extends Entity<TNotificationDomainModel> {
  constructor(props: TEntityInput<TNotificationDomainModel>) {
    const now = Date.now();
    const title = props.title.trim();
    if (!title) {
      throw new Error('NOTIFICATION_TITLE_REQUIRED');
    }
    super(
      {
        ...props,
        title,
        body: normaliseOptionalText(props.body),
        createdAt: props.createdAt ?? now,
        read: props.read ?? false,
      } as TEntityInput<TNotificationDomainModel>,
      'notif',
    );
  }

  override get id(): TNotificationId {
    return this.props.id;
  }

  get user_id(): TUserId {
    return this.props.user_id;
  }

  get kind(): TNotificationKind {
    return this.props.kind;
  }

  get read(): boolean {
    return this.props.read;
  }

  get readAt(): number | undefined {
    return this.props.readAt;
  }

  get createdAt(): number {
    return this.props.createdAt;
  }

  isOwnedBy(userId: TUserId): boolean {
    return this.props.user_id === userId;
  }

  /** Idempotent: marking an already-read notif is a no-op (keeps the
   *  original `readAt` so bulk mark-read doesn't churn timestamps). */
  markRead(at: number = Date.now()): void {
    if (this.props.read) return;
    this.props.read = true;
    this.props.readAt = at;
  }
}

function normaliseOptionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}
