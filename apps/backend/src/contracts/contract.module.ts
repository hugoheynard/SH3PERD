import { Module } from '@nestjs/common';
import { ContractController } from './api/contract.controller.js';
import { ContractsUseCasesModule } from './useCase/contracts-use-cases.module.js';

@Module({
  imports: [ContractsUseCasesModule],
  providers: [],
  controllers: [ContractController],
  exports: [],
})
export class ContractModule {}
