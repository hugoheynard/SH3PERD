import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket as IoSocket } from 'socket.io';

type SocketData = { user_id?: TUserId };
type Socket = IoSocket<
  Record<string, unknown>,
  Record<string, unknown>,
  Record<string, unknown>,
  SocketData
>;
import type { TNotificationDomainModel, TNotificationId, TUserId } from '@sh3pherd/shared-types';
import { NOTIFICATION_SOCKET_EVENTS } from '@sh3pherd/shared-types';
import { VERIFY_AUTH_TOKEN_FN } from '../../appBootstrap/nestTokens.js';
import type { TVerifyAuthTokenFn } from '../../auth/types/auth.core.contracts.js';
import type { INotificationPusher } from './NotificationPusher.js';

/**
 * Live-push channel for the notifications inbox.
 *
 * Transport: socket.io (built-in reconnect, heartbeat, polling fallback
 * when WebSocket is blocked). Each connected client joins a single
 * room keyed by its `user_id` — every push is `server.to(room).emit(...)`,
 * never a global broadcast.
 *
 * Auth: JWT verified at handshake. The token can be passed as:
 *   - `handshake.auth.token` (socket.io-client idiomatic)
 *   - `Authorization: Bearer <token>` header (HTTP-upgrade compatible)
 * An invalid / missing token closes the connection before any event is
 * accepted. No post-handshake re-auth: if the token expires during the
 * session, the client must reconnect.
 *
 * Scaling note: single-instance only. Going multi-instance requires
 * plugging in `@socket.io/redis-adapter` so broadcasts fan out across
 * nodes — we add it when we actually scale out.
 */
@Injectable()
@WebSocketGateway({
  namespace: 'notifications',
  cors: { origin: true, credentials: true },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, INotificationPusher
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  private server!: Server;

  constructor(
    @Inject(VERIFY_AUTH_TOKEN_FN)
    private readonly verifyAuthTokenFn: TVerifyAuthTokenFn,
  ) {}

  async handleConnection(socket: Socket): Promise<void> {
    const token = extractToken(socket);
    if (!token) {
      this.logger.warn(`Rejected socket ${socket.id}: missing auth token`);
      socket.disconnect(true);
      return;
    }
    const payload = await this.verifyAuthTokenFn({ authToken: token });
    if (!payload) {
      this.logger.warn(`Rejected socket ${socket.id}: invalid auth token`);
      socket.disconnect(true);
      return;
    }
    // Stash the user_id on the socket's data bag so the room name can
    // be recomputed on disconnect if we ever need per-socket bookkeeping.
    socket.data.user_id = payload.user_id;
    await socket.join(roomFor(payload.user_id));
  }

  handleDisconnect(socket: Socket): void {
    // socket.io removes the socket from its rooms automatically; no-op
    // here unless we add per-user connection counters later.
    this.logger.debug(`Socket ${socket.id} disconnected`);
  }

  pushCreated(userId: TUserId, notification: TNotificationDomainModel): void {
    this.server.to(roomFor(userId)).emit(NOTIFICATION_SOCKET_EVENTS.created, notification);
  }

  pushRead(userId: TUserId, ids: TNotificationId[], readAt: number): void {
    if (ids.length === 0) return;
    this.server.to(roomFor(userId)).emit(NOTIFICATION_SOCKET_EVENTS.read, { ids, readAt });
  }

  pushReadAll(userId: TUserId, readAt: number): void {
    // The client interprets a read event with an empty id list as
    // "everything is read now" — one code path handles both shapes.
    this.server.to(roomFor(userId)).emit(NOTIFICATION_SOCKET_EVENTS.read, { ids: [], readAt });
  }
}

function roomFor(userId: TUserId): string {
  return `user:${userId}`;
}

function extractToken(socket: Socket): string | null {
  const authBag = socket.handshake.auth as { token?: unknown } | undefined;
  const fromAuth = authBag && typeof authBag.token === 'string' ? authBag.token : null;
  if (fromAuth) return fromAuth;
  const header = socket.handshake.headers['authorization'];
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }
  return null;
}
