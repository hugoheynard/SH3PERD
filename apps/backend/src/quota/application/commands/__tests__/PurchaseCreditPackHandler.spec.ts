import { Test } from '@nestjs/testing';
import {
  PurchaseCreditPackCommand,
  PurchaseCreditPackHandler,
} from '../PurchaseCreditPackCommand.js';
import { CREDIT_PURCHASE_REPO } from '../../../../appBootstrap/nestTokens.js';
import type { TCreditPurchaseDomainModel } from '@sh3pherd/shared-types';
import { BusinessError } from '../../../../utils/errorManagement/BusinessError.js';

describe('PurchaseCreditPackHandler', () => {
  let handler: PurchaseCreditPackHandler;
  let savedPurchases: TCreditPurchaseDomainModel[];
  let mockSave: jest.Mock;

  beforeEach(async () => {
    savedPurchases = [];
    mockSave = jest.fn(async (purchase: TCreditPurchaseDomainModel) => {
      savedPurchases.push(purchase);
      return true;
    });

    const module = await Test.createTestingModule({
      providers: [
        PurchaseCreditPackHandler,
        { provide: CREDIT_PURCHASE_REPO, useValue: { save: mockSave } },
      ],
    }).compile();

    handler = module.get(PurchaseCreditPackHandler);
  });

  it('should create a purchase record for a valid pack', async () => {
    const cmd = new PurchaseCreditPackCommand('user_123', 'pack_ai_10', 'pi_stripe_xxx');

    const result = await handler.execute(cmd);

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(savedPurchases).toHaveLength(1);

    const purchase = savedPurchases[0];
    expect(purchase.id).toMatch(/^creditPurchase_/);
    expect(purchase.user_id).toBe('user_123');
    expect(purchase.resource).toBe('master_ai');
    expect(purchase.amount).toBe(10);
    expect(purchase.remaining).toBe(10);
    expect(purchase.period).toBe('monthly');
    expect(purchase.stripe_payment_id).toBe('pi_stripe_xxx');
    expect(purchase.purchased_at).toBeInstanceOf(Date);

    // Monthly packs get a YYYY-MM period key
    expect(purchase.period_key).toMatch(/^\d{4}-\d{2}$/);

    expect(result).toEqual(purchase);
  });

  it('should use permanent period_key for one_time packs', async () => {
    const cmd = new PurchaseCreditPackCommand('user_456', 'pack_storage_5');

    await handler.execute(cmd);

    const purchase = savedPurchases[0];
    expect(purchase.resource).toBe('storage_bytes');
    expect(purchase.amount).toBe(5 * 1024 * 1024 * 1024);
    expect(purchase.period).toBe('one_time');
    expect(purchase.period_key).toBe('permanent');
  });

  it('should throw 404 for non-existent pack', async () => {
    const cmd = new PurchaseCreditPackCommand('user_789', 'pack_does_not_exist');

    await expect(handler.execute(cmd)).rejects.toThrow(BusinessError);

    try {
      await handler.execute(cmd);
    } catch (err) {
      expect(err).toBeInstanceOf(BusinessError);
      expect((err as BusinessError).code).toBe('CREDIT_PACK_NOT_FOUND');
      expect((err as BusinessError).status).toBe(404);
    }
  });
});
