import { BadRequestException, Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { SlackApiService, type TSlackChannel } from './slack-api.service.js';
import { INTEGRATION_CREDENTIALS_REPO } from '../integrations.tokens.js';
import type { IIntegrationCredentialsRepository } from '../repositories/IntegrationCredentialsRepository.js';
import { BusinessError } from '../../utils/errorManagement/errorClasses/BusinessError.js';
import { PermissionResolver } from '../../permissions/PermissionResolver.js';

export interface TSlackChannelResponse extends TSlackChannel {
  url: string;
}

@ApiTags('slack-channels')
@Controller()
export class SlackChannelsController {
  constructor(
    private readonly slackApi: SlackApiService,
    @Inject(INTEGRATION_CREDENTIALS_REPO) private readonly credentialsRepo: IIntegrationCredentialsRepository,
    private readonly permissionResolver: PermissionResolver,
  ) {}

  @ApiOperation({ summary: 'Search Slack channels' })
  @Get('channels/search')
  async searchChannels(
    @Query('companyId') companyId: TCompanyId,
    @Query('q') query: string,
    @ActorId() actorId: TUserId,
  ): Promise<TSlackChannelResponse[]> {
    await this.ensureCanManage(companyId, actorId);
    const config = await this.resolveSlackConfig(companyId);
    const channels = await this.slackApi.searchChannels(config.botToken, query ?? '');
    return channels.map(ch => ({ ...ch, url: `https://slack.com/app_redirect?channel=${ch.id}&team=${config.teamId}` }));
  }

  @ApiOperation({ summary: 'Create a Slack channel' })
  @Post('channels/create')
  async createChannel(
    @Body() body: { companyId: TCompanyId; name: string; isPrivate: boolean },
    @ActorId() actorId: TUserId,
  ): Promise<TSlackChannelResponse> {
    await this.ensureCanManage(body.companyId, actorId);
    const config = await this.resolveSlackConfig(body.companyId);
    const channel = await this.slackApi.createChannel(config.botToken, body.name, body.isPrivate);
    return { ...channel, url: `https://slack.com/app_redirect?channel=${channel.id}&team=${config.teamId}` };
  }

  private async ensureCanManage(companyId: TCompanyId, actorId: TUserId): Promise<void> {
    const canManage = await this.permissionResolver.hasCompanyPermission(actorId, companyId, 'company:orgchart:write');
    if (!canManage) throw new BusinessError('Forbidden', 'SLACK_FORBIDDEN', 403);
  }

  private async resolveSlackConfig(companyId: TCompanyId): Promise<{ botToken: string; teamId: string }> {
    const record = await this.credentialsRepo.findByCompanyAndPlatform(companyId, 'slack');
    if (!record || record.status !== 'connected') {
      throw new BadRequestException('Slack is not connected for this company');
    }
    const botToken = record.config['bot_token'];
    const teamId = record.config['team_id'];
    if (!botToken || !teamId) {
      throw new BadRequestException('Slack credentials incomplete');
    }
    return { botToken, teamId };
  }
}
