import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { QuotaService } from '../QuotaService.js';
import type { TUserId } from '@sh3pherd/shared-types';
import type { TUsageItem } from '../QuotaService.js';

/**
 * Quota API — user-scoped, no contract required.
 *
 * Returns the user's current usage across all quota-limited resources
 * so the frontend can display progress bars and warn before limits.
 */
@ApiTags('quota')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@Controller('quota')
export class QuotaController {
  constructor(private readonly quotaService: QuotaService) {}

  @ApiOperation({
    summary: 'Get my usage summary',
    description: 'Returns current usage vs. plan limits for all quota-limited resources.',
  })
  @Get('me')
  async getMyUsage(
    @ActorId() actorId: TUserId,
  ): Promise<{ data: { plan: string; usage: TUsageItem[] } }> {
    const [plan, usage] = await Promise.all([
      this.quotaService.getPlan(actorId),
      this.quotaService.getUsageSummary(actorId),
    ]);
    return { data: { plan, usage } };
  }
}
