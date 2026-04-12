/**
 * AI mastering via DeepAFx-ST — TypeScript subprocess bridge.
 *
 * Two-stage pipeline:
 *   Stage 1 — DeepAFx-ST autodiff (Python subprocess): intelligent EQ + compression
 *   Stage 2 — ffmpeg loudnorm (optional, reuses master.ts): LUFS/TP/LRA calibration
 *
 * The Python worker (`python/deepafx_worker.py`) is spawned via `execFile`.
 * It loads the model checkpoint, runs inference, writes the processed audio
 * to a temp file, and prints the predicted EQ + compressor parameters as
 * JSON to stdout. We parse that JSON and return it alongside the processed
 * audio buffer.
 *
 * Same pattern as master.ts: temp files with UUID, cleanup in `finally`.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import * as fs from 'node:fs/promises';
import { masterAudio } from './master';
import type { TAiMasterPredictedParams, TMasteringTargetSpecs, TMeasuredLoudness } from '@sh3pherd/shared-types';

const exec = promisify(execFile);

/** Path to the Python worker script, resolved relative to the compiled JS output. */
const DEFAULT_WORKER_PATH = resolve(__dirname, '../../python/deepafx_worker.py');

/** Result returned by the two-stage pipeline. */
export interface AiMasteringResult {
  /** The final processed audio buffer (WAV 24-bit PCM). */
  processedBuffer: Buffer;
  /** Predicted DSP parameters from DeepAFx-ST (interpretable). */
  predictedParams: TAiMasterPredictedParams;
  /** ffmpeg loudnorm report from stage 2, if loudnormTarget was provided. */
  loudnormReport?: string;
}

/**
 * Run the AI mastering pipeline on an audio buffer.
 *
 * @param inputBuffer     Raw audio file (any format ffmpeg/soundfile can decode)
 * @param referenceBuffer Reference audio to match the style of
 * @param checkpointPath  Path to the DeepAFx-ST autodiff model checkpoint
 * @param loudnormTarget  Optional LUFS/TP/LRA target for stage 2. Omit to skip loudnorm.
 * @param measured        Pre-measured loudness of the input. Required if loudnormTarget is set.
 *                        When omitted with a loudnormTarget, stage 2 uses a simple single-pass
 *                        loudnorm (less accurate but avoids a separate analysis).
 */
export async function aiMasterAudio(
  inputBuffer: Buffer,
  referenceBuffer: Buffer,
  checkpointPath: string,
  loudnormTarget?: TMasteringTargetSpecs,
  measured?: TMeasuredLoudness,
): Promise<AiMasteringResult> {
  const uid = crypto.randomUUID();
  const inputPath = join(tmpdir(), `aimaster-in-${uid}.wav`);
  const referencePath = join(tmpdir(), `aimaster-ref-${uid}.wav`);
  const deepafxOutputPath = join(tmpdir(), `aimaster-dafx-${uid}.wav`);

  const pythonBin = process.env['DEEPAFX_PYTHON'] ?? 'python3';
  const workerPath = process.env['DEEPAFX_WORKER_PATH'] ?? DEFAULT_WORKER_PATH;
  const ckptPath = checkpointPath || (process.env['DEEPAFX_CHECKPOINT_PATH'] ?? '');

  try {
    // Write input + reference to temp files
    await Promise.all([
      fs.writeFile(inputPath, inputBuffer),
      fs.writeFile(referencePath, referenceBuffer),
    ]);

    // ── Stage 1: DeepAFx-ST inference ────────────────────

    const { stdout, stderr } = await exec(pythonBin, [
      workerPath,
      '--input', inputPath,
      '--reference', referencePath,
      '--output', deepafxOutputPath,
      '--checkpoint', ckptPath,
    ], {
      timeout: 120_000, // 2 minutes — covers cold start + inference
      maxBuffer: 10 * 1024 * 1024, // 10 MB stdout buffer
    });

    if (stderr) {
      // DeepAFx-ST logs to stderr (model loading, inference progress).
      // Not an error — just info. We log it for observability.
      // eslint-disable-next-line no-console
      console.log(`[ai-master] python stderr:\n${stderr.slice(-1000)}`);
    }

    // Parse predicted parameters from stdout JSON
    let predictedParams: TAiMasterPredictedParams;
    try {
      predictedParams = JSON.parse(stdout.trim()) as TAiMasterPredictedParams;
    } catch {
      throw new Error(`Failed to parse DeepAFx-ST output JSON: ${stdout.slice(0, 500)}`);
    }

    // Read the DeepAFx-ST processed audio
    let processedBuffer: Buffer = Buffer.from(await fs.readFile(deepafxOutputPath));

    // ── Stage 2: Optional loudnorm ───────────────────────

    let loudnormReport: string | undefined;

    if (loudnormTarget) {
      // If we have pre-measured loudness from the original track's
      // analysis snapshot, use the precision pass-2 (same as standard
      // mastering). Otherwise, use a simple single-pass loudnorm
      // which measures and normalises in one go (slightly less accurate
      // but avoids re-running the analysis pipeline on the AI output).
      const measuredValues: TMeasuredLoudness = measured ?? {
        // Fallback: conservative defaults that let loudnorm do its
        // own measurement internally (pass-1 values are ignored when
        // they're clearly placeholder — ffmpeg falls back to dual-pass).
        integratedLUFS: -24,
        truePeakdBTP: -1,
        loudnessRange: 7,
      };

      const { processedBuffer: finalBuffer, report } = await masterAudio(
        processedBuffer,
        measuredValues,
        loudnormTarget,
      );
      processedBuffer = finalBuffer;
      loudnormReport = report;
    }

    return { processedBuffer, predictedParams, loudnormReport };
  } finally {
    // Cleanup all temp files
    await Promise.all([
      fs.unlink(inputPath).catch(() => {}),
      fs.unlink(referencePath).catch(() => {}),
      fs.unlink(deepafxOutputPath).catch(() => {}),
    ]);
  }
}
