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
import { mockAggregateRepo, mockAnalytics, mockTransactionRunner } from './handler-test-helpers.js';
import { TechnicalError } from '../../../../utils/errorManagement/TechnicalError.js';

function setup() {
  const aggregateRepo = mockAggregateRepo();
  const analytics = mockAnalytics();
  const tx = mockTransactionRunner();

  const owner = userId();
  const v = makeVersion({ id: versionId(1), owner_id: owner, label: 'Original' });
  const aggregate = makeAggregate({ owner, versions: [v] });

  aggregateRepo.loadByVersionId.mockResolvedValue(aggregate);
  aggregateRepo.save.mockResolvedValue();

  const handler = new UpdateMusicVersionHandler(aggregateRepo, analytics as never, tx as never);

  return { handler, aggregateRepo, analytics, tx, owner, version: v };
}

describe('UpdateMusicVersionHandler', () => {
  it('persists the patch in a transaction and emits analytics with changed fields', async () => {
    const { handler, aggregateRepo, analytics, tx, owner } = setup();

    const result = await handler.execute(
      new UpdateMusicVersionCommand(owner, versionId(1), { label: 'Updated', genre: GENRE.Rock }),
    );

    expect(tx.run).toHaveBeenCalledTimes(1);
    expect(aggregateRepo.save).toHaveBeenCalledTimes(1);
    expect(analytics.track).toHaveBeenCalledWith(
      'music_version_updated',
      owner,
      expect.objectContaining({
        version_id: versionId(1),
        changed_fields: expect.arrayContaining(['label', 'genre']),
      }),
    );
    expect(result.label).toBe('Updated');
    expect(result.genre).toBe(GENRE.Rock);
  });

  it('short-circuits an empty patch — no save, no analytics', async () => {
    const { handler, aggregateRepo, analytics, tx, owner } = setup();

    const result = await handler.execute(new UpdateMusicVersionCommand(owner, versionId(1), {}));

    expect(tx.run).not.toHaveBeenCalled();
    expect(aggregateRepo.save).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
    expect(result.label).toBe('Original');
  });

  it('rejects with MUSIC_VERSION_NOT_OWNED when actor differs from owner', async () => {
    const { handler } = setup();

    await expect(
      handler.execute(new UpdateMusicVersionCommand(userId(999), versionId(1), { label: 'X' })),
    ).rejects.toMatchObject({
      name: 'BusinessError',
      code: 'MUSIC_VERSION_NOT_OWNED',
      status: 403,
    });
  });

  it('wraps unknown persistence errors in a TechnicalError carrying changedFields context', async () => {
    const { handler, aggregateRepo, analytics, owner } = setup();
    aggregateRepo.save.mockRejectedValueOnce(new Error('mongo down'));

    await expect(
      handler.execute(new UpdateMusicVersionCommand(owner, versionId(1), { label: 'New' })),
    ).rejects.toMatchObject({
      name: 'TechnicalError',
      code: 'MUSIC_VERSION_UPDATE_REPO_FAIL',
      context: expect.objectContaining({
        actorId: owner,
        versionId: versionId(1),
        changedFields: ['label'],
        operation: 'UpdateMusicVersion.save',
      }),
    });
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it('wraps any runner failure (even a TechnicalError) with handler context', async () => {
    const { handler, aggregateRepo, owner } = setup();
    const inner = new TechnicalError('Transaction failed', { code: 'TRANSACTION_FAILED' });
    aggregateRepo.save.mockRejectedValueOnce(inner);

    await expect(
      handler.execute(new UpdateMusicVersionCommand(owner, versionId(1), { label: 'X' })),
    ).rejects.toMatchObject({
      name: 'TechnicalError',
      code: 'MUSIC_VERSION_UPDATE_REPO_FAIL',
      cause: inner,
    });
  });

  it('throws MUSIC_VERSION_NOT_FOUND (404) when the aggregate is missing', async () => {
    const { handler, aggregateRepo, owner } = setup();
    aggregateRepo.loadByVersionId.mockResolvedValueOnce(null);

    await expect(
      handler.execute(new UpdateMusicVersionCommand(owner, versionId(1), { label: 'X' })),
    ).rejects.toMatchObject({
      name: 'BusinessError',
      code: 'MUSIC_VERSION_NOT_FOUND',
      status: 404,
    });

    expect(aggregateRepo.save).not.toHaveBeenCalled();
  });
});
