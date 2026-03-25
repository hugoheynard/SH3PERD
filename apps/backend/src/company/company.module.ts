import { Module } from '@nestjs/common';
import { CompanyController } from './api/company.controller.js';
import { CompanyUseCasesModule } from './useCase/company-use-cases.module.js';

@Module({
  imports: [CompanyUseCasesModule],
  controllers: [CompanyController],
})
export class CompanyModule {}
