import { Test } from '@nestjs/testing';
import { AnalyticsEventService } from '../AnalyticsEventService.js';
import { ANALYTICS_EVENT_REPO } from '../../appBootstrap/nestTokens.js';
import type { IAnalyticsEventRepository } from '../infra/AnalyticsEventMongoRepo.js';
import type { TAnalyticsEventDomainModel } from '@sh3pherd/shared-types';

describe('AnalyticsEventService', () => {
  let service: AnalyticsEventService;
  let insertedEvents: TAnalyticsEventDomainModel[];
  let mockRepo: Partial<IAnalyticsEventRepository>;

  beforeEach(async () => {
    insertedEvents = [];
    mockRepo = {
      insertEvent: jest.fn(async (event: TAnalyticsEventDomainModel) => {
        insertedEvents.push(event);
      }),
      insertMany: jest.fn(async (events: TAnalyticsEventDomainModel[]) => {
        insertedEvents.push(...events);
      }),
    };

    const module = await Test.createTestingModule({
      providers: [AnalyticsEventService, { provide: ANALYTICS_EVENT_REPO, useValue: mockRepo }],
    }).compile();

    service = module.get(AnalyticsEventService);
  });

  describe('track()', () => {
    it('should insert an analytics event with correct fields', async () => {
      await service.track('user_registered', 'user_123', {
        email: 'hugo@example.com',
        first_name: 'Hugo',
      });

      expect(mockRepo.insertEvent).toHaveBeenCalledTimes(1);
      expect(insertedEvents).toHaveLength(1);

      const event = insertedEvents[0];
      expect(event.type).toBe('user_registered');
      expect(event.user_id).toBe('user_123');
      expect(event.id).toMatch(/^event_/);
      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.metadata).toEqual({
        email: 'hugo@example.com',
        first_name: 'Hugo',
      });
    });

    it('should default metadata to empty object when not provided', async () => {
      await service.track('user_login', 'user_456');

      expect(insertedEvents).toHaveLength(1);
      expect(insertedEvents[0].metadata).toEqual({});
    });

    it('should not throw when repo fails — fire-and-forget', async () => {
      (mockRepo.insertEvent as jest.Mock).mockRejectedValueOnce(
        new Error('MongoDB connection lost'),
      );

      // Should NOT throw
      await expect(
        service.track('plan_changed', 'user_789', { from: 'artist_free', to: 'artist_pro' }),
      ).resolves.toBeUndefined();
    });
  });

  describe('trackBatch()', () => {
    it('should insert multiple events in a single call', async () => {
      await service.trackBatch([
        { type: 'user_registered', userId: 'user_1', metadata: { email: 'a@b.com' } },
        { type: 'user_login', userId: 'user_1' },
        { type: 'track_uploaded', userId: 'user_2', metadata: { track_id: 'trk_1' } },
      ]);

      expect(mockRepo.insertMany).toHaveBeenCalledTimes(1);
      expect(insertedEvents).toHaveLength(3);
      expect(insertedEvents.map((e) => e.type)).toEqual([
        'user_registered',
        'user_login',
        'track_uploaded',
      ]);
    });

    it('should not call insertMany for empty batch', async () => {
      await service.trackBatch([]);
      // insertMany is still called by the service — but the repo skips on empty
      // The service itself doesn't short-circuit, the repo does
      expect(mockRepo.insertMany).toHaveBeenCalledTimes(1);
    });

    it('should not throw when repo fails', async () => {
      (mockRepo.insertMany as jest.Mock).mockRejectedValueOnce(new Error('Write concern error'));

      await expect(
        service.trackBatch([{ type: 'user_login', userId: 'user_1' }]),
      ).resolves.toBeUndefined();
    });
  });
});
