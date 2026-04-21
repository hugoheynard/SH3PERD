import {
  UpdateMusicVersionCommand,
  UpdateMusicVersionHandler,
} from '../UpdateMusicVersionCommand.js';
import {
  makeAggregate,
  makeVersion,
  userId,
  versionId,
  GENRE,
} from '../../../domain/__tests__/test-helpers.js';
import { mockAggregateRepo, mockAnalytics } from './handler-test-helpers.js';

function setup() {
  const aggregateRepo = mockAggregateRepo();
  const analytics = mockAnalytics();

  const owner = userId();
  const v = makeVersion({ id: versionId(1), owner_id: owner, label: 'Original' });
  const aggregate = makeAggregate({ owner, versions: [v] });

  aggregateRepo.loadByVersionId.mockResolvedValue(aggregate);
  aggregateRepo.save.mockResolvedValue();

  const handler = new UpdateMusicVersionHandler(aggregateRepo, analytics as never);

  return { handler, aggregateRepo, analytics, owner, version: v };
}

describe('UpdateMusicVersionHandler', () => {
  it('persists the patch and emits analytics with updated_fields + changes', async () => {
    const { handler, aggregateRepo, analytics, owner } = setup();

    const result = await handler.execute(
      new UpdateMusicVersionCommand(owner, versionId(1), { label: 'Updated', genre: GENRE.Rock }),
    );

    expect(aggregateRepo.save).toHaveBeenCalledTimes(1);
    expect(analytics.track).toHaveBeenCalledWith(
      'music_version_updated',
      owner,
      expect.objectContaining({
        version_id: versionId(1),
        updated_fields: expect.arrayContaining(['label', 'genre']),
        changes: expect.objectContaining({ label: 'Updated', genre: GENRE.Rock }),
      }),
    );
    expect(result.label).toBe('Updated');
    expect(result.genre).toBe(GENRE.Rock);
  });

  it('short-circuits an empty patch — no save, no analytics', async () => {
    const { handler, aggregateRepo, analytics, owner } = setup();

    const result = await handler.execute(new UpdateMusicVersionCommand(owner, versionId(1), {}));

    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
    expect(result.label).toBe('Original');
  });

  it('short-circuits an all-undefined patch the same way', async () => {
    const { handler, aggregateRepo, analytics, owner } = setup();

    const result = await handler.execute(
      new UpdateMusicVersionCommand(owner, versionId(1), {
        label: undefined,
        genre: undefined,
      }),
    );

    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
    expect(result.label).toBe('Original');
  });

  it('throws MUSIC_VERSION_NOT_OWNED (DomainError) when actor differs from owner', async () => {
    const { handler } = setup();

    await expect(
      handler.execute(new UpdateMusicVersionCommand(userId(999), versionId(1), { label: 'X' })),
    ).rejects.toMatchObject({
      name: 'DomainError',
      code: 'MUSIC_VERSION_NOT_OWNED',
    });
  });

  it('propagates label invariant error without saving', async () => {
    const { handler, aggregateRepo, analytics, owner } = setup();

    await expect(
      handler.execute(new UpdateMusicVersionCommand(owner, versionId(1), { label: '   ' })),
    ).rejects.toThrow('MUSIC_VERSION_LABEL_REQUIRED');

    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });
});
