import { QuotaService } from '../QuotaService';
import { QuotaExceededError } from '../domain/QuotaExceededError';
import type { IPlatformContractRepository } from '../../platform-contract/infra/PlatformContractMongoRepo';
import type { IUsageCounterRepository } from '../infra/UsageCounterMongoRepo';

/**
 * Unit tests for QuotaService.
 *
 * Tests the four key behaviors:
 * 1. Allow when under limit
 * 2. Block (402) when at/over limit
 * 3. Allow unlimited resources (-1)
 * 4. Block unavailable resources (0)
 */

const mockPlatformRepo: jest.Mocked<IPlatformContractRepository> = {
  findByUserId: jest.fn(),
  findOne: jest.fn(),
  findMany: jest.fn(),
  save: jest.fn(),
  saveOne: jest.fn(),
  deleteOne: jest.fn(),
  startSession: jest.fn(),
} as any;

const mockUsageRepo: jest.Mocked<IUsageCounterRepository> = {
  getCount: jest.fn(),
  increment: jest.fn(),
  getAllForUser: jest.fn(),
  findOne: jest.fn(),
  findMany: jest.fn(),
  save: jest.fn(),
  saveOne: jest.fn(),
  deleteOne: jest.fn(),
  startSession: jest.fn(),
} as any;

describe('QuotaService', () => {
  let service: QuotaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuotaService(mockPlatformRepo, mockUsageRepo);
  });

  // ── ensureAllowed ─────────────────────────────────────

  describe('ensureAllowed', () => {
    it('allows when under the limit', async () => {
      mockPlatformRepo.findByUserId.mockResolvedValue({
        id: 'pc_1',
        user_id: 'u1' as any,
        plan: 'plan_free',
        status: 'active',
        startDate: new Date(),
      });
      mockUsageRepo.getCount.mockResolvedValue(2); // limit is 3

      await expect(service.ensureAllowed('u1' as any, 'master_standard')).resolves.not.toThrow();
    });

    it('throws QuotaExceededError when at limit', async () => {
      mockPlatformRepo.findByUserId.mockResolvedValue({
        id: 'pc_1',
        user_id: 'u1' as any,
        plan: 'plan_free',
        status: 'active',
        startDate: new Date(),
      });
      mockUsageRepo.getCount.mockResolvedValue(3); // limit is 3, current is 3

      await expect(service.ensureAllowed('u1' as any, 'master_standard')).rejects.toThrow(
        QuotaExceededError,
      );
    });

    it('throws QuotaExceededError when over limit', async () => {
      mockPlatformRepo.findByUserId.mockResolvedValue({
        id: 'pc_1',
        user_id: 'u1' as any,
        plan: 'plan_free',
        status: 'active',
        startDate: new Date(),
      });
      mockUsageRepo.getCount.mockResolvedValue(50); // limit is 50 for repertoire_entry

      await expect(service.ensureAllowed('u1' as any, 'repertoire_entry')).rejects.toThrow(
        QuotaExceededError,
      );
    });

    it('allows unlimited resources without checking usage', async () => {
      mockPlatformRepo.findByUserId.mockResolvedValue({
        id: 'pc_1',
        user_id: 'u1' as any,
        plan: 'plan_pro',
        status: 'active',
        startDate: new Date(),
      });

      // plan_pro has master_standard: -1 (unlimited)
      await expect(service.ensureAllowed('u1' as any, 'master_standard')).resolves.not.toThrow();

      // Should NOT hit the usage repo — skip DB when unlimited
      expect(mockUsageRepo.getCount).not.toHaveBeenCalled();
    });

    it('blocks features not available on plan (limit: 0)', async () => {
      mockPlatformRepo.findByUserId.mockResolvedValue({
        id: 'pc_1',
        user_id: 'u1' as any,
        plan: 'plan_free',
        status: 'active',
        startDate: new Date(),
      });

      // plan_free has master_ai: 0
      await expect(service.ensureAllowed('u1' as any, 'master_ai')).rejects.toThrow(
        QuotaExceededError,
      );

      expect(mockUsageRepo.getCount).not.toHaveBeenCalled();
    });

    it('allows resources not listed for the plan (unlimited by default)', async () => {
      mockPlatformRepo.findByUserId.mockResolvedValue({
        id: 'pc_1',
        user_id: 'u1' as any,
        plan: 'plan_band',
        status: 'active',
        startDate: new Date(),
      });

      // plan_band only lists storage_bytes — everything else is unlimited
      await expect(service.ensureAllowed('u1' as any, 'master_standard')).resolves.not.toThrow();

      expect(mockUsageRepo.getCount).not.toHaveBeenCalled();
    });

    it('handles amount > 1 (e.g. storage_bytes)', async () => {
      mockPlatformRepo.findByUserId.mockResolvedValue({
        id: 'pc_1',
        user_id: 'u1' as any,
        plan: 'plan_free',
        status: 'active',
        startDate: new Date(),
      });
      mockUsageRepo.getCount.mockResolvedValue(400 * 1024 * 1024); // 400 Mo

      // Uploading 200 Mo would exceed the 500 Mo limit
      const twoHundredMo = 200 * 1024 * 1024;
      await expect(
        service.ensureAllowed('u1' as any, 'storage_bytes', twoHundredMo),
      ).rejects.toThrow(QuotaExceededError);

      // Uploading 50 Mo would be fine
      const fiftyMo = 50 * 1024 * 1024;
      mockUsageRepo.getCount.mockResolvedValue(400 * 1024 * 1024);
      await expect(
        service.ensureAllowed('u1' as any, 'storage_bytes', fiftyMo),
      ).resolves.not.toThrow();
    });
  });

  // ── recordUsage ───────────────────────────────────────

  describe('recordUsage', () => {
    it('calls increment on the usage repo', async () => {
      mockPlatformRepo.findByUserId.mockResolvedValue({
        id: 'pc_1',
        user_id: 'u1' as any,
        plan: 'plan_free',
        status: 'active',
        startDate: new Date(),
      });

      await service.recordUsage('u1' as any, 'master_standard');

      expect(mockUsageRepo.increment).toHaveBeenCalledTimes(1);
      expect(mockUsageRepo.increment).toHaveBeenCalledWith(
        'u1',
        'master_standard',
        expect.stringMatching(/^\d{4}-\d{2}$/), // monthly period key
        1,
      );
    });

    it('skips recording for resources not listed on the plan', async () => {
      mockPlatformRepo.findByUserId.mockResolvedValue({
        id: 'pc_1',
        user_id: 'u1' as any,
        plan: 'plan_band',
        status: 'active',
        startDate: new Date(),
      });

      // plan_band doesn't list master_standard → nothing to record
      await service.recordUsage('u1' as any, 'master_standard');

      expect(mockUsageRepo.increment).not.toHaveBeenCalled();
    });
  });

  // ── getUsageSummary ───────────────────────────────────

  describe('getUsageSummary', () => {
    it('returns usage items with current counts', async () => {
      mockPlatformRepo.findByUserId.mockResolvedValue({
        id: 'pc_1',
        user_id: 'u1' as any,
        plan: 'plan_free',
        status: 'active',
        startDate: new Date(),
      });
      mockUsageRepo.getAllForUser.mockResolvedValue([
        {
          id: 'u1',
          user_id: 'u1' as any,
          resource: 'repertoire_entry',
          period_key: 'lifetime',
          count: 23,
          updated_at: new Date(),
        },
        {
          id: 'u2',
          user_id: 'u1' as any,
          resource: 'master_standard',
          period_key: '2026-04',
          count: 1,
          updated_at: new Date(),
        },
      ]);

      const summary = await service.getUsageSummary('u1' as any);

      expect(summary).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            resource: 'repertoire_entry',
            current: 23,
            limit: 50,
            period: 'lifetime',
          }),
          expect.objectContaining({
            resource: 'master_standard',
            current: 1,
            limit: 3,
            period: 'monthly',
          }),
        ]),
      );
    });

    it('returns 0 for resources with no usage records', async () => {
      mockPlatformRepo.findByUserId.mockResolvedValue({
        id: 'pc_1',
        user_id: 'u1' as any,
        plan: 'plan_free',
        status: 'active',
        startDate: new Date(),
      });
      mockUsageRepo.getAllForUser.mockResolvedValue([]); // no usage at all

      const summary = await service.getUsageSummary('u1' as any);

      for (const item of summary) {
        expect(item.current).toBe(0);
      }
    });
  });
});
