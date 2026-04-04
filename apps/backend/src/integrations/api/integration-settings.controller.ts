import { Body, Controller, Delete, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { TCompanyId, TCommunicationPlatform, TUserId, TIntegrationViewModel } from '@sh3pherd/shared-types';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { INTEGRATION_CREDENTIALS_REPO } from '../integrations.tokens.js';
import type { IIntegrationCredentialsRepository } from '../repositories/IntegrationCredentialsRepository.js';
import { IntegrationCredentialsEntity } from '../domain/IntegrationCredentialsEntity.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../utils/errorManagement/errorClasses/BusinessError.js';
import { PermissionResolver } from '../../permissions/PermissionResolver.js';

@ApiTags('integration-settings')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@Controller()
export class IntegrationSettingsController {
  constructor(
    @Inject(INTEGRATION_CREDENTIALS_REPO) private readonly credentialsRepo: IIntegrationCredentialsRepository,
    private readonly permissionResolver: PermissionResolver,
  ) {}

  /** List all integrations for a company (hides sensitive config). */
  @ApiOperation({ summary: 'Get integrations for a company' })
  @Get()
  async getIntegrations(
    @Query('companyId') companyId: TCompanyId,
    @ActorId() actorId: TUserId,
  ): Promise<TIntegrationViewModel[]> {
    await this.ensureCanManage(companyId, actorId);
    const records = await this.credentialsRepo.findByCompany(companyId);
    return records.map(r => ({
      id: r.id,
      platform: r.platform,
      status: r.status,
      channels: r.channels,
      connectedAt: r.connectedAt,
    }));
  }

  /** Disconnect a platform integration. Preserves channels for potential reconnection. */
  @ApiOperation({ summary: 'Disconnect a platform integration' })
  @Delete(':platform')
  async disconnect(
    @Query('companyId') companyId: TCompanyId,
    @Param('platform') platform: TCommunicationPlatform,
    @ActorId() actorId: TUserId,
  ): Promise<void> {
    await this.ensureCanManage(companyId, actorId);
    const record = await this.credentialsRepo.findByCompanyAndPlatform(companyId, platform);
    if (!record) {
      throw new BusinessError('Integration not found', 'INTEGRATION_NOT_FOUND', 404);
    }

    const entity = new IntegrationCredentialsEntity(RecordMetadataUtils.stripDocMetadata(record));
    entity.disconnect();

    const diff = entity.getDiffProps();
    if (Object.keys(diff).length > 0) {
      await this.credentialsRepo.updateOne({
        filter: { id: record.id } as any,
        update: { $set: { ...diff, ...RecordMetadataUtils.update() } } as any,
      });
    }
  }

  /** Add a channel to an integration. */
  @ApiOperation({ summary: 'Add a channel to an integration' })
  @Post(':platform/channels')
  async addChannel(
    @Query('companyId') companyId: TCompanyId,
    @Param('platform') platform: TCommunicationPlatform,
    @Body() body: { name: string; url: string },
    @ActorId() actorId: TUserId,
  ): Promise<TIntegrationViewModel> {
    await this.ensureCanManage(companyId, actorId);
    const record = await this.credentialsRepo.findByCompanyAndPlatform(companyId, platform);
    if (!record) throw new BusinessError('Integration not found', 'INTEGRATION_NOT_FOUND', 404);

    const entity = new IntegrationCredentialsEntity(RecordMetadataUtils.stripDocMetadata(record));
    entity.addChannel(body);

    const diff = entity.getDiffProps();
    if (Object.keys(diff).length > 0) {
      await this.credentialsRepo.updateOne({
        filter: { id: record.id } as any,
        update: { $set: { ...diff, ...RecordMetadataUtils.update() } } as any,
      });
    }

    return { id: entity.id, platform: entity.platform, status: entity.status, channels: [...entity.channels], connectedAt: entity.connectedAt };
  }

  /** Remove a channel from an integration. */
  @ApiOperation({ summary: 'Remove a channel from an integration' })
  @Delete(':platform/channels/:channelId')
  async removeChannel(
    @Query('companyId') companyId: TCompanyId,
    @Param('platform') platform: TCommunicationPlatform,
    @Param('channelId') channelId: string,
    @ActorId() actorId: TUserId,
  ): Promise<TIntegrationViewModel> {
    await this.ensureCanManage(companyId, actorId);
    const record = await this.credentialsRepo.findByCompanyAndPlatform(companyId, platform);
    if (!record) throw new BusinessError('Integration not found', 'INTEGRATION_NOT_FOUND', 404);

    const entity = new IntegrationCredentialsEntity(RecordMetadataUtils.stripDocMetadata(record));
    entity.removeChannel(channelId);

    const diff = entity.getDiffProps();
    if (Object.keys(diff).length > 0) {
      await this.credentialsRepo.updateOne({
        filter: { id: record.id } as any,
        update: { $set: { ...diff, ...RecordMetadataUtils.update() } } as any,
      });
    }

    return { id: entity.id, platform: entity.platform, status: entity.status, channels: [...entity.channels], connectedAt: entity.connectedAt };
  }

  private async ensureCanManage(companyId: TCompanyId, actorId: TUserId): Promise<void> {
    const canManage = await this.permissionResolver.hasCompanyPermission(actorId, companyId, 'company:settings:write');
    if (!canManage) throw new BusinessError('Forbidden', 'INTEGRATION_FORBIDDEN', 403);
  }
}
