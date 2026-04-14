import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CREDIT_PURCHASE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { ICreditPurchaseRepository } from '../../infra/CreditPurchaseMongoRepo.js';
import type { TUserId, TCreditPurchaseDomainModel } from '@sh3pherd/shared-types';
import { getCreditPack } from '@sh3pherd/shared-types';
import { computePeriodKey } from '../../domain/QuotaLimits.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

// ── Command ────────────────────────────────────────────────

export class PurchaseCreditPackCommand {
  constructor(
    public readonly userId: TUserId,
    public readonly packId: string,
    public readonly stripePaymentId?: string,
  ) {}
}

// ── Handler ────────────────────────────────────────────────

@CommandHandler(PurchaseCreditPackCommand)
export class PurchaseCreditPackHandler implements ICommandHandler<PurchaseCreditPackCommand> {
  private readonly logger = new Logger(PurchaseCreditPackHandler.name);

  constructor(
    @Inject(CREDIT_PURCHASE_REPO)
    private readonly creditRepo: ICreditPurchaseRepository,
  ) {}

  async execute(cmd: PurchaseCreditPackCommand): Promise<TCreditPurchaseDomainModel> {
    const pack = getCreditPack(cmd.packId);

    if (!pack) {
      throw new BusinessError(`Pack "${cmd.packId}" does not exist`, {
        code: 'CREDIT_PACK_NOT_FOUND',
        status: 404,
      });
    }

    // Compute the period key for this purchase
    const periodKey = pack.period === 'one_time' ? 'permanent' : computePeriodKey('monthly');

    const purchase: TCreditPurchaseDomainModel = {
      id: `creditPurchase_${crypto.randomUUID()}`,
      user_id: cmd.userId,
      resource: pack.resource,
      amount: pack.amount,
      remaining: pack.amount,
      period: pack.period,
      period_key: periodKey,
      purchased_at: new Date(),
      stripe_payment_id: cmd.stripePaymentId,
    };

    await this.creditRepo.save(purchase);

    this.logger.log(
      `[CreditPurchase] ${pack.label} (${pack.amount} ${pack.resource}) — user=${cmd.userId}`,
    );

    // TODO: Emit CreditPurchasedEvent when analytics handler is ready
    // this.eventBus.publish(new CreditPurchasedEvent(cmd.userId, pack));

    return purchase;
  }
}
