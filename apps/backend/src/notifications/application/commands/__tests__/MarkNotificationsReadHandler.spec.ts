import type { TNotificationId } from '@sh3pherd/shared-types';
import {
  MarkNotificationsReadCommand,
  MarkNotificationsReadHandler,
} from '../MarkNotificationsReadHandler.js';
import type { INotificationRepository } from '../../../repositories/NotificationRepository.js';
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

describe('MarkNotificationsReadHandler', () => {
  it('routes target="all" to repo.markAllRead and returns no transitioned ids', async () => {
    const repo = makeRepo();
    const handler = new MarkNotificationsReadHandler(repo);

    const result = await handler.execute(new MarkNotificationsReadCommand(userId(), 'all'));

    expect(repo.markAllRead).toHaveBeenCalledWith(userId(), result.readAt);
    expect(repo.markManyRead).not.toHaveBeenCalled();
    expect(result.transitionedIds).toEqual([]);
  });

  it('returns only the ids that actually transitioned (repo filters already-read)', async () => {
    const repo = makeRepo();
    const transitioned: TNotificationId[] = [notifId(1)];
    repo.markManyRead.mockResolvedValue(transitioned);

    const handler = new MarkNotificationsReadHandler(repo);
    const result = await handler.execute(
      new MarkNotificationsReadCommand(userId(), [notifId(1), notifId(2)]),
    );

    expect(repo.markManyRead).toHaveBeenCalledWith(
      userId(),
      [notifId(1), notifId(2)],
      result.readAt,
    );
    expect(result.transitionedIds).toEqual(transitioned);
  });

  it('short-circuits on an empty id list without hitting the repo', async () => {
    const repo = makeRepo();
    const handler = new MarkNotificationsReadHandler(repo);

    const result = await handler.execute(new MarkNotificationsReadCommand(userId(), []));

    expect(repo.markManyRead).not.toHaveBeenCalled();
    expect(repo.markAllRead).not.toHaveBeenCalled();
    expect(result.transitionedIds).toEqual([]);
  });
});
