import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { ZodValidationPipe } from '../../utils/nest/pipes/ZodValidation.pipe.js';
import { buildApiResponseDTO } from '../../music/codes.js';
import type {
  TCompanyId,
  TCompanyInfo,
  TCompanyRecord,
  TCommunicationPlatform,
  TUserId,
  TApiResponse,
  TOrgLayers,
  TConnectIntegrationBody,
  TAddChannelBody,
} from '@sh3pherd/shared-types';
import {
  SCompanyInfo,
  SOrgLayers,
  SConnectIntegrationBody,
  SAddChannelBody,
} from '@sh3pherd/shared-types';

import { COMPANY_CODES_SUCCESS } from './company.codes.js';

import { UpdateCompanyInfoCommand } from '../application/commands/UpdateCompanyInfoCommand.js';
import { UpdateOrgLayersCommand } from '../application/commands/UpdateOrgLayersCommand.js';
import { ConnectIntegrationCommand } from '../application/commands/ConnectIntegrationCommand.js';
import { DisconnectIntegrationCommand } from '../application/commands/DisconnectIntegrationCommand.js';
import { AddChannelCommand } from '../application/commands/AddChannelCommand.js';
import { RemoveChannelCommand } from '../application/commands/RemoveChannelCommand.js';

@ApiTags('company-settings')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: 'Authentication required. Missing or invalid Bearer token.',
})
@Controller()
export class CompanySettingsController {
  constructor(private readonly commandBus: CommandBus) {}

  // ── Company Info ────────────────────────────────────────────
  //TODO : it's working, do swagger doc using my custom decorators, api-response
  @ApiOperation({ summary: 'Update company info (name, description, address)' })
  @Patch(':id/settings/info')
  async updateCompanyInfo(
    @Param('id') id: TCompanyId,
    @Body(new ZodValidationPipe(SCompanyInfo)) body: TCompanyInfo,
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TCompanyInfo>> {
    const result = await this.commandBus.execute<UpdateCompanyInfoCommand, TCompanyInfo>(
      new UpdateCompanyInfoCommand({ company_id: id, ...body }, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.UPDATE_COMPANY_INFO, result);
  };

  // ── Org Layers ──────────────────────────────────────────────
  //TODO : it's working, do swagger doc using my custom decorators, api-response
  @ApiOperation({ summary: 'Update org layer labels' })
  @Patch(':id/settings/org-layers')
  async updateOrgLayers(
    @Param('id') id: TCompanyId,
    @Body(new ZodValidationPipe(SOrgLayers)) body: TOrgLayers,
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TOrgLayers>> {
    const result = await this.commandBus.execute<UpdateOrgLayersCommand, TOrgLayers>(
      new UpdateOrgLayersCommand(id, body.orgLayers, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.UPDATE_ORG_LAYERS, result);
  }

  // ── Integrations ────────────────────────────────────────────

  @ApiOperation({ summary: 'Connect a platform integration' })
  @Post(':id/settings/integrations')
  async connectIntegration(
    @Param('id') id: TCompanyId,
    @Body(new ZodValidationPipe(SConnectIntegrationBody)) body: TConnectIntegrationBody,
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TCompanyRecord>> {
    const result = await this.commandBus.execute<ConnectIntegrationCommand, TCompanyRecord>(
      new ConnectIntegrationCommand(id, body.platform, body.config, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.CONNECT_INTEGRATION, result);
  };



  @ApiOperation({ summary: 'Disconnect a platform integration' })
  @Delete(':id/settings/integrations/:platform')
  async disconnectIntegration(
    @Param('id') id: TCompanyId,
    @Param('platform') platform: TCommunicationPlatform,
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TCompanyRecord>> {
    const result = await this.commandBus.execute<DisconnectIntegrationCommand, TCompanyRecord>(
      new DisconnectIntegrationCommand(id, platform, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.DISCONNECT_INTEGRATION, result);
  }

  // ── Channels ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Add a channel to the company' })
  @Post(':id/settings/channels')
  async addChannel(
    @Param('id') id: TCompanyId,
    @Body(new ZodValidationPipe(SAddChannelBody)) body: TAddChannelBody,
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TCompanyRecord>> {
    const result = await this.commandBus.execute<AddChannelCommand, TCompanyRecord>(
      new AddChannelCommand(id, body, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.ADD_CHANNEL, result);
  }

  @ApiOperation({ summary: 'Remove a channel from the company' })
  @Delete(':id/settings/channels/:channelId')
  async removeChannel(
    @Param('id') id: TCompanyId,
    @Param('channelId') channelId: string,
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TCompanyRecord>> {
    const result = await this.commandBus.execute<RemoveChannelCommand, TCompanyRecord>(
      new RemoveChannelCommand(id, channelId, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.REMOVE_CHANNEL, result);
  }
}
