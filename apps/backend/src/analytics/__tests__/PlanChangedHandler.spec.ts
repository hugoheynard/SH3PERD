import { Test } from '@nestjs/testing';
import { PlanChangedHandler } from '../application/events/PlanChangedHandler.js';
import { PlanChangedEvent } from '../application/events/PlanChangedEvent.js';
import { AnalyticsEventService } from '../AnalyticsEventService.js';

describe('PlanChangedHandler', () => {
  let handler: PlanChangedHandler;
  let trackSpy: jest.SpyInstance;

  beforeEach(async () => {
    const mockAnalytics = {
      track: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [PlanChangedHandler, { provide: AnalyticsEventService, useValue: mockAnalytics }],
    }).compile();

    handler = module.get(PlanChangedHandler);
    trackSpy = mockAnalytics.track;
  });

  it('should persist a plan_changed analytics event', async () => {
    const event = new PlanChangedEvent('user_123', 'artist_free', 'artist_pro', 'annual');

    await handler.handle(event);

    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith('plan_changed', 'user_123', {
      from: 'artist_free',
      to: 'artist_pro',
      billing_cycle: 'annual',
    });
  });

  it('should handle null billing cycle', async () => {
    const event = new PlanChangedEvent('user_456', 'company_free', 'company_pro', null);

    await handler.handle(event);

    expect(trackSpy).toHaveBeenCalledWith('plan_changed', 'user_456', {
      from: 'company_free',
      to: 'company_pro',
      billing_cycle: null,
    });
  });
});
