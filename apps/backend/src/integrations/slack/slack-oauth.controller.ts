import { BadRequestException, Controller, Get, Inject, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { Public } from '../../utils/nest/decorators/IsPublic.js';
import { SlackOAuthService } from './slack-oauth.service.js';
import { INTEGRATION_CREDENTIALS_REPO } from '../integrations.tokens.js';
import type { IIntegrationCredentialsRepository } from '../repositories/IntegrationCredentialsRepository.js';
import { IntegrationCredentialsEntity } from '../domain/IntegrationCredentialsEntity.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';

@ApiTags('slack-oauth')
@Controller()
export class SlackOAuthController {
  private readonly frontendUrl: string;

  constructor(
    private readonly slackOAuth: SlackOAuthService,
    @Inject(INTEGRATION_CREDENTIALS_REPO) private readonly credentialsRepo: IIntegrationCredentialsRepository,
    private readonly config: ConfigService,
  ) {
    this.frontendUrl = this.config.get<string>('frontendUrl', 'http://localhost:4200');
  }

  @ApiOperation({ summary: 'Get Slack OAuth authorize URL' })
  @Get('authorize')
  authorize(
    @Query('companyId') companyId: TCompanyId,
    @ActorId() actorId: TUserId,
  ): { url: string } {
    if (!this.slackOAuth.isConfigured) {
      throw new BadRequestException('Slack integration is not configured');
    }
    const url = this.slackOAuth.buildAuthorizeUrl(companyId, actorId);
    return { url };
  }

  @Public()
  @ApiOperation({ summary: 'Slack OAuth callback' })
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ): Promise<void> {
    let companyId: TCompanyId;

    try {
      const decoded = this.slackOAuth.verifyState(state);
      companyId = decoded.companyId;

      const { botToken, teamId } = await this.slackOAuth.exchangeCode(code);

      // Upsert: find existing or create new credentials for this company + slack
      let record = await this.credentialsRepo.findByCompanyAndPlatform(companyId, 'slack');

      if (record) {
        // Update existing
        const entity = new IntegrationCredentialsEntity(RecordMetadataUtils.stripDocMetadata(record));
        entity.connect({ bot_token: botToken, team_id: teamId });
        const diff = entity.getDiffProps();
        if (Object.keys(diff).length > 0) {
          await this.credentialsRepo.updateOne({
            filter: { id: record.id } as any,
            update: { $set: { ...diff, ...RecordMetadataUtils.update() } } as any,
          });
        }
      } else {
        // Create new
        const entity = new IntegrationCredentialsEntity({
          company_id: companyId,
          platform: 'slack',
          status: 'connected',
          config: { bot_token: botToken, team_id: teamId },
          channels: [],
          connectedAt: new Date(),
        });
        await this.credentialsRepo.save({
          ...entity.toDomain,
          ...RecordMetadataUtils.create(decoded.userId),
        });
      }

      res.redirect(`${this.frontendUrl}/app/company/${companyId}/settings?tab=channels&slack=connected`);
    } catch (err) {
      console.error('[SlackOAuth] callback failed', err);
      const redirectId = companyId! ?? '';
      res.redirect(`${this.frontendUrl}/app/company/${redirectId}/settings?tab=channels&slack=error`);
    }
  }
}
