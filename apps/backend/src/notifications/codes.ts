import type { TApiMessage, TApiResponse } from '@sh3pherd/shared-types';

export const NotificationApiCodes = {
  NOTIFICATIONS_FETCHED: {
    code: 'NOTIFICATIONS_FETCHED',
    message: 'Notifications fetched successfully',
  },
  NOTIFICATIONS_MARKED_READ: {
    code: 'NOTIFICATIONS_MARKED_READ',
    message: 'Notifications marked as read',
  },
  NOTIFICATIONS_MARKED_ALL_READ: {
    code: 'NOTIFICATIONS_MARKED_ALL_READ',
    message: 'All notifications marked as read',
  },
} as const satisfies Record<string, TApiMessage>;

export function buildNotificationApiResponse<T>(entry: TApiMessage, data: T): TApiResponse<T> {
  return { code: entry.code, message: entry.message, data };
}
