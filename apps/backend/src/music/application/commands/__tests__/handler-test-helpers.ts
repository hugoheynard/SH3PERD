import type { ClientSession } from 'mongodb';
import type { IRepertoireEntryAggregateRepository } from '../../../repositories/RepertoireEntryAggregateRepository.js';
import type { RepertoireEntryAggregate } from '../../../domain/RepertoireEntryAggregate.js';
import type { QuotaService } from '../../../../quota/QuotaService.js';
import type { AnalyticsEventService } from '../../../../analytics/AnalyticsEventService.js';
import type { ITrackStorageService } from '../../../infra/storage/ITrackStorageService.js';

/**
 * Mock factories used by MusicVersion handler tests.
 * Each mock implements only the subset the handler actually calls.
 */

export const mockAggregateRepo = (): jest.Mocked<IRepertoireEntryAggregateRepository> =>
  ({
    loadByVersionId: jest.fn<Promise<RepertoireEntryAggregate>, [string]>(),
    loadByOwnerAndReference: jest.fn<Promise<RepertoireEntryAggregate>, [string, string]>(),
    save: jest.fn<Promise<void>, [RepertoireEntryAggregate, ClientSession | undefined]>(),
    startSession: jest.fn(),
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

export const mockStorage = (): jest.Mocked<Pick<ITrackStorageService, 'delete'>> => ({
  delete: jest.fn().mockResolvedValue(undefined),
});
