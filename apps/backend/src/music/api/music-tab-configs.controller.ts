import { Controller, Get, Put, Delete, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { MusicApiCodes } from '../codes.js';
import { buildApiResponseDTO } from '../../utils/response/buildApiResponseDTO.js';
import { GetMusicTabConfigsQuery } from '../application/queries/GetMusicTabConfigsQuery.js';
import {
  SaveMusicTabConfigsCommand,
  type TSaveMusicTabConfigsPayload,
} from '../application/commands/SaveMusicTabConfigsCommand.js';
import { DeleteMusicTabConfigsCommand } from '../application/commands/DeleteMusicTabConfigsCommand.js';
import { PlatformScoped } from '../../utils/nest/decorators/PlatformScoped.js';
import type { TUserId, TApiResponse, TMusicTabConfigsDomainModel } from '@sh3pherd/shared-types';

@ApiTags('music / tab configs')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@PlatformScoped()
@Controller('tab-configs')
export class MusicTabConfigsController {
  constructor(
    private readonly qryBus: QueryBus,
    private readonly cmdBus: CommandBus,
  ) {}

  @ApiOperation({
    summary: 'Get tab configs',
    description:
      "Returns the user's saved music library tab configurations (active tabs + saved presets).",
  })
  @Get()
  async getTabConfigs(
    @ActorId() actorId: TUserId,
  ): Promise<TApiResponse<TMusicTabConfigsDomainModel | null>> {
    return buildApiResponseDTO(
      MusicApiCodes.TAB_CONFIGS_FETCHED,
      await this.qryBus.execute<GetMusicTabConfigsQuery, TMusicTabConfigsDomainModel | null>(
        new GetMusicTabConfigsQuery(actorId),
      ),
    );
  }

  @ApiOperation({
    summary: 'Save tab configs',
    description:
      "Upserts the user's tab configurations (active tabs, saved presets, active config ID).",
  })
  @Put()
  async saveTabConfigs(
    @ActorId() actorId: TUserId,
    @Body('payload') payload: TSaveMusicTabConfigsPayload,
  ): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.TAB_CONFIGS_SAVED,
      await this.cmdBus.execute<SaveMusicTabConfigsCommand, boolean>(
        new SaveMusicTabConfigsCommand(actorId, payload),
      ),
    );
  }

  @ApiOperation({
    summary: 'Delete tab configs',
    description:
      'Removes all saved tab configurations for the user. Resets to defaults on next load.',
  })
  @Delete()
  async deleteTabConfigs(@ActorId() actorId: TUserId): Promise<TApiResponse<boolean>> {
    return buildApiResponseDTO(
      MusicApiCodes.TAB_CONFIGS_DELETED,
      await this.cmdBus.execute<DeleteMusicTabConfigsCommand, boolean>(
        new DeleteMusicTabConfigsCommand(actorId),
      ),
    );
  }
}
