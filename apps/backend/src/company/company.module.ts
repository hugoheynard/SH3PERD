import { Module } from '@nestjs/common';
import { CompanyController } from './api/company.controller.js';
import { OrgNodeCrudController } from './api/orgnode.controller.js';
import { OrgNodeMembersController } from './api/orgnode-members.controller.js';
import { OrgChartViewsController } from './api/orgchart-views.controller.js';
import { DeleteCompanyController } from './api/delete-company.controller.js';
import { CompanyInfoSettingsController } from './api/settings/company-info-settings.controller.js';
import { OrgLayersSettingsController } from './api/settings/org-layers-settings.controller.js';
import { CompanyHandlersModule } from './company-handlers.module.js';

@Module({
  imports: [CompanyHandlersModule],
  controllers: [
    CompanyController,
    OrgNodeCrudController,
    OrgNodeMembersController,
    OrgChartViewsController,
    DeleteCompanyController,
    CompanyInfoSettingsController,
    OrgLayersSettingsController,
  ],
})
export class CompanyModule {}
