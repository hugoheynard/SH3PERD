import { Body, Controller, Delete, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type {
  TCompanyId,
  TCommunicationPlatform,
  TIntegrationCredentialsRecord,
  TIntegrationViewModel,
} from '@sh3pherd/shared-types';
import type { Filter, UpdateFilter } from 'mongodb';
import { INTEGRATION_CREDENTIALS_REPO } from '../integrations.tokens.js';
import type { IIntegrationCredentialsRepository } from '../repositories/IntegrationCredentialsRepository.js';
import { IntegrationCredentialsEntity } from '../domain/IntegrationCredentialsEntity.js';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';
import { BusinessError } from '../../utils/errorManagement/BusinessError.js';

// TODO: Add @ContractScoped() + @RequirePermission() when integrations are scoped to a contract.
//       Currently platform-level — any authenticated user with a companyId can manage integrations.

@ApiTags('integration-settings')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@Controller()
export class IntegrationSettingsController {
  constructor(
    @Inject(INTEGRATION_CREDENTIALS_REPO)
    private readonly credentialsRepo: IIntegrationCredentialsRepository,
  ) {}

  /** List all integrations for a company (hides sensitive config). */
  @ApiOperation({ summary: 'Get integrations for a company' })
  @Get()
  async getIntegrations(
    @Query('companyId') companyId: TCompanyId,
  ): Promise<TIntegrationViewModel[]> {
    const records = await this.credentialsRepo.findByCompany(companyId);
    return records.map((r) => ({
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
  ): Promise<void> {
    const record = await this.credentialsRepo.findByCompanyAndPlatform(companyId, platform);
    if (!record) {
      throw new BusinessError('Integration not found', {
        code: 'INTEGRATION_NOT_FOUND',
        status: 404,
      });
    }

    const entity = new IntegrationCredentialsEntity(RecordMetadataUtils.stripDocMetadata(record));
    entity.disconnect();

    const diff = entity.getDiffProps();
    if (Object.keys(diff).length > 0) {
      const filter: Filter<TIntegrationCredentialsRecord> = { id: record.id };
      const update: UpdateFilter<TIntegrationCredentialsRecord> = {
        $set: { ...diff, ...RecordMetadataUtils.update() },
      };
      await this.credentialsRepo.updateOne({
        filter,
        update,
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
  ): Promise<TIntegrationViewModel> {
    const record = await this.credentialsRepo.findByCompanyAndPlatform(companyId, platform);
    if (!record)
      throw new BusinessError('Integration not found', {
        code: 'INTEGRATION_NOT_FOUND',
        status: 404,
      });

    const entity = new IntegrationCredentialsEntity(RecordMetadataUtils.stripDocMetadata(record));
    entity.addChannel(body);

    const diff = entity.getDiffProps();
    if (Object.keys(diff).length > 0) {
      const filter: Filter<TIntegrationCredentialsRecord> = { id: record.id };
      const update: UpdateFilter<TIntegrationCredentialsRecord> = {
        $set: { ...diff, ...RecordMetadataUtils.update() },
      };
      await this.credentialsRepo.updateOne({
        filter,
        update,
      });
    }

    return {
      id: entity.id,
      platform: entity.platform,
      status: entity.status,
      channels: [...entity.channels],
      connectedAt: entity.connectedAt,
    };
  }

  /** Remove a channel from an integration. */
  @ApiOperation({ summary: 'Remove a channel from an integration' })
  @Delete(':platform/channels/:channelId')
  async removeChannel(
    @Query('companyId') companyId: TCompanyId,
    @Param('platform') platform: TCommunicationPlatform,
    @Param('channelId') channelId: string,
  ): Promise<TIntegrationViewModel> {
    const record = await this.credentialsRepo.findByCompanyAndPlatform(companyId, platform);
    if (!record)
      throw new BusinessError('Integration not found', {
        code: 'INTEGRATION_NOT_FOUND',
        status: 404,
      });

    const entity = new IntegrationCredentialsEntity(RecordMetadataUtils.stripDocMetadata(record));
    entity.removeChannel(channelId);

    const diff = entity.getDiffProps();
    if (Object.keys(diff).length > 0) {
      const filter: Filter<TIntegrationCredentialsRecord> = { id: record.id };
      const update: UpdateFilter<TIntegrationCredentialsRecord> = {
        $set: { ...diff, ...RecordMetadataUtils.update() },
      };
      await this.credentialsRepo.updateOne({
        filter,
        update,
      });
    }

    return {
      id: entity.id,
      platform: entity.platform,
      status: entity.status,
      channels: [...entity.channels],
      connectedAt: entity.connectedAt,
    };
  }
}
