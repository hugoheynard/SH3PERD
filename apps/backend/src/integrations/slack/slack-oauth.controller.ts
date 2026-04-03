import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { Public } from '../../utils/nest/decorators/IsPublic.js';
import { SlackOAuthService } from './slack-oauth.service.js';
import { ConnectIntegrationCommand } from '../../company/application/commands/ConnectIntegrationCommand.js';

@ApiTags('slack-oauth')
@Controller()
export class SlackOAuthController {
  private readonly frontendUrl: string;

  constructor(
    private readonly slackOAuth: SlackOAuthService,
    private readonly commandBus: CommandBus,
    private readonly config: ConfigService,
  ) {
    this.frontendUrl = this.config.get<string>('frontendUrl', 'http://localhost:4200');
  }

  /**
   * Returns the Slack OAuth authorize URL.
   * Protected — requires JWT to identify the actor.
   */
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

  /**
   * Slack redirects here after the user authorizes.
   * Public — no JWT header on the redirect from Slack.
   */
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

      await this.commandBus.execute(
        new ConnectIntegrationCommand(
          companyId,
          'slack',
          { bot_token: botToken, team_id: teamId },
          decoded.userId,
        ),
      );

      res.redirect(`${this.frontendUrl}/app/company/${companyId}/settings?tab=channels&slack=connected`);
    } catch (err) {
      console.error('[SlackOAuth] callback failed', err);
      const redirectId = companyId! ?? '';
      res.redirect(`${this.frontendUrl}/app/company/${redirectId}/settings?tab=channels&slack=error`);
    }
  }
}
