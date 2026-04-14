import { Inject, Injectable, Logger } from '@nestjs/common';
import { ANALYTICS_EVENT_REPO } from '../appBootstrap/nestTokens.js';
import type { IAnalyticsEventRepository } from './infra/AnalyticsEventMongoRepo.js';
import type {
  TAnalyticsEventType,
  TUserId,
  TAnalyticsEventDomainModel,
} from '@sh3pherd/shared-types';

/**
 * Lightweight service for recording analytics events.
 *
 * Usage from any event handler or command handler:
 *
 * ```ts
 * await this.analytics.track('plan_changed', userId, {
 *   from: 'artist_free',
 *   to: 'artist_pro',
 *   billing_cycle: 'annual',
 * });
 * ```
 *
 * Events are append-only — once inserted, they are never modified or deleted.
 * The service swallows insertion errors to avoid breaking the primary flow
 * (analytics is a side effect, not a critical path).
 */
@Injectable()
export class AnalyticsEventService {
  private readonly logger = new Logger(AnalyticsEventService.name);

  constructor(
    @Inject(ANALYTICS_EVENT_REPO)
    private readonly eventRepo: IAnalyticsEventRepository,
  ) {}

  /**
   * Record a single analytics event.
   *
   * Fire-and-forget semantics — errors are logged but never thrown.
   */
  async track(
    type: TAnalyticsEventType,
    userId: TUserId,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    const event: TAnalyticsEventDomainModel = {
      id: `event_${crypto.randomUUID()}`,
      type,
      user_id: userId,
      timestamp: new Date(),
      metadata,
    };

    try {
      await this.eventRepo.insertEvent(event);
      this.logger.debug(`[Analytics] ${type} — user=${userId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to persist analytics event ${type}: ${message}`);
    }
  }

  /**
   * Record multiple events in a single batch.
   * Useful for bulk operations or migration scripts.
   */
  async trackBatch(
    events: Array<{
      type: TAnalyticsEventType;
      userId: TUserId;
      metadata?: Record<string, unknown>;
    }>,
  ): Promise<void> {
    const records: TAnalyticsEventDomainModel[] = events.map((e) => ({
      id: `event_${crypto.randomUUID()}`,
      type: e.type,
      user_id: e.userId,
      timestamp: new Date(),
      metadata: e.metadata ?? {},
    }));

    try {
      await this.eventRepo.insertMany(records);
      this.logger.debug(`[Analytics] Batch of ${records.length} events persisted`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to persist analytics batch: ${message}`);
    }
  }
}
