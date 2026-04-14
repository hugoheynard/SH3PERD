import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { ANALYTICS_EVENT_REPO } from '../../appBootstrap/nestTokens.js';
import type { IAnalyticsEventRepository } from '../infra/AnalyticsEventMongoRepo.js';
import type {
  TAnalyticsEventDomainModel,
  TAnalyticsEventType,
  TUserId,
} from '@sh3pherd/shared-types';

/**
 * Analytics API — admin-scoped event querying.
 *
 * Returns append-only analytics events with optional filtering
 * by type, user, and date range. Pagination via limit/offset.
 *
 * TODO: Guard with admin-only permission when admin roles exist.
 */
@ApiTags('analytics')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject(ANALYTICS_EVENT_REPO)
    private readonly eventRepo: IAnalyticsEventRepository,
  ) {}

  @ApiOperation({
    summary: 'Query analytics events',
    description:
      'Returns analytics events filtered by type, user, and date range. ' +
      'Sorted by timestamp descending (most recent first). Pagination via limit/offset.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Event type filter',
    example: 'plan_changed',
  })
  @ApiQuery({ name: 'user_id', required: false, description: 'Filter by user ID' })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (ISO 8601)',
    example: '2026-04-01',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date (ISO 8601)',
    example: '2026-04-30',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Max results (1-500, default 50)',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Skip N results (default 0)',
    example: 0,
  })
  @Get('events')
  async getEvents(
    @Query('type') type?: string,
    @Query('user_id') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{
    data: {
      events: TAnalyticsEventDomainModel[];
      total: number;
      limit: number;
      offset: number;
    };
  }> {
    const filter = {
      type: type as TAnalyticsEventType | undefined,
      user_id: userId as TUserId | undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? Math.min(Math.max(parseInt(limit, 10) || 50, 1), 500) : 50,
      offset: offset ? Math.max(parseInt(offset, 10) || 0, 0) : 0,
    };

    const [events, total] = await Promise.all([
      this.eventRepo.query(filter),
      this.eventRepo.countEvents(filter),
    ]);

    return {
      data: {
        events,
        total,
        limit: filter.limit,
        offset: filter.offset,
      },
    };
  }
}
