import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateNotificationHandler } from './application/commands/CreateNotificationHandler.js';
import { MarkNotificationsReadHandler } from './application/commands/MarkNotificationsReadHandler.js';
import { ListNotificationsHandler } from './application/queries/ListNotificationsHandler.js';

const CommandHandlers = [CreateNotificationHandler, MarkNotificationsReadHandler];
const QueryHandlers = [ListNotificationsHandler];

/**
 * Notifications — user-facing inbox with live push.
 *
 * Exposes CQRS handlers so other modules can dispatch
 * `CreateNotificationCommand` from their own domain event handlers
 * without importing internal classes. The REST controller + socket
 * gateway land in follow-up commits.
 */
@Module({
  imports: [CqrsModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class NotificationsModule {}
