import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import type {
  TListNotificationsQuery,
  TListNotificationsResult,
  TUserId,
} from '@sh3pherd/shared-types';
import { NOTIFICATION_REPO } from '../../../appBootstrap/nestTokens.js';
import type { INotificationRepository } from '../../repositories/NotificationRepository.js';

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export class ListNotificationsQuery {
  constructor(
    public readonly actorId: TUserId,
    public readonly params: TListNotificationsQuery = {},
  ) {}
}

@QueryHandler(ListNotificationsQuery)
@Injectable()
export class ListNotificationsHandler implements IQueryHandler<
  ListNotificationsQuery,
  TListNotificationsResult
> {
  constructor(
    @Inject(NOTIFICATION_REPO)
    private readonly repo: INotificationRepository,
  ) {}

  async execute(query: ListNotificationsQuery): Promise<TListNotificationsResult> {
    const limit = clampLimit(query.params.limit);

    // Unread count is always computed from the whole inbox, regardless
    // of `unreadOnly` filtering — the client needs the global badge
    // value even while viewing a filtered view.
    const [items, unreadCount] = await Promise.all([
      this.repo.findByUserId(query.actorId, {
        limit,
        before: query.params.before,
        unreadOnly: query.params.unreadOnly,
      }),
      this.repo.countUnreadByUserId(query.actorId),
    ]);

    // A full page → there's probably another one, hand back the oldest
    // `createdAt` as the next cursor. A partial page means we reached
    // the end — no cursor.
    const nextBefore = items.length === limit ? items[items.length - 1]?.createdAt : undefined;

    return { items, unreadCount, nextBefore };
  }
}

function clampLimit(value: number | undefined): number {
  if (value === undefined) return DEFAULT_LIMIT;
  if (value <= 0) return DEFAULT_LIMIT;
  return Math.min(value, MAX_LIMIT);
}
