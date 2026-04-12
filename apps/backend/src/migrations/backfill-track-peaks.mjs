/**
 * Migration: backfill waveform peaks on existing tracks.
 *
 * Walks every document in `music_versions`, finds tracks whose
 * `analysisResult` exists but has no `peaks` field, and dispatches
 * a re-analysis TCP message to the audio-processor microservice.
 * The processor returns the full snapshot (now including peaks),
 * which we merge back into the version document.
 *
 * Idempotent: tracks that already carry peaks are skipped. Running
 * the script twice is a no-op for already-enriched tracks.
 *
 * Concurrency is capped at `MAX_CONCURRENT` to avoid swamping the
 * processor. Each analysis downloads the audio from R2, decodes it,
 * runs Essentia + loudness + peak extraction, and uploads nothing —
 * only the snapshot is returned. Expect ~5-10 s per track.
 *
 * Run with:
 *   node apps/backend/src/migrations/backfill-track-peaks.mjs
 */
import { MongoClient } from 'mongodb';
import net from 'node:net';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../');

dotenv.config({ path: path.join(root, '.env.app') });
dotenv.config({ path: path.join(root, '.env.dev'), override: true });

const uri = process.env.ATLAS_URI;
const dbName = process.env.CORE_DB_NAME;
const processorHost = process.env.AUDIO_PROCESSOR_HOST ?? 'localhost';
const processorPort = parseInt(process.env.AUDIO_PROCESSOR_PORT ?? '3001', 10);

const MAX_CONCURRENT = 4;

if (!uri || !dbName) {
  console.error('Missing ATLAS_URI or CORE_DB_NAME');
  process.exit(1);
}

// ── TCP helper (NestJS microservices TCP protocol) ──────────

/**
 * Sends a NestJS TCP microservice message and returns the parsed
 * response. The NestJS TCP transport uses a simple newline-delimited
 * JSON protocol: `{"pattern":"X","data":{...}}\n`, and the response
 * is `{"response":{...}}\n`.
 */
function sendTcpMessage(pattern, data) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let buffer = '';
    const timeout = setTimeout(() => {
      client.destroy();
      reject(new Error(`TCP timeout for pattern ${pattern}`));
    }, 180_000); // 3 min — analysis can be slow on large files

    client.connect(processorPort, processorHost, () => {
      const message = JSON.stringify({ pattern, data, id: crypto.randomUUID() });
      // NestJS TCP transport expects the message length prefix as a
      // 4-byte big-endian integer followed by the JSON payload.
      const payload = Buffer.from(message, 'utf-8');
      const header = Buffer.alloc(4);
      header.writeUInt32BE(payload.length, 0);
      client.write(Buffer.concat([header, payload]));
    });

    client.on('data', (chunk) => {
      buffer += chunk.toString();
    });

    client.on('end', () => {
      clearTimeout(timeout);
      try {
        // NestJS TCP responses may have a length prefix — strip it.
        // Find the first '{' to locate the JSON start.
        const jsonStart = buffer.indexOf('{');
        if (jsonStart === -1) {
          reject(new Error(`Invalid TCP response: ${buffer.slice(0, 200)}`));
          return;
        }
        const parsed = JSON.parse(buffer.slice(jsonStart));
        if (parsed.err) {
          reject(new Error(parsed.err.message ?? JSON.stringify(parsed.err)));
          return;
        }
        resolve(parsed.response ?? parsed);
      } catch (e) {
        reject(new Error(`Failed to parse TCP response: ${e.message}`));
      }
    });

    client.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// ── Main ────────────────────────────────────────────────────

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const versions = db.collection('music_versions');

  // Find all versions that have at least one track with analysisResult
  // but no peaks field.
  const allVersions = await versions.find({
    'tracks.analysisResult': { $exists: true },
  }).toArray();

  // Build a flat list of (version doc, track index) pairs to process.
  const jobs = [];
  for (const ver of allVersions) {
    for (let i = 0; i < (ver.tracks?.length ?? 0); i++) {
      const track = ver.tracks[i];
      if (track.analysisResult && !track.analysisResult.peaks) {
        jobs.push({ version: ver, trackIndex: i, track });
      }
    }
  }

  console.log(`Found ${jobs.length} tracks without peaks across ${allVersions.length} versions`);

  if (jobs.length === 0) {
    console.log('Nothing to do — all tracks already have peaks.');
    process.exit(0);
  }

  let completed = 0;
  let failed = 0;

  // Process in batches of MAX_CONCURRENT.
  for (let i = 0; i < jobs.length; i += MAX_CONCURRENT) {
    const batch = jobs.slice(i, i + MAX_CONCURRENT);
    const results = await Promise.allSettled(
      batch.map(async (job) => {
        const { version: ver, trackIndex, track } = job;

        if (!track.s3Key) {
          console.warn(`  ⚠ Track ${track.id} has no s3Key — skipping`);
          return;
        }

        console.log(`  → Analyzing track ${track.id} (${track.fileName})`);

        const snapshot = await sendTcpMessage('analyze_track', {
          s3Key: track.s3Key,
          trackId: track.id,
          versionId: ver.id,
          ownerId: ver.owner_id,
        });

        if (!snapshot || !snapshot.peaks) {
          console.warn(`  ⚠ No peaks returned for track ${track.id}`);
          return;
        }

        // Merge the new snapshot into the existing track's analysisResult.
        // We only overwrite the peaks + peakCount fields to avoid clobbering
        // any manual corrections to LUFS/BPM/key values.
        const setPath = `tracks.${trackIndex}.analysisResult`;
        await versions.updateOne(
          { id: ver.id },
          {
            $set: {
              [`${setPath}.peaks`]: snapshot.peaks,
              [`${setPath}.peakCount`]: snapshot.peakCount,
              // Also update duration/BPM/key if the re-analysis found better values
              // (the processor may have been upgraded since the original analysis).
              [`${setPath}.durationSeconds`]: snapshot.durationSeconds,
              [`${setPath}.bpm`]: snapshot.bpm,
              [`${setPath}.key`]: snapshot.key,
              [`${setPath}.keyScale`]: snapshot.keyScale,
              [`${setPath}.keyStrength`]: snapshot.keyStrength,
            },
          },
        );

        completed++;
      }),
    );

    for (const r of results) {
      if (r.status === 'rejected') {
        failed++;
        console.error(`  ✗ ${r.reason?.message ?? r.reason}`);
      }
    }

    console.log(`  Progress: ${completed + failed}/${jobs.length} (${completed} OK, ${failed} failed)`);
  }

  console.log(`\nDone: ${completed} enriched, ${failed} failed, ${jobs.length - completed - failed} skipped.`);
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
} finally {
  await client.close();
}
