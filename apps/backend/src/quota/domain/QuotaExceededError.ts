import { HttpException, HttpStatus } from '@nestjs/common';
import type { TQuotaResource } from './QuotaLimits.js';
import type { TPlatformRole } from '@sh3pherd/shared-types';

/**
 * HTTP 402 Payment Required — thrown when a user exceeds their plan's
 * quota for a given resource.
 *
 * The frontend intercepts 402 globally to show an upgrade modal. The
 * response body includes all the data needed to render a clear message:
 *
 * ```json
 * {
 *   "statusCode": 402,
 *   "errorCode": "QUOTA_EXCEEDED",
 *   "message": "Quota exceeded for master_standard: 3/3",
 *   "resource": "master_standard",
 *   "current": 3,
 *   "limit": 3,
 *   "plan": "plan_free"
 * }
 * ```
 */
export class QuotaExceededError extends HttpException {
  constructor(resource: TQuotaResource, current: number, limit: number, plan: TPlatformRole) {
    super(
      {
        statusCode: 402,
        errorCode: 'QUOTA_EXCEEDED',
        message:
          limit === 0
            ? `Feature "${resource}" is not available on your plan (${plan})`
            : `Quota exceeded for ${resource}: ${current}/${limit} (plan: ${plan})`,
        resource,
        current,
        limit,
        plan,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
