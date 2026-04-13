import { Module } from '@nestjs/common';
import { PermissionsModule } from '../permissions/permissions.module.js';
import { SlackOAuthController } from './slack/slack-oauth.controller.js';
import { SlackChannelsController } from './slack/slack-channels.controller.js';
import { IntegrationSettingsController } from './api/integration-settings.controller.js';
import { SlackOAuthService } from './slack/slack-oauth.service.js';
import { SlackApiService } from './slack/slack-api.service.js';

@Module({
  imports: [PermissionsModule],
  controllers: [SlackOAuthController, SlackChannelsController, IntegrationSettingsController],
  providers: [SlackOAuthService, SlackApiService],
})
export class IntegrationsModule {}
