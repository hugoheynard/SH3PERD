/**
 * Mastering pipeline — loudness normalization using ffmpeg loudnorm (pass-2 only).
 *
 * Uses measured values from the initial analysis as pass-1 data,
 * so only a single ffmpeg run is needed for precise normalization.
 *
 * Output: 24-bit PCM WAV with `linear=true` for clean gain adjustment.
 *
 * @module master
 */
import * as fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { TMeasuredLoudness, TMasteringTargetSpecs } from '@sh3pherd/shared-types';

/* ── Types ─────────────────────────────────────────────────────────── */

export interface MasteringResult {
  processedBuffer: Buffer;
  /** Raw ffmpeg stderr output (contains loudnorm stats). */
  report: string;
}

/* ── Helpers ───────────────────────────────────────────────────────── */

async function cleanupTempFiles(...paths: string[]) {
  for (const p of paths) {
    try { await fs.unlink(p); } catch { /* ignore */ }
  }
}

/* ── Main ──────────────────────────────────────────────────────────── */

/**
 * Apply loudness normalization using pre-measured values (pass-2 of loudnorm).
 *
 * Since analysis already measured LUFS/TP/LRA, we skip pass-1 and feed
 * the measured values directly to loudnorm with `linear=true`.
 *
 * @param audioBuffer  - Raw audio file bytes (any format ffmpeg supports).
 * @param measured     - Loudness values from the initial analysis.
 * @param target       - Target loudness specs.
 * @returns Processed 24-bit WAV buffer + ffmpeg report.
 */
export async function masterAudio(
  audioBuffer: Buffer,
  measured: TMeasuredLoudness,
  target: TMasteringTargetSpecs,
): Promise<MasteringResult> {
  const uid = crypto.randomUUID();
  const inputPath = path.join(tmpdir(), `master-in-${uid}`);
  const outputPath = path.join(tmpdir(), `master-out-${uid}.wav`);

  await fs.writeFile(inputPath, audioBuffer);

  const loudnormFilter = [
    `loudnorm=I=${target.targetLUFS}`,
    `TP=${target.targetTP}`,
    `LRA=${target.targetLRA}`,
    `measured_I=${measured.integratedLUFS}`,
    `measured_TP=${measured.truePeakdBTP}`,
    `measured_LRA=${measured.loudnessRange}`,
    `measured_thresh=-24`,  // safe default for gating threshold
    `linear=true`,
  ].join(':');

  const report: string[] = [];

  await new Promise<void>((resolve, reject) => {
    const proc = spawn('ffmpeg', [
      '-y',
      '-i', inputPath,
      '-af', loudnormFilter,
      '-c:a', 'pcm_s24le',
      outputPath,
    ]);

    proc.stderr.on('data', (data: Buffer) => report.push(data.toString()));

    proc.on('close', async (code) => {
      if (code === 0) resolve();
      else {
        await cleanupTempFiles(inputPath, outputPath);
        reject(new Error(`FFmpeg mastering exited with code ${code}`));
      }
    });
  });

  const processedBuffer = await fs.readFile(outputPath);
  await cleanupTempFiles(inputPath, outputPath);

  return { processedBuffer, report: report.join('') };
}
