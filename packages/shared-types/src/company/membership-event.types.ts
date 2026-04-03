import { z } from 'zod';
import type { ZodOutput } from '../utils/zod.types.js';
import type { TRecordMetadata } from '../metadata.types.js';
import {
  SUserId,                 type TUserId,
  SOrgNodeId,              type TOrgNodeId,
  SOrgMembershipEventId,   type TOrgMembershipEventId,
} from '../ids.js';


// ─── Org Membership Event Type ─────────────────────────────

/**
 * The action recorded in an org membership event.
 * - `member_added`   — a user joined the node
 * - `member_removed` — a user left or was removed
 */
export type TOrgMembershipEventType = 'member_added' | 'member_removed';
export const SOrgMembershipEventType: ZodOutput<TOrgMembershipEventType> =
  z.enum(['member_added', 'member_removed']);


// ─── Org Membership Event ──────────────────────────────────

/**
 * Immutable audit event recording a membership change within an org node.
 * Used to reconstruct the full history of who was in a node and when.
 */
export interface TOrgMembershipEvent {
  id: TOrgMembershipEventId;
  /** The org node affected */
  org_node_id: TOrgNodeId;
  /** The user whose membership changed */
  user_id: TUserId;
  type: TOrgMembershipEventType;
  /** When the event occurred */
  date: Date;
  /** The user who performed the action */
  by: TUserId;
  /** Optional human-readable reason — e.g. "end of season" */
  reason?: string;
}
export const SOrgMembershipEvent: ZodOutput<TOrgMembershipEvent> = z.object({
  id:          SOrgMembershipEventId,
  org_node_id: SOrgNodeId,
  user_id:     SUserId,
  type:        SOrgMembershipEventType,
  date:        z.coerce.date(),
  by:          SUserId,
  reason:      z.string().optional(),
});

/** MongoDB record — event extended with audit metadata */
export type TOrgMembershipEventRecord = TOrgMembershipEvent & TRecordMetadata;
