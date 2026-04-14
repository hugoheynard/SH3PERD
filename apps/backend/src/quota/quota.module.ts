import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { QuotaService } from './QuotaService.js';
import { QuotaController } from './api/quota.controller.js';
import { PurchaseCreditPackHandler } from './application/commands/PurchaseCreditPackCommand.js';

const CommandHandlers = [PurchaseCreditPackHandler];

/**
 * Quota module — provides `QuotaService` for injection into command
 * handlers, and exposes quota/credit pack endpoints.
 *
 * Endpoints:
 * - `GET /quota/me` — usage summary (current, limit, bonus, effective_limit)
 * - `GET /quota/packs` — credit pack catalogue
 * - `POST /quota/purchase` — buy a credit pack
 */
@Module({
  imports: [CqrsModule],
  controllers: [QuotaController],
  providers: [QuotaService, ...CommandHandlers],
  exports: [QuotaService],
})
export class QuotaModule {}
