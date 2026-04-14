import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AnalyticsEventService } from './AnalyticsEventService.js';
import { AnalyticsController } from './api/analytics.controller.js';
import { PlanChangedHandler } from './application/events/PlanChangedHandler.js';

const EventHandlers = [PlanChangedHandler];

/**
 * Analytics module — append-only event store for audit & dashboards.
 *
 * Provides:
 * - `AnalyticsEventService` — injectable `track()` helper for recording events
 * - `PlanChangedHandler` — reacts to `PlanChangedEvent` from EventBus
 * - `GET /analytics/events` — query endpoint for admin dashboards
 *
 * The `ANALYTICS_EVENT_REPO` is provided globally by `CoreRepositoriesModule`.
 */
@Module({
  imports: [CqrsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsEventService, ...EventHandlers],
  exports: [AnalyticsEventService],
})
export class AnalyticsModule {}
