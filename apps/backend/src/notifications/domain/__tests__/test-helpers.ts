import type {
  TContractId,
  TContractNotification,
  TContractNotificationAction,
  TNotificationId,
  TSystemNotification,
  TUserId,
} from '@sh3pherd/shared-types';
import { NotificationEntity } from '../NotificationEntity.js';
import type { TEntityInput } from '../../../utils/entities/Entity.js';

export const userId = (n = 1) => `userCredential_test-${n}` as TUserId;
export const notifId = (n = 1) => `notif_test-${n}` as TNotificationId;
export const contractId = (n = 1) => `contract_test-${n}` as TContractId;

type MakeContractNotifOverrides = {
  id?: TNotificationId;
  user_id?: TUserId;
  action?: TContractNotificationAction;
  contract_id?: TContractId;
  title?: string;
  body?: string;
  read?: boolean;
  readAt?: number;
  createdAt?: number;
};

export function makeContractNotification(
  overrides: MakeContractNotifOverrides = {},
): NotificationEntity {
  const props: TEntityInput<TContractNotification> = {
    id: overrides.id ?? notifId(),
    user_id: overrides.user_id ?? userId(),
    kind: 'contract',
    action: overrides.action ?? 'received',
    contract_id: overrides.contract_id ?? contractId(),
    title: overrides.title ?? 'New contract received',
    body: overrides.body,
    read: overrides.read ?? false,
    readAt: overrides.readAt,
    createdAt: overrides.createdAt ?? 1_700_000_000_000,
  };
  return new NotificationEntity(props);
}

type MakeSystemNotifOverrides = {
  id?: TNotificationId;
  user_id?: TUserId;
  title?: string;
  body?: string;
  read?: boolean;
  readAt?: number;
  createdAt?: number;
};

export function makeSystemNotification(
  overrides: MakeSystemNotifOverrides = {},
): NotificationEntity {
  const props: TEntityInput<TSystemNotification> = {
    id: overrides.id ?? notifId(),
    user_id: overrides.user_id ?? userId(),
    kind: 'system',
    title: overrides.title ?? 'Maintenance tonight',
    body: overrides.body,
    read: overrides.read ?? false,
    readAt: overrides.readAt,
    createdAt: overrides.createdAt ?? 1_700_000_000_000,
  };
  return new NotificationEntity(props);
}
