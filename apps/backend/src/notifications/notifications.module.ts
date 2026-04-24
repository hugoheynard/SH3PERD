import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

/**
 * Notifications — user-facing inbox with live push (socket.io gateway).
 *
 * Wiring is intentionally minimal for this first commit: the module
 * exists so the backend app module can import it. Handlers, gateway and
 * controller are wired in follow-up commits.
 */
@Module({
  imports: [CqrsModule],
  providers: [],
  exports: [],
})
export class NotificationsModule {}
