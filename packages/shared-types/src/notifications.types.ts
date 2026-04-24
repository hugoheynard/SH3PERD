import { z } from "zod";
import {
  SContractId,
  SNotificationId,
  SUserId,
  type TContractId,
  type TNotificationId,
  type TUserId,
} from "./ids.js";

// ─── Kind discriminant ────────────────────────────────────
// `contract` covers every contract-related user-facing event (received,
// signed, expired, …). `system` is the catch-all for platform-wide
// announcements or maintenance messages. Sub-typing lives in the payload
// (`contract.action`) so we can add cases without changing the kind set.

export const NOTIFICATION_KINDS = ["contract", "system"] as const;
export type TNotificationKind = (typeof NOTIFICATION_KINDS)[number];
export const SNotificationKind = z.enum(NOTIFICATION_KINDS);

export const CONTRACT_NOTIFICATION_ACTIONS = [
  "received",
  "signed",
  "declined",
  "expired",
] as const;
export type TContractNotificationAction =
  (typeof CONTRACT_NOTIFICATION_ACTIONS)[number];
export const SContractNotificationAction = z.enum(
  CONTRACT_NOTIFICATION_ACTIONS,
);

// ─── Domain model ─────────────────────────────────────────

interface TNotificationBase {
  id: TNotificationId;
  user_id: TUserId;
  title: string;
  body?: string;
  read: boolean;
  createdAt: number;
  readAt?: number;
}

export interface TContractNotification extends TNotificationBase {
  kind: "contract";
  action: TContractNotificationAction;
  contract_id: TContractId;
}

export interface TSystemNotification extends TNotificationBase {
  kind: "system";
}

export type TNotificationDomainModel =
  | TContractNotification
  | TSystemNotification;

const baseNotificationShape = {
  id: SNotificationId,
  user_id: SUserId,
  title: z.string().min(1),
  body: z.string().optional(),
  read: z.boolean(),
  createdAt: z.number(),
  readAt: z.number().optional(),
};

export const SContractNotification = z.object({
  ...baseNotificationShape,
  kind: z.literal("contract"),
  action: SContractNotificationAction,
  contract_id: SContractId,
});

export const SSystemNotification = z.object({
  ...baseNotificationShape,
  kind: z.literal("system"),
});

export const SNotificationDomainModel = z.discriminatedUnion("kind", [
  SContractNotification,
  SSystemNotification,
]);

// ─── Create payloads (internal — dispatched by domain event handlers) ──

export interface TCreateContractNotificationPayload {
  user_id: TUserId;
  kind: "contract";
  action: TContractNotificationAction;
  contract_id: TContractId;
  title: string;
  body?: string;
}

export interface TCreateSystemNotificationPayload {
  user_id: TUserId;
  kind: "system";
  title: string;
  body?: string;
}

export type TCreateNotificationPayload =
  | TCreateContractNotificationPayload
  | TCreateSystemNotificationPayload;

export const SCreateContractNotificationPayload = z.object({
  user_id: SUserId,
  kind: z.literal("contract"),
  action: SContractNotificationAction,
  contract_id: SContractId,
  title: z.string().min(1),
  body: z.string().optional(),
});

export const SCreateSystemNotificationPayload = z.object({
  user_id: SUserId,
  kind: z.literal("system"),
  title: z.string().min(1),
  body: z.string().optional(),
});

export const SCreateNotificationPayload = z.discriminatedUnion("kind", [
  SCreateContractNotificationPayload,
  SCreateSystemNotificationPayload,
]);

// ─── List query ───────────────────────────────────────────
// Simple keyset pagination: return the N most recent notifications with
// `createdAt < before` when provided. Keeps the client-side merge with
// the socket stream trivial (prepend new events, append on scroll).

export interface TListNotificationsQuery {
  limit?: number;
  before?: number;
  unreadOnly?: boolean;
}

export const SListNotificationsQuery = z.object({
  limit: z.number().int().positive().max(100).optional(),
  before: z.number().int().positive().optional(),
  unreadOnly: z.boolean().optional(),
});

export interface TListNotificationsResult {
  items: TNotificationDomainModel[];
  unreadCount: number;
  nextBefore?: number;
}

export const SListNotificationsResult = z.object({
  items: z.array(SNotificationDomainModel),
  unreadCount: z.number().int().nonnegative(),
  nextBefore: z.number().int().positive().optional(),
});

// ─── Socket events ────────────────────────────────────────
// Event names are stable strings — keep them in one place so front + back
// reference the same constant and a rename is a compile error.

export const NOTIFICATION_SOCKET_EVENTS = {
  /** Server → client: a new notification was created for this user. */
  created: "notification:created",
  /** Server → client: one or more notifications were marked read. */
  read: "notification:read",
} as const;

export interface TNotificationReadEvent {
  ids: TNotificationId[];
  readAt: number;
}

export const SNotificationReadEvent = z.object({
  ids: z.array(SNotificationId).min(1),
  readAt: z.number(),
});
