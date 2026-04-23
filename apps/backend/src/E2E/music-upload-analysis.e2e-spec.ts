/**
 * Integration test — `Upload → Analysis → DB` end-to-end.
 *
 * Proves the async handshake between the backend and the
 * audio-processor microservice actually lands the analysis
 * snapshot on the track in Mongo:
 *
 *   1. UploadTrackCommand → S3 write + aggregate save
 *   2. TrackUploadedEvent → TrackUploadedHandler
 *   3. ClientProxy.send(ANALYZE_TRACK) → (mocked) snapshot
 *   4. aggregate.setTrackAnalysis() → aggregate save
 *   5. Track row in Mongo has `analysisResult` populated
 *
 * Without this test a breaking change to the TrackUploadedEvent
 * shape, the AP payload contract, or the aggregate persistence
 * path would slip through silently — every unit test would still
 * pass, only prod would notice.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { of } from 'rxjs';
import type { Db, MongoClient } from 'mongodb';
import type {
  TAudioAnalysisSnapshot,
  TMusicReferenceDomainModel,
  TMusicRepertoireEntryDomainModel,
  TMusicVersionDomainModel,
  TUserId,
  TMusicReferenceId,
  TRepertoireEntryId,
  TMusicVersionId,
} from '@sh3pherd/shared-types';
import { Genre, VersionType } from '@sh3pherd/shared-types';
import { AppModule } from '../appBootstrap/app.module.js';
import { loadEnv } from '../appBootstrap/config/loadEnv.js';
import { MONGO_CLIENT } from '../appBootstrap/database/db.tokens.js';
import { UploadTrackCommand } from '../music/application/commands/UploadTrackCommand.js';
import { TRACK_STORAGE_SERVICE } from '../music/infra/storage/storage.tokens.js';
import { resetMusicCollections } from './utils/db-cleanup.js';

function makeAnalysisSnapshot(): TAudioAnalysisSnapshot {
  return {
    integratedLUFS: -11.2,
    loudnessRange: 6.4,
    truePeakdBTP: -0.9,
    SNRdB: 42,
    clippingRatio: 0,
    bpm: 128,
    key: 'A',
    keyScale: 'minor',
    keyStrength: 0.87,
    durationSeconds: 180,
    sampleRate: 44100,
    quality: 4,
  } as TAudioAnalysisSnapshot;
}

describe('Music — Upload → Analysis → DB E2E', () => {
  let app: INestApplication;
  let db: Db;
  let commandBus: CommandBus;
  const snapshot = makeAnalysisSnapshot();
  const storageUpload = jest
    .fn<Promise<void>, [string, Buffer, string]>()
    .mockResolvedValue(undefined);
  const apSend = jest.fn<unknown, [string, Record<string, unknown>]>();

  const ownerId = 'userCredential_music-e2e-1' as TUserId;
  const referenceId = 'musicRef_music-e2e-1' as TMusicReferenceId;
  const entryId = 'repEntry_music-e2e-1' as TRepertoireEntryId;
  const versionId = 'musicVer_music-e2e-1' as TMusicVersionId;

  beforeAll(async () => {
    const uri = readFileSync(join(process.cwd(), '.e2e-mongo-uri'), 'utf-8').trim();
    process.env['ATLAS_URI'] = uri;
    process.env['CORE_DB_NAME'] = 'sh3pherd_e2e_music';
    process.env['NODE_ENV'] = 'test';
    loadEnv('test');

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      // Swap the TCP microservice client for a jest mock so the test never
      // reaches out over the network. `send` returns an Observable shaped
      // exactly like the real ClientProxy — one emission, then complete.
      .overrideProvider('AUDIO_PROCESSOR')
      .useValue({ send: apSend, connect: jest.fn(), close: jest.fn() })
      // Same for the R2/S3 storage: resolve the upload immediately and
      // expose a noop delete for the handler's compensation path.
      .overrideProvider(TRACK_STORAGE_SERVICE)
      .useValue({
        upload: storageUpload,
        delete: jest.fn().mockResolvedValue(undefined),
        getPresignedDownloadUrl: jest.fn().mockResolvedValue('https://example/fake'),
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const mongoClient: MongoClient = app.get(MONGO_CLIENT);
    db = mongoClient.db(process.env['CORE_DB_NAME']);
    commandBus = app.get(CommandBus);
  });

  afterAll(async () => {
    await resetMusicCollections(db);
    await app.close();
  });

  beforeEach(async () => {
    await resetMusicCollections(db);
    storageUpload.mockClear();
    apSend.mockClear();
    // Seed the reference + entry + version the upload will attach to.
    const reference: TMusicReferenceDomainModel = {
      id: referenceId,
      title: 'integration test song',
      artist: 'integration',
      creator: { type: 'user', id: ownerId },
      created_at: new Date('2026-01-01T00:00:00.000Z'),
    } as TMusicReferenceDomainModel;

    const entry: TMusicRepertoireEntryDomainModel = {
      id: entryId,
      owner_id: ownerId,
      musicReference_id: referenceId,
    } as TMusicRepertoireEntryDomainModel;

    const version: TMusicVersionDomainModel = {
      id: versionId,
      owner_id: ownerId,
      musicReference_id: referenceId,
      label: 'Original',
      genre: Genre.Pop,
      type: VersionType.Original,
      bpm: null,
      pitch: null,
      mastery: 3,
      energy: 3,
      effort: 2,
      tracks: [],
    } as TMusicVersionDomainModel;

    await db.collection('music_references').insertOne(reference as never);
    await db.collection('music_repertoireEntries').insertOne(entry as never);
    await db.collection('music_version').insertOne(version as never);
  });

  it('persists the analysis snapshot on the uploaded track after the AP round-trip', async () => {
    apSend.mockReturnValue(of(snapshot));

    const file = Buffer.alloc(4096, 0x42);
    await commandBus.execute(
      new UploadTrackCommand(ownerId, versionId, file, 'audio/mpeg', {
        fileName: 'integration.mp3',
        durationSeconds: 180,
      }),
    );

    // Event bus dispatch is async — wait for the TrackUploadedHandler
    // save to land. Poll the DB rather than hard-sleeping.
    const persisted = await waitForAnalysis(db, versionId);
    expect(persisted).toMatchObject({
      integratedLUFS: snapshot.integratedLUFS,
      bpm: snapshot.bpm,
      key: snapshot.key,
      keyScale: snapshot.keyScale,
      durationSeconds: snapshot.durationSeconds,
    });

    expect(storageUpload).toHaveBeenCalledTimes(1);
    expect(apSend).toHaveBeenCalledTimes(1);
    const [pattern, payload] = apSend.mock.calls[0];
    expect(pattern).toBe('analyze_track');
    expect(payload['versionId']).toBe(versionId);
    expect(payload['ownerId']).toBe(ownerId);
    expect(typeof payload['trackId']).toBe('string');
  });

  it('leaves the track un-analysed when the AP microservice returns null', async () => {
    apSend.mockReturnValue(of(null));

    const file = Buffer.alloc(1024, 0x00);
    await commandBus.execute(
      new UploadTrackCommand(ownerId, versionId, file, 'audio/wav', {
        fileName: 'no-analysis.wav',
        durationSeconds: 3,
      }),
    );

    // Give the event loop a tick to run the handler.
    await sleep(200);

    const stored = await db.collection<TMusicVersionDomainModel>('music_version').findOne({
      id: versionId,
    });
    expect(stored?.tracks).toHaveLength(1);
    expect(stored?.tracks[0].analysisResult).toBeUndefined();
  });
});

// ─── Helpers ───────────────────────────────────────────────

async function waitForAnalysis(
  db: Db,
  versionId: TMusicVersionId,
  timeoutMs = 3000,
): Promise<TAudioAnalysisSnapshot> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const stored = await db
      .collection<TMusicVersionDomainModel>('music_version')
      .findOne({ id: versionId });
    const analysed = stored?.tracks.find((t) => t.analysisResult);
    if (analysed?.analysisResult) return analysed.analysisResult;
    await sleep(50);
  }
  throw new Error(`Timed out waiting for analysis on version ${versionId}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
