import type { TNotificationDomainModel } from '@sh3pherd/shared-types';
import { ListNotificationsHandler, ListNotificationsQuery } from '../ListNotificationsHandler.js';
import type { INotificationRepository } from '../../../repositories/NotificationRepository.js';
import { contractId, notifId, userId } from '../../../domain/__tests__/test-helpers.js';

function makeRepo(): jest.Mocked<INotificationRepository> {
  return {
    saveOne: jest.fn(),
    findOneById: jest.fn(),
    findByUserId: jest.fn().mockResolvedValue([]),
    countUnreadByUserId: jest.fn().mockResolvedValue(0),
    markManyRead: jest.fn(),
    markAllRead: jest.fn(),
  };
}

function makeNotif(overrides: Partial<TNotificationDomainModel> = {}): TNotificationDomainModel {
  return {
    id: notifId(1),
    user_id: userId(),
    kind: 'contract',
    action: 'received',
    contract_id: contractId(),
    title: 'N',
    read: false,
    createdAt: 1_700_000_000_000,
    ...overrides,
  } as TNotificationDomainModel;
}

describe('ListNotificationsHandler', () => {
  it('forwards params and returns unread count from repo', async () => {
    const repo = makeRepo();
    repo.findByUserId.mockResolvedValue([makeNotif()]);
    repo.countUnreadByUserId.mockResolvedValue(3);

    const handler = new ListNotificationsHandler(repo);
    const result = await handler.execute(
      new ListNotificationsQuery(userId(), { before: 42, unreadOnly: true }),
    );

    expect(repo.findByUserId).toHaveBeenCalledWith(userId(), {
      limit: 30,
      before: 42,
      unreadOnly: true,
    });
    expect(result.unreadCount).toBe(3);
    expect(result.items).toHaveLength(1);
  });

  it('returns nextBefore when the page is full, undefined otherwise', async () => {
    const repo = makeRepo();
    repo.findByUserId.mockResolvedValue(
      Array.from({ length: 30 }, (_, i) => makeNotif({ id: notifId(i + 1), createdAt: 2000 - i })),
    );

    const handler = new ListNotificationsHandler(repo);
    const result = await handler.execute(new ListNotificationsQuery(userId(), { limit: 30 }));

    expect(result.nextBefore).toBe(2000 - 29);
  });

  it('returns nextBefore=undefined on a partial page', async () => {
    const repo = makeRepo();
    repo.findByUserId.mockResolvedValue([makeNotif()]);

    const handler = new ListNotificationsHandler(repo);
    const result = await handler.execute(new ListNotificationsQuery(userId()));

    expect(result.nextBefore).toBeUndefined();
  });

  it('clamps limit to the max (100) when a larger value is requested', async () => {
    const repo = makeRepo();
    const handler = new ListNotificationsHandler(repo);

    await handler.execute(new ListNotificationsQuery(userId(), { limit: 500 }));

    expect(repo.findByUserId).toHaveBeenCalledWith(
      userId(),
      expect.objectContaining({ limit: 100 }),
    );
  });
});
