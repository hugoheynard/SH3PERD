import { Module } from '@nestjs/common';
import { ContractController } from './api/contract.controller.js';
import { MyContractsController } from './api/my-contracts.controller.js';
import { ContractHandlersModule } from './contract-handlers.module.js';
import { ContractStorageModule } from './infra/ContractStorageModule.js';

@Module({
  imports: [ContractHandlersModule, ContractStorageModule],
  controllers: [MyContractsController, ContractController],
})
export class ContractModule {}
