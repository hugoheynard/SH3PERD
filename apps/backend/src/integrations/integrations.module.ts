import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CompanyHandlersModule } from '../company/company-handlers.module.js';
import { SlackOAuthController } from './slack/slack-oauth.controller.js';
import { SlackOAuthService } from './slack/slack-oauth.service.js';

@Module({
  imports: [CqrsModule, CompanyHandlersModule],
  controllers: [SlackOAuthController],
  providers: [SlackOAuthService],
})
export class IntegrationsModule {}
