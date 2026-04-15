import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MUSIC_REFERENCE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicReferenceRepository } from '../../types/musicReferences.types.js';
import type {
  TUserId,
  TCreateMusicReferenceRequestDTO,
  TMusicReferenceDomainModel,
} from '@sh3pherd/shared-types';
import { MusicReferenceEntity } from '../../domain/entities/MusicReferenceEntity.js';

/**
 * Command to create a music reference (the canonical song entry).
 *
 * A reference is shared across all users — it represents "the song itself"
 * (e.g. "Bohemian Rhapsody" by Queen), not a user's rendition of it.
 *
 * @note This does NOT go through the RepertoireEntryAggregate because a
 *       reference exists independently of any user's repertoire. The aggregate
 *       only manages the user ↔ reference link (entry) and versions.
 */
export class CreateMusicReferenceCommand {
  constructor(
    public readonly actor_id: TUserId,
    public readonly payload: TCreateMusicReferenceRequestDTO,
  ) {}
}

/**
 * Creates a new music reference, or returns the existing one if an exact
 * title + artist match is found (case-insensitive deduplication).
 *
 * Flow:
 * 1. Normalize title/artist to lowercase for comparison
 * 2. Check if an identical reference already exists → return it (idempotent)
 * 3. Otherwise, create a new MusicReferenceEntity, validate via entity invariants, persist
 *
 * @throws MUSIC_REFERENCE_TITLE_REQUIRED — empty title (entity invariant)
 * @throws MUSIC_REFERENCE_ARTIST_REQUIRED — empty artist (entity invariant)
 * @throws MUSIC_REFERENCE_CREATION_FAILED — persistence error
 */
@CommandHandler(CreateMusicReferenceCommand)
export class CreateMusicReferenceHandler implements ICommandHandler<
  CreateMusicReferenceCommand,
  TMusicReferenceDomainModel
> {
  constructor(@Inject(MUSIC_REFERENCE_REPO) private readonly refRepo: IMusicReferenceRepository) {}

  async execute(cmd: CreateMusicReferenceCommand): Promise<TMusicReferenceDomainModel> {
    const title = cmd.payload.title.trim().toLowerCase();
    const artist = cmd.payload.artist.trim().toLowerCase();

    // Deduplicate: return existing if exact match found
    const existing = await this.refRepo.findByExactTitleAndArtist(title, artist);
    if (existing) return existing;

    const ref = new MusicReferenceEntity({
      title: cmd.payload.title,
      artist: cmd.payload.artist,
      owner_id: cmd.actor_id,
    });

    const saved = await this.refRepo.save(ref.toDomain);

    if (!saved) {
      throw new Error('MUSIC_REFERENCE_CREATION_FAILED');
    }

    return ref.toDomain;
  }
}
