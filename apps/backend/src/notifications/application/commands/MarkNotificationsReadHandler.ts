import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import type { TNotificationId, TUserId } from '@sh3pherd/shared-types';
import { NOTIFICATION_REPO } from '../../../appBootstrap/nestTokens.js';
import type { INotificationRepository } from '../../repositories/NotificationRepository.js';

export type TMarkNotificationsReadResult = {
  /** IDs that actually transitioned from unread → read. Already-read
   *  notifs are filtered out at the repo level so the caller can emit a
   *  precise `notification:read` socket event. */
  transitionedIds: TNotificationId[];
  readAt: number;
};

export class MarkNotificationsReadCommand {
  constructor(
    public readonly actorId: TUserId,
    /** When `'all'`, every unread notif for the actor is marked read.
     *  Otherwise only the given IDs (scoped to the actor — other users'
     *  IDs are silently ignored by the filter). */
    public readonly target: 'all' | TNotificationId[],
  ) {}
}

@CommandHandler(MarkNotificationsReadCommand)
@Injectable()
export class MarkNotificationsReadHandler implements ICommandHandler<
  MarkNotificationsReadCommand,
  TMarkNotificationsReadResult
> {
  constructor(
    @Inject(NOTIFICATION_REPO)
    private readonly repo: INotificationRepository,
  ) {}

  async execute(cmd: MarkNotificationsReadCommand): Promise<TMarkNotificationsReadResult> {
    const readAt = Date.now();
    if (cmd.target === 'all') {
      // We don't get the list of IDs back from `markAllRead` — the
      // socket `notification:read` event for "mark all" is emitted as a
      // single broadcast without IDs (the client just flips every local
      // notif to read). Here we return an empty array to signal "no
      // per-id transitions to broadcast".
      await this.repo.markAllRead(cmd.actorId, readAt);
      return { transitionedIds: [], readAt };
    }
    if (cmd.target.length === 0) {
      return { transitionedIds: [], readAt };
    }
    const transitionedIds = await this.repo.markManyRead(cmd.actorId, cmd.target, readAt);
    return { transitionedIds, readAt };
  }
}
