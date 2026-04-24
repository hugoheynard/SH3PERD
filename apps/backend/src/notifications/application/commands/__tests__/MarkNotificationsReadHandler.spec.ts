import type { TNotificationId } from '@sh3pherd/shared-types';
import {
  MarkNotificationsReadCommand,
  MarkNotificationsReadHandler,
} from '../MarkNotificationsReadHandler.js';
import type { INotificationRepository } from '../../../repositories/NotificationRepository.js';
import type { INotificationPusher } from '../../../infra/NotificationPusher.js';
import { notifId, userId } from '../../../domain/__tests__/test-helpers.js';

function makeRepo(): jest.Mocked<INotificationRepository> {
  return {
    saveOne: jest.fn(),
    findOneById: jest.fn(),
    findByUserId: jest.fn(),
    countUnreadByUserId: jest.fn(),
    markManyRead: jest.fn().mockResolvedValue([]),
    markAllRead: jest.fn().mockResolvedValue(0),
  };
}

function makePusher(): jest.Mocked<INotificationPusher> {
  return {
    pushCreated: jest.fn(),
    pushRead: jest.fn(),
    pushReadAll: jest.fn(),
  };
}

describe('MarkNotificationsReadHandler', () => {
  it('routes target="all" to repo.markAllRead and pushes only when something flipped', async () => {
    const repo = makeRepo();
    repo.markAllRead.mockResolvedValue(4);
    const pusher = makePusher();
    const handler = new MarkNotificationsReadHandler(repo, pusher);

    const result = await handler.execute(new MarkNotificationsReadCommand(userId(), 'all'));

    expect(repo.markAllRead).toHaveBeenCalledWith(userId(), result.readAt);
    expect(pusher.pushReadAll).toHaveBeenCalledWith(userId(), result.readAt);
    expect(repo.markManyRead).not.toHaveBeenCalled();
    expect(result.transitionedIds).toEqual([]);
  });

  it('skips the pushReadAll when mark-all modified zero rows', async () => {
    const repo = makeRepo();
    repo.markAllRead.mockResolvedValue(0);
    const pusher = makePusher();
    const handler = new MarkNotificationsReadHandler(repo, pusher);

    await handler.execute(new MarkNotificationsReadCommand(userId(), 'all'));

    expect(pusher.pushReadAll).not.toHaveBeenCalled();
  });

  it('pushes only the ids that actually transitioned', async () => {
    const repo = makeRepo();
    const transitioned: TNotificationId[] = [notifId(1)];
    repo.markManyRead.mockResolvedValue(transitioned);
    const pusher = makePusher();

    const handler = new MarkNotificationsReadHandler(repo, pusher);
    const result = await handler.execute(
      new MarkNotificationsReadCommand(userId(), [notifId(1), notifId(2)]),
    );

    expect(repo.markManyRead).toHaveBeenCalledWith(
      userId(),
      [notifId(1), notifId(2)],
      result.readAt,
    );
    expect(pusher.pushRead).toHaveBeenCalledWith(userId(), transitioned, result.readAt);
    expect(result.transitionedIds).toEqual(transitioned);
  });

  it('skips the push when no id transitioned (all already read)', async () => {
    const repo = makeRepo();
    repo.markManyRead.mockResolvedValue([]);
    const pusher = makePusher();
    const handler = new MarkNotificationsReadHandler(repo, pusher);

    await handler.execute(new MarkNotificationsReadCommand(userId(), [notifId(1)]));

    expect(pusher.pushRead).not.toHaveBeenCalled();
  });

  it('short-circuits on an empty id list without hitting the repo', async () => {
    const repo = makeRepo();
    const pusher = makePusher();
    const handler = new MarkNotificationsReadHandler(repo, pusher);

    const result = await handler.execute(new MarkNotificationsReadCommand(userId(), []));

    expect(repo.markManyRead).not.toHaveBeenCalled();
    expect(repo.markAllRead).not.toHaveBeenCalled();
    expect(pusher.pushRead).not.toHaveBeenCalled();
    expect(result.transitionedIds).toEqual([]);
  });
});
