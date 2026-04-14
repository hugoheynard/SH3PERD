import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { QuotaService, type TUsageItem } from '../QuotaService.js';
import type { TUserId, TCreditPack, TCreditPurchaseDomainModel } from '@sh3pherd/shared-types';
import { CREDIT_PACKS } from '@sh3pherd/shared-types';
import { PurchaseCreditPackCommand } from '../application/commands/PurchaseCreditPackCommand.js';

/**
 * Quota API — user-scoped, no contract required.
 *
 * Provides:
 * - Usage summary (current vs. limits + bonus credits)
 * - Credit pack catalogue (available packs for purchase)
 * - Credit pack purchase (mock Stripe for now)
 */
@ApiTags('quota')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@Controller('quota')
export class QuotaController {
  constructor(
    private readonly quotaService: QuotaService,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiOperation({
    summary: 'Get my usage summary',
    description:
      'Returns current usage vs. plan limits for all quota-limited resources. ' +
      'Includes bonus credits from purchased packs and effective limits.',
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

  @ApiOperation({
    summary: 'List available credit packs',
    description:
      'Returns all credit packs that can be purchased. ' +
      'Frontend can filter by resource to show relevant packs.',
  })
  @Get('packs')
  getPacks(): { data: { packs: TCreditPack[] } } {
    return { data: { packs: CREDIT_PACKS } };
  }

  @ApiOperation({
    summary: 'Purchase a credit pack',
    description:
      'Creates a credit purchase record. Currently mocks payment — ' +
      'Stripe integration will be added in Phase 3. ' +
      'Returns the created purchase with remaining credits.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['pack_id'],
      properties: {
        pack_id: { type: 'string', example: 'pack_ai_10' },
        stripe_payment_id: { type: 'string', example: 'pi_xxx', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Credit pack purchased successfully.' })
  @ApiResponse({ status: 404, description: 'Pack not found.' })
  @Post('purchase')
  async purchasePack(
    @ActorId() actorId: TUserId,
    @Body() body: { pack_id: string; stripe_payment_id?: string },
  ): Promise<{ data: TCreditPurchaseDomainModel }> {
    const purchase = await this.commandBus.execute<
      PurchaseCreditPackCommand,
      TCreditPurchaseDomainModel
    >(new PurchaseCreditPackCommand(actorId, body.pack_id, body.stripe_payment_id));

    return { data: purchase };
  }
}
