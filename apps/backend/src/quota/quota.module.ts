import { Module } from '@nestjs/common';
import { QuotaService } from './QuotaService.js';
import { QuotaController } from './api/quota.controller.js';

/**
 * Quota module — provides `QuotaService` for injection into command
 * handlers, and exposes the `GET /quota/me` endpoint.
 */
@Module({
  controllers: [QuotaController],
  providers: [QuotaService],
  exports: [QuotaService],
})
export class QuotaModule {}
