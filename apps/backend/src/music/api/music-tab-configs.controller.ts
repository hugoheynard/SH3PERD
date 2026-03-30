import { Controller, Get, Put, Delete, Body } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { GetMusicTabConfigsQuery } from '../application/queries/GetMusicTabConfigsQuery.js';
import { SaveMusicTabConfigsCommand, type TSaveMusicTabConfigsPayload } from '../application/commands/SaveMusicTabConfigsCommand.js';
import { DeleteMusicTabConfigsCommand } from '../application/commands/DeleteMusicTabConfigsCommand.js';
import type { TUserId, TApiResponse, TMusicTabConfigsDomainModel } from '@sh3pherd/shared-types';

/**
 * MusicTabConfigsController
 *
 * REST controller for persisting user's music library tab configurations.
 * Mounted under `music/tab-configs` via the MusicModule RouterModule.
 *
 * Endpoints:
 * - GET    /music/tab-configs     → fetch user's tab configs
 * - PUT    /music/tab-configs     → upsert tab configs
 * - DELETE /music/tab-configs     → remove all tab configs (reset to defaults)
 */
@Controller('tab-configs')
export class MusicTabConfigsController {
  constructor(
    private readonly qryBus: QueryBus,
    private readonly cmdBus: CommandBus,
  ) {}

  @Get()
  async getTabConfigs(
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TMusicTabConfigsDomainModel | null>> {
    return buildApiResponseDTO(
      MusicApiCodes.TAB_CONFIGS_FETCHED,
      await this.qryBus.execute(new GetMusicTabConfigsQuery(actorId)),
    );
  }

  @Put()
  async saveTabConfigs(
    @ActorId() actorId: TUserId,
    @Body('payload') payload: TSaveMusicTabConfigsPayload,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.TAB_CONFIGS_SAVED,
      await this.cmdBus.execute(new SaveMusicTabConfigsCommand(actorId, payload)),
    );
  }

  @Delete()
  async deleteTabConfigs(
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.TAB_CONFIGS_DELETED,
      await this.cmdBus.execute(new DeleteMusicTabConfigsCommand(actorId)),
    );
  }
}
