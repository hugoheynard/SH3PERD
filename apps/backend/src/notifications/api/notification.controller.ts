import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type {
  TApiResponse,
  TListNotificationsResult,
  TMarkNotificationsReadPayload,
  TUserId,
} from '@sh3pherd/shared-types';
import { SMarkNotificationsReadPayload } from '@sh3pherd/shared-types';

import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { PlatformScoped } from '../../utils/nest/decorators/PlatformScoped.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';

import { NotificationApiCodes, buildNotificationApiResponse } from '../codes.js';
import {
  ListNotificationsPayload,
  MarkAllNotificationsReadResponsePayload,
  MarkNotificationsReadResponsePayload,
} from '../dto/notification.dto.js';
import { ListNotificationsQuery } from '../application/queries/ListNotificationsHandler.js';
import {
  MarkNotificationsReadCommand,
  type TMarkNotificationsReadResult,
} from '../application/commands/MarkNotificationsReadHandler.js';

/**
 * Notifications inbox — every authenticated user reads and manages
 * their own notifications, so endpoints are platform-scoped (actor =
 * recipient) and no permission layer is applied: "can I see my own
 * notifications" is answered by the AuthGuard, not by an RBAC check.
 *
 * Live updates flow over the `notifications` socket.io namespace (see
 * `NotificationsGateway`). The REST surface is the cold-start + explicit
 * mutation path.
 */
@ApiTags('notifications')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: 'Authentication required. Missing or invalid Bearer token.',
})
@PlatformScoped()
@Controller()
export class NotificationController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly qryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'List my notifications',
    description:
      'Keyset pagination on createdAt desc. Pass `before` (ms epoch) + `limit` to page; ' +
      'the response `nextBefore` is the cursor for the next page. `unreadOnly=true` ' +
      'filters the page without affecting the returned global `unreadCount`.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 30 })
  @ApiQuery({ name: 'before', required: false, type: Number, example: 1776000000000 })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean, example: false })
  @ApiResponse(
    apiSuccessDTO(NotificationApiCodes.NOTIFICATIONS_FETCHED, ListNotificationsPayload, 200),
  )
  @Get('me')
  async listMyNotifications(
    @ActorId() actorId: TUserId,
    @Query('limit') limitRaw?: string,
    @Query('before') beforeRaw?: string,
    @Query('unreadOnly') unreadOnlyRaw?: string,
  ): Promise<TApiResponse<TListNotificationsResult>> {
    const result = await this.qryBus.execute<ListNotificationsQuery, TListNotificationsResult>(
      new ListNotificationsQuery(actorId, {
        limit: parsePositiveInt(limitRaw),
        before: parsePositiveInt(beforeRaw),
        unreadOnly: parseBool(unreadOnlyRaw),
      }),
    );
    return buildNotificationApiResponse(NotificationApiCodes.NOTIFICATIONS_FETCHED, result);
  }

  @ApiOperation({
    summary: 'Mark notifications as read',
    description:
      'Only ids belonging to the actor that are currently unread will transition. ' +
      'The response lists exactly the ids that flipped — already-read or foreign ids ' +
      'are silently filtered.',
  })
  @ApiResponse(
    apiSuccessDTO(
      NotificationApiCodes.NOTIFICATIONS_MARKED_READ,
      MarkNotificationsReadResponsePayload,
      200,
    ),
  )
  @Post('read')
  async markRead(
    @ActorId() actorId: TUserId,
    @Body('payload', new ZodValidationPipe(SMarkNotificationsReadPayload))
    payload: TMarkNotificationsReadPayload,
  ): Promise<TApiResponse<TMarkNotificationsReadResult>> {
    const result = await this.cmdBus.execute<
      MarkNotificationsReadCommand,
      TMarkNotificationsReadResult
    >(new MarkNotificationsReadCommand(actorId, payload.ids));
    return buildNotificationApiResponse(NotificationApiCodes.NOTIFICATIONS_MARKED_READ, result);
  }

  @ApiOperation({
    summary: 'Mark every unread notification as read',
    description:
      'Flips every unread notification for the actor. Returns only `readAt` — the client ' +
      'applies the change to its whole local collection. No-ops silently when the inbox is ' +
      'already fully read.',
  })
  @ApiResponse(
    apiSuccessDTO(
      NotificationApiCodes.NOTIFICATIONS_MARKED_ALL_READ,
      MarkAllNotificationsReadResponsePayload,
      200,
    ),
  )
  @Post('read-all')
  async markAllRead(@ActorId() actorId: TUserId): Promise<TApiResponse<{ readAt: number }>> {
    const result = await this.cmdBus.execute<
      MarkNotificationsReadCommand,
      TMarkNotificationsReadResult
    >(new MarkNotificationsReadCommand(actorId, 'all'));
    return buildNotificationApiResponse(NotificationApiCodes.NOTIFICATIONS_MARKED_ALL_READ, {
      readAt: result.readAt,
    });
  }
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
}

function parseBool(value: string | undefined): boolean | undefined {
  if (value === undefined || value === '') return undefined;
  return value === 'true' || value === '1';
}
