import { Module } from '@nestjs/common';
import { CompanyController } from './api/company.controller.js';
import { CompanyHandlersModule } from './company-handlers.module.js';

@Module({
  imports: [CompanyHandlersModule],
  controllers: [CompanyController],
})
export class CompanyModule {}
