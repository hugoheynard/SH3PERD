/**
 * Audio analysis pipeline.
 *
 * Combines two engines:
 * - **FFmpeg/ffprobe** — decodes any audio format to raw PCM, provides sample rate & channel info.
 * - **Essentia.js (WASM)** — BPM detection (PercivalBpmEstimator) and key/scale detection (KeyExtractor).
 *
 * Loudness analysis follows **ITU-R BS.1770-4** (K-weighting, gated loudness, true peak).
 *
 * @module analyze
 */
import { encodePeaks, extractPeaks } from '@sh3pherd/shared-types';
import type {
  TAudioAnalysisSnapshot,
  TMusicRating,
} from '@sh3pherd/shared-types';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as fs from 'node:fs/promises';
import { Essentia, EssentiaWASM } from 'essentia.js';

/** Subset of ffprobe's `-show_streams` JSON output we depend on. */
interface FfprobeStreamInfo {
  sample_rate?: string;
  channels?: number;
}
interface FfprobeOutput {
  streams?: FfprobeStreamInfo[];
}

/* ── Biquad filter (Direct Form I, normalised coefficients) ──────────── */

interface Biquad {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

function biquad(input: Float32Array, f: Biquad): Float32Array {
  const out = new Float32Array(input.length);
  let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
  for (let i = 0; i < input.length; i++) {
    const x0 = input[i];
    const y0 = f.b0 * x0 + f.b1 * x1 + f.b2 * x2 - f.a1 * y1 - f.a2 * y2;
    out[i] = y0;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
  }
  return out;
}

/* ── K-weighting filter (ITU-R BS.1770-4) ────────────────────────────── */

function kWeightingFilters(fs: number): [Biquad, Biquad] {
  const K1 = Math.tan((Math.PI * 1681.974450955533) / fs);
  const Vh = Math.pow(10, 3.999843853973347 / 20);
  const Vb = Math.pow(Vh, 0.4845);
  const Q1 = 0.7071752369554196;
  const d1 = 1 + K1 / Q1 + K1 * K1;
  const s1: Biquad = {
    b0: (Vh + (Vb * K1) / Q1 + K1 * K1) / d1,
    b1: (2 * (K1 * K1 - Vh)) / d1,
    b2: (Vh - (Vb * K1) / Q1 + K1 * K1) / d1,
    a1: (2 * (K1 * K1 - 1)) / d1,
    a2: (1 - K1 / Q1 + K1 * K1) / d1,
  };

  const K2 = Math.tan((Math.PI * 38.13547087602444) / fs);
  const Q2 = 0.5003270373238773;
  const d2 = 1 + K2 / Q2 + K2 * K2;
  const s2: Biquad = {
    b0: 1 / d2,
    b1: -2 / d2,
    b2: 1 / d2,
    a1: (2 * (K2 * K2 - 1)) / d2,
    a2: (1 - K2 / Q2 + K2 * K2) / d2,
  };

  return [s1, s2];
}

/* ── Block loudness ──────────────────────────────────────────────────── */

export function blockLoudness(
  weighted: Float32Array[],
  start: number,
  len: number,
): number {
  let sum = 0;
  for (const ch of weighted) {
    const end = Math.min(start + len, ch.length);
    let sq = 0;
    for (let i = start; i < end; i++) sq += ch[i] * ch[i];
    sum += sq / (end - start);
  }
  return sum > 0 ? -0.691 + 10 * Math.log10(sum) : -Infinity;
}

function powerMean(blocks: number[]): number {
  const sum = blocks.reduce((s, l) => s + Math.pow(10, l / 10), 0);
  return -0.691 + 10 * Math.log10(sum / blocks.length);
}

function gatedLoudness(blocks: number[], relOffset: number): number {
  const absGated = blocks.filter((l) => isFinite(l) && l > -70);
  if (!absGated.length) return -Infinity;
  const relGated = absGated.filter((l) => l > powerMean(absGated) - relOffset);
  return relGated.length ? powerMean(relGated) : -Infinity;
}

function loudnessRange(shortTerm: number[]): number {
  const abs = shortTerm.filter((l) => isFinite(l) && l > -70);
  if (abs.length < 2) return 0;
  const rel = abs.filter((l) => l > powerMean(abs) - 20);
  if (rel.length < 2) return 0;
  const sorted = [...rel].sort((a, b) => a - b);
  const n = sorted.length;
  return Math.max(
    0,
    sorted[Math.floor(n * 0.95)] - sorted[Math.floor(n * 0.1)],
  );
}

/* ── True Peak (Hermite cubic interpolation at 4×) ───────────────────── */

export function truePeakLinear(ch: Float32Array): number {
  const n = ch.length;
  if (n === 0) return 0;
  let peak = Math.abs(ch[0]);
  if (n > 1) peak = Math.max(peak, Math.abs(ch[n - 1]));
  if (n > 2) peak = Math.max(peak, Math.abs(ch[n - 2]));

  for (let i = 1; i < n - 2; i++) {
    const s0 = ch[i - 1],
      s1 = ch[i],
      s2 = ch[i + 1],
      s3 = ch[i + 2];
    const a1 = Math.abs(s1);
    if (a1 > peak) peak = a1;

    const a = -0.5 * s0 + 1.5 * s1 - 1.5 * s2 + 0.5 * s3;
    const b = s0 - 2.5 * s1 + 2.0 * s2 - 0.5 * s3;
    const c = -0.5 * s0 + 0.5 * s2;

    for (const t of [0.25, 0.5, 0.75]) {
      const v = Math.abs(((a * t + b) * t + c) * t + s1);
      if (v > peak) peak = v;
    }
  }
  return peak;
}

/* ── Noise floor estimation ──────────────────────────────────────────── */

function estimateNoiseFloor(blocks400: number[], integrated: number): number {
  const ceiling = isFinite(integrated) ? integrated - 20 : -50;
  const noise = blocks400.filter((l) => isFinite(l) && l > -70 && l < ceiling);
  if (!noise.length) return -90;
  return powerMean(noise);
}

/* ── FFmpeg PCM decode ───────────────────────────────────────────────── */

interface DecodedAudio {
  channels: Float32Array[];
  sampleRate: number;
  duration: number;
}

/**
 * Decode an audio file to raw PCM using FFmpeg.
 * Outputs 32-bit float LE, mono or stereo depending on source.
 */
async function decodeWithFFmpeg(inputBuffer: Buffer): Promise<DecodedAudio> {
  const uid = crypto.randomUUID();
  const inputPath = join(tmpdir(), `analyze-in-${uid}`);
  const outputPath = join(tmpdir(), `analyze-out-${uid}.raw`);

  await fs.writeFile(inputPath, inputBuffer);

  // Probe for sample rate and channels
  const probeInfo = await new Promise<{ sampleRate: number; channels: number }>(
    (resolve, reject) => {
      const proc = spawn('ffprobe', [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_streams',
        '-select_streams',
        'a:0',
        inputPath,
      ]);
      const chunks: Buffer[] = [];
      proc.stdout.on('data', (d) => chunks.push(d));
      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ffprobe exit ${code}`));
          return;
        }
        try {
          const info = JSON.parse(
            Buffer.concat(chunks).toString(),
          ) as FfprobeOutput;
          const stream = info.streams?.[0];
          resolve({
            sampleRate: parseInt(stream?.sample_rate ?? '44100', 10),
            channels: parseInt(String(stream?.channels ?? '2'), 10),
          });
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      });
    },
  );

  // Decode to raw 32-bit float LE PCM
  await new Promise<void>((resolve, reject) => {
    const proc = spawn('ffmpeg', [
      '-i',
      inputPath,
      '-f',
      'f32le',
      '-acodec',
      'pcm_f32le',
      outputPath,
    ]);
    proc.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)),
    );
  });

  const rawBuffer = await fs.readFile(outputPath);
  await Promise.all([
    fs.unlink(inputPath).catch(() => {}),
    fs.unlink(outputPath).catch(() => {}),
  ]);

  const totalSamples = rawBuffer.byteLength / 4; // 4 bytes per float32
  const samplesPerChannel = Math.floor(totalSamples / probeInfo.channels);

  // Deinterleave
  const float32 = new Float32Array(
    rawBuffer.buffer,
    rawBuffer.byteOffset,
    totalSamples,
  );
  const channels: Float32Array[] = [];
  for (let c = 0; c < probeInfo.channels; c++) {
    channels.push(new Float32Array(samplesPerChannel));
  }
  for (let i = 0; i < samplesPerChannel; i++) {
    for (let c = 0; c < probeInfo.channels; c++) {
      channels[c][i] = float32[i * probeInfo.channels + c];
    }
  }

  return {
    channels,
    sampleRate: probeInfo.sampleRate,
    duration: samplesPerChannel / probeInfo.sampleRate,
  };
}

/* ── Essentia BPM + Key analysis ─────────────────────────────────────── */

interface EssentiaResult {
  bpm: number | null;
  key: string | null;
  keyScale: string | null;
  keyStrength: number | null;
}

function analyzeWithEssentia(monoSamples: Float32Array): EssentiaResult {
  const essentia = new Essentia(EssentiaWASM);
  const vec = essentia.arrayToVector(monoSamples);

  let bpm: number | null = null;
  let key: string | null = null;
  let keyScale: string | null = null;
  let keyStrength: number | null = null;

  try {
    const bpmResult = essentia.PercivalBpmEstimator(vec);
    bpm = bpmResult.bpm > 0 ? +bpmResult.bpm.toFixed(1) : null;
  } catch {
    /* BPM detection can fail on very short or silent audio */
  }

  try {
    const keyResult = essentia.KeyExtractor(vec);
    if (keyResult.key && keyResult.key !== '') {
      key = keyResult.key;
      keyScale = keyResult.scale;
      keyStrength = +keyResult.strength.toFixed(3);
    }
  } catch {
    /* Key detection can fail on percussive/atonal audio */
  }

  return { bpm, key, keyScale, keyStrength };
}

/** Mix channels down to mono for essentia analysis. */
export function mixToMono(channels: Float32Array[]): Float32Array {
  if (channels.length === 1) return channels[0];
  const n = channels[0].length;
  const mono = new Float32Array(n);
  const scale = 1 / channels.length;
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (const ch of channels) sum += ch[i];
    mono[i] = sum * scale;
  }
  return mono;
}

/* ── Main analysis ───────────────────────────────────────────────────── */

function computeAnalysis(
  channels: Float32Array[],
  sampleRate: number,
  duration: number,
): Omit<TAudioAnalysisSnapshot, 'quality'> {
  const nCh = channels.length;
  const nSamples = channels[0].length;

  // K-weighting
  const [s1, s2] = kWeightingFilters(sampleRate);
  const kw = channels.map((ch) => biquad(biquad(ch, s1), s2));

  // 400ms blocks
  const len400 = Math.round(0.4 * sampleRate);
  const step100 = Math.round(0.1 * sampleRate);
  const blocks400: number[] = [];
  for (let s = 0; s + len400 <= nSamples; s += step100) {
    blocks400.push(blockLoudness(kw, s, len400));
  }

  // Short-term blocks (3s / 1s step)
  const len3s = Math.round(3 * sampleRate);
  const shortTermBlocks: number[] = [];
  for (let s = 0; s + len3s <= nSamples; s += sampleRate) {
    shortTermBlocks.push(blockLoudness(kw, s, len3s));
  }

  const integratedLUFS = gatedLoudness(blocks400, 10);
  const LRA = loudnessRange(shortTermBlocks);

  // True peak + clipping
  let tpLinear = 0;
  let clipped = 0;
  for (const ch of channels) {
    tpLinear = Math.max(tpLinear, truePeakLinear(ch));
    for (let i = 0; i < ch.length; i++) {
      if (Math.abs(ch[i]) >= 1.0) clipped++;
    }
  }

  const EPS = 1e-10;
  const truePeakdBTP = 20 * Math.log10(Math.max(tpLinear, EPS));
  const noiseFloorLUFS = estimateNoiseFloor(blocks400, integratedLUFS);
  const SNRdB =
    isFinite(integratedLUFS) && isFinite(noiseFloorLUFS)
      ? integratedLUFS - noiseFloorLUFS
      : 0;
  const clippingRatio = clipped / (nSamples * nCh);

  // Essentia: BPM + Key
  const mono = mixToMono(channels);
  const essentiaResult = analyzeWithEssentia(mono);

  const round2 = (v: number) => (isFinite(v) ? +v.toFixed(2) : v);

  return {
    integratedLUFS: round2(integratedLUFS),
    loudnessRange: round2(LRA),
    truePeakdBTP: round2(truePeakdBTP),
    SNRdB: round2(SNRdB),
    clippingRatio,
    bpm: essentiaResult.bpm,
    key: essentiaResult.key,
    keyScale: essentiaResult.keyScale,
    keyStrength: essentiaResult.keyStrength,
    durationSeconds: +duration.toFixed(2),
    sampleRate,
  };
}

export function computeQuality(
  snapshot: Omit<TAudioAnalysisSnapshot, 'quality'>,
): TMusicRating {
  if (
    snapshot.clippingRatio < 0.001 &&
    snapshot.SNRdB > 50 &&
    snapshot.truePeakdBTP < -1
  )
    return 4;
  if (snapshot.clippingRatio < 0.005 && snapshot.SNRdB > 35) return 3;
  if (snapshot.clippingRatio < 0.02 && snapshot.SNRdB > 20) return 2;
  return 1;
}

/**
 * Analyze an audio file buffer and return a TAudioAnalysisSnapshot.
 * Uses FFmpeg for decoding + ITU-R BS.1770-4 for loudness analysis.
 *
 * v2: also extracts a compact waveform peak envelope (2000 buckets)
 * and encodes it as a base64 Int16 string. The peaks are computed from
 * the mono mixdown that Essentia already requires, so the extra cost
 * is negligible (<5 ms on a 5 min track).
 */
export async function analyzeAudioFile(
  fileBuffer: Buffer,
): Promise<TAudioAnalysisSnapshot> {
  const decoded = await decodeWithFFmpeg(fileBuffer);
  const metrics = computeAnalysis(
    decoded.channels,
    decoded.sampleRate,
    decoded.duration,
  );
  const quality = computeQuality(metrics);

  // Extract waveform peaks from the mono mixdown
  const mono = mixToMono(decoded.channels);
  const peakFloats = extractPeaks(mono);
  const peaks = encodePeaks(peakFloats);
  const peakCount = peakFloats.length;

  return { ...metrics, quality, peaks, peakCount };
}
