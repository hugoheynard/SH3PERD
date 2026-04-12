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
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P } from '@sh3pherd/shared-types';
import type {
  TUserId, TApiResponse, TMusicVersionId, TVersionTrackId,
  TVersionTrackDomainModel, TMusicVersionDomainModel, TMasteringTargetSpecs,
} from '@sh3pherd/shared-types';

/**
 * Audio processing endpoints — mastering, AI mastering, pitch-shift.
 *
 * Separated from `MusicTrackController` (CRUD + download + favorite)
 * because processing operations are heavier (they dispatch to the
 * audio-processor microservice via TCP), have different latency
 * characteristics, and will grow independently as new processing
 * types are added (time-stretch, stem separation, etc.).
 *
 * Same route prefix as MusicTrackController (`versions/:versionId/tracks`)
 * so URLs stay unchanged.
 */
@ApiTags('music / track processing')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required. Missing or invalid Bearer token.' })
@ContractScoped()
@Controller('versions/:versionId/tracks')
export class MusicTrackProcessingController {
  constructor(private readonly cmdBus: CommandBus) {}

  // ── Standard mastering (ffmpeg loudnorm) ──────────────────

  @ApiOperation({ summary: 'Master a track', description: 'Creates a mastered copy of a track with target loudness specs. Uses analysis data from the original for precision.' })
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
      await this.cmdBus.execute(new MasterTrackCommand(actorId, versionId, trackId, body)),
    );
  }

  // ── AI mastering (DeepAFx-ST + optional loudnorm) ─────────

  @ApiOperation({ summary: 'AI-master a track', description: 'Creates an AI-mastered copy using DeepAFx-ST style transfer against a reference track. Optionally applies loudness normalisation as a second stage.' })
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
      await this.cmdBus.execute(
        new AiMasterTrackCommand(
          actorId, versionId, trackId,
          body.referenceVersionId, body.referenceTrackId,
          body.loudnormTarget,
        ),
      ),
    );
  }

  // ── Pitch shift ───────────────────────────────────────────

  @ApiOperation({ summary: 'Pitch-shift a version', description: 'Creates a new version with all tracks pitch-shifted by the specified semitones. The new version is linked to the original via parentVersionId.' })
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
      await this.cmdBus.execute(new PitchShiftVersionCommand(actorId, versionId, trackId, body.semitones)),
    );
  }
}
