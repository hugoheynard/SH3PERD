import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { PlanChangedEvent } from './PlanChangedEvent.js';
import { AnalyticsEventService } from '../../AnalyticsEventService.js';

/**
 * Handles PlanChangedEvent — persists an analytics event for audit / dashboards.
 */
@EventsHandler(PlanChangedEvent)
@Injectable()
export class PlanChangedHandler implements IEventHandler<PlanChangedEvent> {
  private readonly logger = new Logger(PlanChangedHandler.name);

  constructor(private readonly analytics: AnalyticsEventService) {}

  async handle(event: PlanChangedEvent): Promise<void> {
    this.logger.log(`[PlanChanged] ${event.fromPlan} → ${event.toPlan} — user=${event.userId}`);

    await this.analytics.track('plan_changed', event.userId, {
      from: event.fromPlan,
      to: event.toPlan,
      billing_cycle: event.billingCycle,
    });
  }
}
