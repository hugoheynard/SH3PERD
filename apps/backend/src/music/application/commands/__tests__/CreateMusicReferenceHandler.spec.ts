import {
  CreateMusicReferenceCommand,
  CreateMusicReferenceHandler,
} from '../CreateMusicReferenceCommand.js';
import { makeReference, userId } from '../../../domain/__tests__/test-helpers.js';
import { mockAnalytics } from './handler-test-helpers.js';
import type { IMusicReferenceRepository } from '../../../types/musicReferences.types.js';
import type { TMusicReferenceDomainModel } from '@sh3pherd/shared-types';

function mockRefRepo(): jest.Mocked<
  Pick<IMusicReferenceRepository, 'findByExactTitleAndArtist' | 'save'>
> {
  return {
    findByExactTitleAndArtist: jest.fn(),
    save: jest.fn(),
  };
}

function setup(opts: { existing?: TMusicReferenceDomainModel | null; persist?: boolean } = {}) {
  const refRepo = mockRefRepo();
  const analytics = mockAnalytics();

  refRepo.findByExactTitleAndArtist.mockResolvedValue(opts.existing ?? null);
  refRepo.save.mockResolvedValue(opts.persist ?? true);

  const handler = new CreateMusicReferenceHandler(refRepo as never, analytics as never);
  return { handler, refRepo, analytics };
}

describe('CreateMusicReferenceHandler', () => {
  it('returns the existing reference on exact title+artist match (dedup, no save)', async () => {
    const existing = makeReference({ title: 'Bohemian Rhapsody', artist: 'Queen' }).toDomain;
    const { handler, refRepo, analytics } = setup({ existing });

    const result = await handler.execute(
      new CreateMusicReferenceCommand(userId(), {
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
      }),
    );

    expect(result).toBe(existing);
    expect(refRepo.save).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('lower-cases title and artist when looking up duplicates', async () => {
    const { handler, refRepo } = setup();

    await handler.execute(
      new CreateMusicReferenceCommand(userId(), { title: '  Hey Jude  ', artist: 'Beatles' }),
    );

    expect(refRepo.findByExactTitleAndArtist).toHaveBeenCalledWith('hey jude', 'beatles');
  });

  it('persists a new reference and emits music_reference_created', async () => {
    const { handler, refRepo, analytics } = setup();

    const result = await handler.execute(
      new CreateMusicReferenceCommand(userId(), { title: 'Hey Jude', artist: 'Beatles' }),
    );

    expect(refRepo.save).toHaveBeenCalledTimes(1);
    expect(result.title).toBe('hey jude');
    expect(result.artist).toBe('beatles');
    expect(result.creator).toEqual({ type: 'user', id: userId() });
    expect(analytics.track).toHaveBeenCalledWith(
      'music_reference_created',
      userId(),
      expect.objectContaining({ title: 'Hey Jude', artist: 'Beatles' }),
    );
  });

  it('throws MUSIC_REFERENCE_CREATION_FAILED when persistence returns false', async () => {
    const { handler, analytics } = setup({ persist: false });

    await expect(
      handler.execute(
        new CreateMusicReferenceCommand(userId(), { title: 'Hey Jude', artist: 'Beatles' }),
      ),
    ).rejects.toMatchObject({
      name: 'TechnicalError',
      code: 'MUSIC_REFERENCE_CREATION_FAILED',
    });

    expect(analytics.track).not.toHaveBeenCalled();
  });
});
