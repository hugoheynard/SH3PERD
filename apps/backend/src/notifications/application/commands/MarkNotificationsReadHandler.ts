import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import type { TNotificationId, TUserId } from '@sh3pherd/shared-types';
import { NOTIFICATION_PUSHER, NOTIFICATION_REPO } from '../../../appBootstrap/nestTokens.js';
import type { INotificationRepository } from '../../repositories/NotificationRepository.js';
import type { INotificationPusher } from '../../infra/NotificationPusher.js';

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
    @Inject(NOTIFICATION_PUSHER)
    private readonly pusher: INotificationPusher,
  ) {}

  async execute(cmd: MarkNotificationsReadCommand): Promise<TMarkNotificationsReadResult> {
    const readAt = Date.now();
    if (cmd.target === 'all') {
      const modified = await this.repo.markAllRead(cmd.actorId, readAt);
      // Only push if something actually flipped — a mark-all on a
      // fully-read inbox shouldn't wake up every open tab for nothing.
      if (modified > 0) {
        this.pusher.pushReadAll(cmd.actorId, readAt);
      }
      return { transitionedIds: [], readAt };
    }
    if (cmd.target.length === 0) {
      return { transitionedIds: [], readAt };
    }
    const transitionedIds = await this.repo.markManyRead(cmd.actorId, cmd.target, readAt);
    if (transitionedIds.length > 0) {
      this.pusher.pushRead(cmd.actorId, transitionedIds, readAt);
    }
    return { transitionedIds, readAt };
  }
}
