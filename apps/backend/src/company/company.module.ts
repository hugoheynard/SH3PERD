import { Module } from '@nestjs/common';
import { CompanyController } from './api/company.controller.js';
import { CompanySettingsController } from './api/company-settings.controller.js';
import { CompanyHandlersModule } from './company-handlers.module.js';

@Module({
  imports: [CompanyHandlersModule],
  controllers: [CompanyController, CompanySettingsController],
})
export class CompanyModule {}
