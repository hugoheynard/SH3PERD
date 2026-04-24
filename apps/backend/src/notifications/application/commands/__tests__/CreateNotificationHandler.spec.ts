import {
  CreateNotificationCommand,
  CreateNotificationHandler,
} from '../CreateNotificationHandler.js';
import type { INotificationRepository } from '../../../repositories/NotificationRepository.js';
import type { INotificationPusher } from '../../../infra/NotificationPusher.js';
import { contractId, userId } from '../../../domain/__tests__/test-helpers.js';

function makeRepo(): jest.Mocked<INotificationRepository> {
  return {
    saveOne: jest.fn().mockResolvedValue(true),
    findOneById: jest.fn(),
    findByUserId: jest.fn(),
    countUnreadByUserId: jest.fn(),
    markManyRead: jest.fn(),
    markAllRead: jest.fn(),
  };
}

function makePusher(): jest.Mocked<INotificationPusher> {
  return {
    pushCreated: jest.fn(),
    pushRead: jest.fn(),
    pushReadAll: jest.fn(),
  };
}

describe('CreateNotificationHandler', () => {
  it('persists a contract notification with a fresh id + read=false', async () => {
    const repo = makeRepo();
    const pusher = makePusher();
    const handler = new CreateNotificationHandler(repo, pusher);

    const result = await handler.execute(
      new CreateNotificationCommand({
        user_id: userId(),
        kind: 'contract',
        action: 'signed',
        contract_id: contractId(),
        title: 'Contract signed',
      }),
    );

    expect(result.id).toMatch(/^notif_/);
    expect(result.read).toBe(false);
    expect(result.kind).toBe('contract');
    if (result.kind !== 'contract') throw new Error('unreachable');
    expect(result.action).toBe('signed');
    expect(repo.saveOne).toHaveBeenCalledWith(result);
    expect(pusher.pushCreated).toHaveBeenCalledWith(result.user_id, result);
  });

  it('persists a system notification without contract fields', async () => {
    const repo = makeRepo();
    const pusher = makePusher();
    const handler = new CreateNotificationHandler(repo, pusher);

    const result = await handler.execute(
      new CreateNotificationCommand({
        user_id: userId(),
        kind: 'system',
        title: 'Maintenance tonight',
        body: 'Back at 2am.',
      }),
    );

    expect(result.kind).toBe('system');
    expect(result.body).toBe('Back at 2am.');
    expect(repo.saveOne).toHaveBeenCalledTimes(1);
    expect(pusher.pushCreated).toHaveBeenCalledTimes(1);
  });
});
