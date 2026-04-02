import { Module } from '@nestjs/common';
import { ContractController } from './api/contract.controller.js';
import { ContractHandlersModule } from './contract-handlers.module.js';

@Module({
  imports: [ContractHandlersModule],
  controllers: [ContractController],
})
export class ContractModule {}
