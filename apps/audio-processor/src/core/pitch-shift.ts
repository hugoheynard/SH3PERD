/**
 * Pitch-shift an audio buffer by the given number of semitones.
 *
 * Uses ffmpeg's `asetrate` filter to change the sample rate (which changes
 * pitch), then `aresample` to resample back to the original rate (which
 * restores the correct playback speed). The result is a pitch-shifted
 * version of the input at the same tempo and duration.
 *
 * For higher quality with minimal artifacts on large shifts (>4 semitones),
 * consider switching to the rubberband library via ffmpeg's `rubberband`
 * filter. The current approach is sufficient for ±4 semitones and is
 * simpler to deploy (no extra native deps beyond ffmpeg).
 *
 * @param audioBuffer - Raw audio file buffer (any format ffmpeg can decode)
 * @param semitones - Number of semitones to shift (positive = up, negative = down)
 * @returns Processed audio buffer (WAV 24-bit PCM)
 */

import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as fs from 'node:fs/promises';

/**
 * Probe the source sample rate using ffprobe.
 * Same pattern as analyze.ts's decodeWithFFmpeg.
 */
async function probeSampleRate(inputPath: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const proc = spawn('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_streams',
      '-select_streams', 'a:0',
      inputPath,
    ]);
    const chunks: Buffer[] = [];
    proc.stdout.on('data', (d: Buffer) => chunks.push(d));
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe exited with code ${code}`));
        return;
      }
      try {
        const info = JSON.parse(Buffer.concat(chunks).toString());
        const stream = info.streams?.[0];
        resolve(parseInt(stream?.sample_rate ?? '44100', 10));
      } catch (e) {
        reject(e);
      }
    });
    proc.on('error', reject);
  });
}

/**
 * Compute the shifted sample rate for a given semitone offset.
 * +12 semitones = double the rate (one octave up).
 * -12 semitones = half the rate (one octave down).
 * 0 semitones = unchanged.
 *
 * Exported for direct unit testing.
 */
export function computeShiftedRate(sourceSR: number, semitones: number): number {
  return Math.round(sourceSR * Math.pow(2, semitones / 12));
}

export async function pitchShift(audioBuffer: Buffer, semitones: number): Promise<Buffer> {
  if (semitones === 0) {
    // No shift requested — return the input as-is to avoid a pointless
    // ffmpeg round-trip that would re-encode and potentially lose quality.
    return audioBuffer;
  }

  const uid = crypto.randomUUID();
  const inputPath = join(tmpdir(), `pitch-in-${uid}`);
  const outputPath = join(tmpdir(), `pitch-out-${uid}.wav`);

  try {
    await fs.writeFile(inputPath, audioBuffer);

    // Probe the source sample rate so we compute the shift correctly.
    const sourceSR = await probeSampleRate(inputPath);
    const shiftedRate = computeShiftedRate(sourceSR, semitones);

    // asetrate changes the declared sample rate of the audio stream
    // (which changes pitch + tempo), then aresample resamples back to
    // the original rate (which restores the original tempo but keeps
    // the new pitch).
    const filterChain = `asetrate=${shiftedRate},aresample=${sourceSR}`;

    await new Promise<void>((resolve, reject) => {
      const stderrChunks: Buffer[] = [];
      const proc = spawn('ffmpeg', [
        '-y',
        '-i', inputPath,
        '-af', filterChain,
        '-c:a', 'pcm_s24le',
        outputPath,
      ]);
      proc.stderr.on('data', (d: Buffer) => stderrChunks.push(d));
      proc.on('close', (code) => {
        if (code !== 0) {
          const stderr = Buffer.concat(stderrChunks).toString();
          reject(new Error(`ffmpeg pitch-shift exited with code ${code}: ${stderr.slice(-500)}`));
          return;
        }
        resolve();
      });
      proc.on('error', reject);
    });

    return await fs.readFile(outputPath);
  } finally {
    await Promise.all([
      fs.unlink(inputPath).catch(() => {}),
      fs.unlink(outputPath).catch(() => {}),
    ]);
  }
}
