import { NotificationEntity } from '../NotificationEntity.js';
import {
  contractId,
  makeContractNotification,
  makeSystemNotification,
  notifId,
  userId,
} from './test-helpers.js';

describe('NotificationEntity', () => {
  it('trims the title on construction', () => {
    const n = makeContractNotification({ title: '  New contract  ' });
    expect(n.toDomain.title).toBe('New contract');
  });

  it('rejects empty titles', () => {
    expect(() => makeContractNotification({ title: '   ' })).toThrow('NOTIFICATION_TITLE_REQUIRED');
  });

  it('normalises empty body to undefined', () => {
    const n = makeSystemNotification({ body: '   ' });
    expect(n.toDomain.body).toBeUndefined();
  });

  it('defaults read=false and createdAt=now when not provided', () => {
    const before = Date.now();
    const n = new NotificationEntity({
      id: notifId(),
      user_id: userId(),
      kind: 'contract',
      action: 'received',
      contract_id: contractId(),
      title: 'Hello',
    } as unknown as ConstructorParameters<typeof NotificationEntity>[0]);
    expect(n.read).toBe(false);
    expect(n.createdAt).toBeGreaterThanOrEqual(before);
  });

  describe('markRead', () => {
    it('sets read + readAt on first call', () => {
      const n = makeContractNotification();
      n.markRead(42);
      expect(n.read).toBe(true);
      expect(n.readAt).toBe(42);
    });

    it('is idempotent — keeps the original readAt on repeat calls', () => {
      const n = makeContractNotification();
      n.markRead(42);
      n.markRead(99);
      expect(n.readAt).toBe(42);
    });
  });

  describe('isOwnedBy', () => {
    it('returns true for the recipient', () => {
      const owner = userId(7);
      const n = makeSystemNotification({ user_id: owner });
      expect(n.isOwnedBy(owner)).toBe(true);
    });

    it('returns false for another user', () => {
      const n = makeSystemNotification({ user_id: userId(1) });
      expect(n.isOwnedBy(userId(2))).toBe(false);
    });
  });

  it('narrows the toDomain payload through the kind discriminant', () => {
    const n = makeContractNotification({ contract_id: contractId(3) });
    const dom = n.toDomain;
    if (dom.kind !== 'contract') throw new Error('expected contract kind');
    expect(dom.contract_id).toBe(contractId(3));
  });
});
