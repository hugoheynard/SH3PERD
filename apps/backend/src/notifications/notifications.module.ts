import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateNotificationHandler } from './application/commands/CreateNotificationHandler.js';
import { MarkNotificationsReadHandler } from './application/commands/MarkNotificationsReadHandler.js';
import { ListNotificationsHandler } from './application/queries/ListNotificationsHandler.js';
import { NotificationsGateway } from './infra/NotificationsGateway.js';
import { NOTIFICATION_PUSHER } from '../appBootstrap/nestTokens.js';
import { TokenFunctionsModule } from '../auth/core/TokenFunctions.module.js';
import { NotificationController } from './api/notification.controller.js';

const CommandHandlers = [CreateNotificationHandler, MarkNotificationsReadHandler];
const QueryHandlers = [ListNotificationsHandler];

/**
 * Notifications — user-facing inbox with live push.
 *
 * Handlers depend on the `NOTIFICATION_PUSHER` port; the socket.io
 * gateway provides the concrete implementation. Keeping the port + the
 * gateway instance behind the same token lets the handlers stay
 * transport-agnostic and testable without socket machinery.
 */
@Module({
  imports: [CqrsModule, TokenFunctionsModule],
  controllers: [NotificationController],
  providers: [
    NotificationsGateway,
    { provide: NOTIFICATION_PUSHER, useExisting: NotificationsGateway },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class NotificationsModule {}
