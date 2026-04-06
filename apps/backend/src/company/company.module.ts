import { Module } from '@nestjs/common';
import { CompanyController } from './api/company.controller.js';
import { OrgNodeController } from './api/orgnode.controller.js';
import { CompanyInfoSettingsController } from './api/settings/company-info-settings.controller.js';
import { OrgLayersSettingsController } from './api/settings/org-layers-settings.controller.js';
import { CompanyHandlersModule } from './company-handlers.module.js';

@Module({
  imports: [CompanyHandlersModule],
  controllers: [
    CompanyController,
    OrgNodeController,
    CompanyInfoSettingsController,
    OrgLayersSettingsController,
  ],
})
export class CompanyModule {}
