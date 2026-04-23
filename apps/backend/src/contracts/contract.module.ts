import { Module } from '@nestjs/common';
import { ContractController } from './api/contract.controller.js';
import { MyContractsController } from './api/my-contracts.controller.js';
import { ContractHandlersModule } from './contract-handlers.module.js';

@Module({
  imports: [ContractHandlersModule],
  controllers: [MyContractsController, ContractController],
})
export class ContractModule {}
