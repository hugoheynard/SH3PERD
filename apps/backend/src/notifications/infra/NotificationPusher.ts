import type { TNotificationDomainModel, TNotificationId, TUserId } from '@sh3pherd/shared-types';

/**
 * Port through which the application layer pushes live notification
 * updates to connected clients. The socket.io gateway is the only
 * implementation today, but the handlers depend on this abstraction so
 * they stay testable (no socket machinery in unit tests) and so a
 * future transport swap (SSE, Redis pub/sub, …) doesn't leak into the
 * handler code.
 */
export type INotificationPusher = {
  /** A new notification was persisted for `userId` — broadcast it to
   *  every socket currently joined to that user's room. */
  pushCreated(userId: TUserId, notification: TNotificationDomainModel): void;

  /** A subset of notifications transitioned to read (via per-id
   *  mark-read). Only called with ids that actually changed state so
   *  the client can flip them without guessing. */
  pushRead(userId: TUserId, ids: TNotificationId[], readAt: number): void;

  /** `mark-all-read` variant — the client flips every local notif to
   *  read without needing the id list. */
  pushReadAll(userId: TUserId, readAt: number): void;
};
