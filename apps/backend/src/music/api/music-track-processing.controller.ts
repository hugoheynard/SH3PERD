import { Controller, Post, Param, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';
import { apiSuccessDTO } from '../../utils/swagger/api-response.swagger.util.js';
import { MasterTrackCommand } from '../application/commands/MasterTrackCommand.js';
import { AiMasterTrackCommand } from '../application/commands/AiMasterTrackCommand.js';
import { PitchShiftVersionCommand } from '../application/commands/PitchShiftVersionCommand.js';
import { VersionTrackPayload, MusicVersionPayload } from '../dto/music.dto.js';
import { PlatformScoped } from '../../utils/nest/decorators/PlatformScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P } from '@sh3pherd/shared-types';
import type {
  TUserId, TApiResponse, TMusicVersionId, TVersionTrackId,
  TVersionTrackDomainModel, TMusicVersionDomainModel, TMasteringTargetSpecs,
} from '@sh3pherd/shared-types';

/**
 * Audio processing endpoints — platform-scoped (SaaS subscription).
 */
@ApiTags('music / track processing')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@PlatformScoped()
@Controller('versions/:versionId/tracks')
export class MusicTrackProcessingController {
  constructor(private readonly cmdBus: CommandBus) {}

  @ApiOperation({ summary: 'Master a track', description: 'Creates a mastered copy with target loudness specs.' })
  @ApiParam({ name: 'versionId', description: 'Version owning the source track' })
  @ApiParam({ name: 'trackId', description: 'Source track to master' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.TRACK_MASTERED, VersionTrackPayload, 200))
  @RequirePermission(P.Music.Track.Write)
  @Post(':trackId/master')
  async masterTrack(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
    @Body() body: TMasteringTargetSpecs,
  ): Promise<TApiResponse<TVersionTrackDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.TRACK_MASTERED,
      await this.cmdBus.execute<MasterTrackCommand, TVersionTrackDomainModel>(
        new MasterTrackCommand(actorId, versionId, trackId, body),
      ),
    );
  }

  @ApiOperation({ summary: 'AI-master a track', description: 'Creates an AI-mastered copy via DeepAFx-ST style transfer. Optionally applies loudnorm as stage 2.' })
  @ApiParam({ name: 'versionId', description: 'Version owning the source track' })
  @ApiParam({ name: 'trackId', description: 'Source track to AI-master' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.TRACK_AI_MASTERED, VersionTrackPayload, 200))
  @RequirePermission(P.Music.Track.Write)
  @Post(':trackId/ai-master')
  async aiMasterTrack(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
    @Body() body: {
      referenceVersionId: TMusicVersionId;
      referenceTrackId: TVersionTrackId;
      loudnormTarget?: TMasteringTargetSpecs;
    },
  ): Promise<TApiResponse<TVersionTrackDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.TRACK_AI_MASTERED,
      await this.cmdBus.execute<AiMasterTrackCommand, TVersionTrackDomainModel>(
        new AiMasterTrackCommand(
          actorId, versionId, trackId,
          body.referenceVersionId, body.referenceTrackId,
          body.loudnormTarget,
        ),
      ),
    );
  }

  @ApiOperation({ summary: 'Pitch-shift a version', description: 'Creates a new version pitch-shifted by the specified semitones.' })
  @ApiParam({ name: 'versionId', description: 'Source version to pitch-shift' })
  @ApiParam({ name: 'trackId', description: 'Reference track for the operation' })
  @ApiResponse(apiSuccessDTO(MusicApiCodes.VERSION_PITCH_SHIFTED, MusicVersionPayload, 200))
  @RequirePermission(P.Music.Track.Write)
  @Post(':trackId/pitch-shift')
  async pitchShiftTrack(
    @ActorId() actorId: TUserId,
    @Param('versionId') versionId: TMusicVersionId,
    @Param('trackId') trackId: TVersionTrackId,
    @Body() body: { semitones: number },
  ): Promise<TApiResponse<TMusicVersionDomainModel>> {
    return buildApiResponseDTO(
      MusicApiCodes.VERSION_PITCH_SHIFTED,
      await this.cmdBus.execute<PitchShiftVersionCommand, TMusicVersionDomainModel>(
        new PitchShiftVersionCommand(actorId, versionId, trackId, body.semitones),
      ),
    );
  }
}
