import type { ClientSession } from 'mongodb';
import type { IRepertoireEntryAggregateRepository } from '../../../repositories/RepertoireEntryAggregateRepository.js';
import type { RepertoireEntryAggregate } from '../../../domain/RepertoireEntryAggregate.js';
import type { QuotaService } from '../../../../quota/QuotaService.js';
import type { AnalyticsEventService } from '../../../../analytics/AnalyticsEventService.js';
import type { TransactionRunner } from '../../../../appBootstrap/database/TransactionRunner.js';
import type { ITrackStorageService } from '../../../infra/storage/ITrackStorageService.js';

/**
 * Mock factories used by MusicVersion handler tests.
 * Kept minimal — each mock implements only the subset the handler calls.
 */

export const mockAggregateRepo = (): jest.Mocked<IRepertoireEntryAggregateRepository> =>
  ({
    loadByVersionId: jest.fn<Promise<RepertoireEntryAggregate | null>, [string]>(),
    loadByOwnerAndReference: jest.fn<Promise<RepertoireEntryAggregate | null>, [string, string]>(),
    save: jest.fn<Promise<void>, [RepertoireEntryAggregate, ClientSession | undefined]>(),
  }) as unknown as jest.Mocked<IRepertoireEntryAggregateRepository>;

export const mockQuotaService = (): jest.Mocked<
  Pick<QuotaService, 'ensureAllowed' | 'recordUsage'>
> => ({
  ensureAllowed: jest.fn().mockResolvedValue(undefined),
  recordUsage: jest.fn().mockResolvedValue(undefined),
});

export const mockAnalytics = (): jest.Mocked<Pick<AnalyticsEventService, 'track'>> => ({
  track: jest.fn().mockResolvedValue(undefined),
});

/** TransactionRunner mock that executes the callback inline, no real tx. */
export const mockTransactionRunner = (): jest.Mocked<Pick<TransactionRunner, 'run'>> => ({
  run: jest.fn(async (fn: (session: ClientSession) => Promise<unknown>) =>
    fn(undefined as unknown as ClientSession),
  ) as unknown as jest.Mock,
});

export const mockStorage = (): jest.Mocked<Pick<ITrackStorageService, 'delete'>> => ({
  delete: jest.fn().mockResolvedValue(undefined),
});
