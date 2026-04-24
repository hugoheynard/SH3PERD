import { ApiProperty } from '@nestjs/swagger';
import { ApiModel } from '../../utils/swagger/api-model.swagger.util.js';
import { CONTRACT_NOTIFICATION_ACTIONS, NOTIFICATION_KINDS } from '@sh3pherd/shared-types';

/**
 * Swagger envelope for a single notification. The discriminant `kind`
 * drives which of the optional fields is populated:
 *   - `kind: "contract"` → `action` + `contract_id` are set
 *   - `kind: "system"`   → both are absent
 * Kept flat (not a discriminated union in the OpenAPI schema) so the
 * generated client stays one shape — the TS side already narrows via
 * the shared-types discriminated union.
 */
@ApiModel()
export class NotificationPayload {
  @ApiProperty({ example: 'notif_abc-123' }) id!: string;
  @ApiProperty({ example: 'userCredential_abc-123' }) user_id!: string;
  @ApiProperty({ enum: NOTIFICATION_KINDS, example: 'contract' })
  kind!: (typeof NOTIFICATION_KINDS)[number];
  @ApiProperty({ example: 'Contract signed' }) title!: string;
  @ApiProperty({ required: false, example: 'The venue has countersigned your contract.' })
  body?: string;
  @ApiProperty({ example: false }) read!: boolean;
  @ApiProperty({ example: 1776000000000 }) createdAt!: number;
  @ApiProperty({ required: false, example: 1776100000000 }) readAt?: number;
  @ApiProperty({
    required: false,
    enum: CONTRACT_NOTIFICATION_ACTIONS,
    description: 'Present only when kind === "contract"',
  })
  action?: (typeof CONTRACT_NOTIFICATION_ACTIONS)[number];
  @ApiProperty({
    required: false,
    example: 'contract_abc-123',
    description: 'Present only when kind === "contract"',
  })
  contract_id?: string;
}

@ApiModel()
export class ListNotificationsPayload {
  @ApiProperty({ type: () => [NotificationPayload] }) items!: NotificationPayload[];
  @ApiProperty({ example: 7 }) unreadCount!: number;
  @ApiProperty({
    required: false,
    example: 1775999999999,
    description:
      'Keyset cursor for the next page (pass as `before`). Absent when the list is exhausted.',
  })
  nextBefore?: number;
}

@ApiModel()
export class MarkNotificationsReadResponsePayload {
  @ApiProperty({ type: [String], example: ['notif_abc-123'] })
  transitionedIds!: string[];
  @ApiProperty({ example: 1776100000000 }) readAt!: number;
}

@ApiModel()
export class MarkAllNotificationsReadResponsePayload {
  @ApiProperty({ example: 1776100000000 }) readAt!: number;
}
