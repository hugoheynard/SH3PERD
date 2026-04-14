import { Test } from '@nestjs/testing';
import { QuotaService } from '../QuotaService.js';
import {
  PLATFORM_CONTRACT_REPO,
  USAGE_COUNTER_REPO,
  CREDIT_PURCHASE_REPO,
} from '../../appBootstrap/nestTokens.js';
import type { IPlatformContractRepository } from '../../platform-contract/infra/PlatformContractMongoRepo.js';
import type { IUsageCounterRepository } from '../infra/UsageCounterMongoRepo.js';
import type { ICreditPurchaseRepository } from '../infra/CreditPurchaseMongoRepo.js';
import { QuotaExceededError } from '../domain/QuotaExceededError.js';

describe('QuotaService — Credit Pack Integration', () => {
  let service: QuotaService;
  let mockPlatformRepo: Partial<IPlatformContractRepository>;
  let mockUsageRepo: Partial<IUsageCounterRepository>;
  let mockCreditRepo: Partial<ICreditPurchaseRepository>;

  beforeEach(async () => {
    mockPlatformRepo = {
      findByUserId: jest.fn().mockResolvedValue({
        user_id: 'user_1',
        plan: 'artist_pro',
        account_type: 'artist',
        status: 'active',
      }),
    };

    mockUsageRepo = {
      getCount: jest.fn().mockResolvedValue(0),
      increment: jest.fn().mockResolvedValue(undefined),
      getAllForUser: jest.fn().mockResolvedValue([]),
    };

    mockCreditRepo = {
      getRemainingCredits: jest.fn().mockResolvedValue(0),
      decrementCredits: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [
        QuotaService,
        { provide: PLATFORM_CONTRACT_REPO, useValue: mockPlatformRepo },
        { provide: USAGE_COUNTER_REPO, useValue: mockUsageRepo },
        { provide: CREDIT_PURCHASE_REPO, useValue: mockCreditRepo },
      ],
    }).compile();

    service = module.get(QuotaService);
  });

  describe('ensureAllowed() with bonus credits', () => {
    it('should allow usage when plan limit is reached but bonus credits remain', async () => {
      // artist_pro has 10 AI masters/month
      (mockUsageRepo.getCount as jest.Mock).mockResolvedValue(10); // at plan limit
      (mockCreditRepo.getRemainingCredits as jest.Mock).mockResolvedValue(5); // 5 bonus credits

      // Should NOT throw — effective limit = 10 + 5 = 15, usage = 10
      await expect(service.ensureAllowed('user_1', 'master_ai')).resolves.toBeUndefined();
    });

    it('should reject when both plan limit AND bonus credits are exhausted', async () => {
      (mockUsageRepo.getCount as jest.Mock).mockResolvedValue(15); // 15 used
      (mockCreditRepo.getRemainingCredits as jest.Mock).mockResolvedValue(5); // 5 bonus

      // Effective limit = 10 + 5 = 15. Usage = 15, trying to add 1 → 16 > 15
      await expect(service.ensureAllowed('user_1', 'master_ai')).rejects.toThrow(
        QuotaExceededError,
      );
    });

    it('should not query credits for unlimited resources', async () => {
      // artist_pro has unlimited repertoire_entry (limit = -1)
      await service.ensureAllowed('user_1', 'repertoire_entry');

      expect(mockCreditRepo.getRemainingCredits).not.toHaveBeenCalled();
    });
  });

  describe('recordUsage() with credit decrement', () => {
    it('should decrement bonus credits when usage exceeds plan limit', async () => {
      // After increment, usage is now 12 (plan limit = 10)
      (mockUsageRepo.getCount as jest.Mock).mockResolvedValue(12);

      await service.recordUsage('user_1', 'master_ai', 1);

      expect(mockUsageRepo.increment).toHaveBeenCalledWith(
        'user_1',
        'master_ai',
        expect.any(String),
        1,
      );
      // Usage (12) > plan limit (10), so decrement 1 credit
      expect(mockCreditRepo.decrementCredits).toHaveBeenCalledWith(
        'user_1',
        'master_ai',
        expect.any(String),
        1,
      );
    });

    it('should NOT decrement credits when still within plan limit', async () => {
      (mockUsageRepo.getCount as jest.Mock).mockResolvedValue(5); // well within limit of 10

      await service.recordUsage('user_1', 'master_ai', 1);

      expect(mockCreditRepo.decrementCredits).not.toHaveBeenCalled();
    });
  });

  describe('getUsageSummary() with bonus', () => {
    it('should include bonus and effective_limit in summary items', async () => {
      (mockUsageRepo.getAllForUser as jest.Mock).mockResolvedValue([
        { resource: 'master_ai', period_key: expect.any(String), count: 8 },
      ]);
      (mockCreditRepo.getRemainingCredits as jest.Mock).mockResolvedValue(5);

      const summary = await service.getUsageSummary('user_1');

      const aiItem = summary.find((s) => s.resource === 'master_ai');
      expect(aiItem).toBeDefined();
      expect(aiItem!.limit).toBe(10);
      expect(aiItem!.bonus).toBe(5);
      expect(aiItem!.effective_limit).toBe(15);
    });

    it('should return 0 bonus for unlimited resources', async () => {
      (mockCreditRepo.getRemainingCredits as jest.Mock).mockResolvedValue(0);

      const summary = await service.getUsageSummary('user_1');

      const repItem = summary.find((s) => s.resource === 'repertoire_entry');
      expect(repItem).toBeDefined();
      expect(repItem!.limit).toBe(-1);
      expect(repItem!.bonus).toBe(0);
      expect(repItem!.effective_limit).toBe(-1);
    });
  });
});
