/// <reference lib="webworker" />

import type { AudioAnalysisReport, WorkerInMessage, WorkerOutMessage } from './audio-analysis-types';

/* ── Biquad filter (Direct Form I, normalised coefficients) ─────────────────
 *
 *  y[n] = b0·x[n] + b1·x[n-1] + b2·x[n-2] − a1·y[n-1] − a2·y[n-2]
 *
 *  All coefficients pre-divided by a0 so the difference equation needs
 *  no per-sample division.
 */

interface Biquad { b0: number; b1: number; b2: number; a1: number; a2: number }

function biquad(input: Float32Array, f: Biquad): Float32Array {
  const out = new Float32Array(input.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < input.length; i++) {
    const x0 = input[i];
    const y0 = f.b0*x0 + f.b1*x1 + f.b2*x2 - f.a1*y1 - f.a2*y2;
    out[i] = y0; x2 = x1; x1 = x0; y2 = y1; y1 = y0;
  }
  return out;
}

/* ── K-weighting filter (ITU-R BS.1770-4, Annex 1) ─────────────────────────
 *
 *  Two biquad stages in series:
 *    Stage 1 — high-shelf pre-filter  (+4 dB shelf at ~1682 Hz)
 *    Stage 2 — high-pass RLB filter   (2nd-order HP at ~38 Hz)
 *
 *  Coefficients computed analytically via K = tan(π·f0/fs) bilinear
 *  substitution, valid for any sample rate.
 *  Reference: pyEBUR128, ITU-R BS.1770-4 Appendix 1.
 */

function kWeightingFilters(fs: number): [Biquad, Biquad] {

  // Stage 1 — high-shelf pre-filter
  const K1  = Math.tan(Math.PI * 1681.974450955533 / fs);
  const Vh  = Math.pow(10, 3.999843853973347 / 20);   // ≈ 1.585
  const Vb  = Math.pow(Vh, 0.4845);                   // ≈ 1.250
  const Q1  = 0.7071752369554196;
  const d1  = 1 + K1 / Q1 + K1 * K1;
  const s1: Biquad = {
    b0:  (Vh + Vb * K1 / Q1 + K1 * K1) / d1,
    b1:  2  * (K1 * K1 - Vh) / d1,
    b2:  (Vh - Vb * K1 / Q1 + K1 * K1) / d1,
    a1:  2  * (K1 * K1 - 1)  / d1,
    a2:  (1 - K1 / Q1 + K1 * K1) / d1,
  };

  // Stage 2 — high-pass RLB filter
  const K2  = Math.tan(Math.PI * 38.13547087602444 / fs);
  const Q2  = 0.5003270373238773;
  const d2  = 1 + K2 / Q2 + K2 * K2;
  const s2: Biquad = {
    b0:  1  / d2,
    b1: -2  / d2,
    b2:  1  / d2,
    a1:  2  * (K2 * K2 - 1) / d2,
    a2:  (1 - K2 / Q2 + K2 * K2) / d2,
  };

  return [s1, s2];
}

function applyKWeighting(ch: Float32Array, s1: Biquad, s2: Biquad): Float32Array {
  return biquad(biquad(ch, s1), s2);
}

/* ── Block loudness ─────────────────────────────────────────────────────────
 *
 *  Mean square across channels summed, converted to LUFS.
 *  Channel weighting: 1.0 for L/R/C (stereo ≡ both = 1.0).
 *  Formula: L = −0.691 + 10 · log10(Σ mean_sq_per_channel)
 */

function blockLoudness(weighted: Float32Array[], start: number, len: number): number {
  let sum = 0;
  for (const ch of weighted) {
    const end = Math.min(start + len, ch.length);
    let sq = 0;
    for (let i = start; i < end; i++) sq += ch[i] * ch[i];
    sum += sq / (end - start);
  }
  return sum > 0 ? -0.691 + 10 * Math.log10(sum) : -Infinity;
}

/* ── Gating (ITU-R BS.1770-4) ───────────────────────────────────────────────
 *
 *  1. Absolute gate: discard blocks below −70 LUFS.
 *  2. Relative gate: compute power-mean of remaining → discard blocks
 *     more than `relOffset` LU below that mean.
 *  Returns the loudness of the doubly-gated blocks.
 */

function powerMean(blocks: number[]): number {
  const sum = blocks.reduce((s, l) => s + Math.pow(10, l / 10), 0);
  return -0.691 + 10 * Math.log10(sum / blocks.length);
}

function gatedLoudness(blocks: number[], relOffset: number): number {
  const absGated = blocks.filter(l => isFinite(l) && l > -70);
  if (!absGated.length) return -Infinity;
  const relGated = absGated.filter(l => l > powerMean(absGated) - relOffset);
  return relGated.length ? powerMean(relGated) : -Infinity;
}

/* ── Loudness Range (EBU R128) ──────────────────────────────────────────────
 *
 *  Gate: absolute (−70 LUFS) + relative (ST mean − 20 LU).
 *  LRA = P95 − P10 of gated short-term distribution.
 */

function loudnessRange(shortTerm: number[]): number {
  const abs = shortTerm.filter(l => isFinite(l) && l > -70);
  if (abs.length < 2) return 0;
  const rel = abs.filter(l => l > powerMean(abs) - 20);
  if (rel.length < 2) return 0;
  const sorted = [...rel].sort((a, b) => a - b);
  const n = sorted.length;
  return Math.max(0, sorted[Math.floor(n * 0.95)] - sorted[Math.floor(n * 0.10)]);
}

/* ── True Peak (Hermite cubic interpolation at 4×) ──────────────────────────
 *
 *  Estimates inter-sample peaks by fitting a cubic Hermite polynomial
 *  through each group of 4 consecutive samples and evaluating at
 *  t = 0.25, 0.5, 0.75.
 *
 *  Not as accurate as a proper 4× FIR oversampler (which requires ~256-tap
 *  polyphase filter) but within ~0.1 dB for typical programme material and
 *  requires zero external dependencies.
 *
 *  Returns the linear (non-dB) peak value.
 */

function truePeakLinear(ch: Float32Array): number {
  const n = ch.length;
  if (n === 0) return 0;

  // Seed with boundary samples (outside the main loop's reach)
  let peak = Math.abs(ch[0]);
  if (n > 1)  peak = Math.max(peak, Math.abs(ch[n - 1]));
  if (n > 2)  peak = Math.max(peak, Math.abs(ch[n - 2]));

  for (let i = 1; i < n - 2; i++) {
    const s0 = ch[i - 1], s1 = ch[i], s2 = ch[i + 1], s3 = ch[i + 2];

    // Check sample at s1
    const a1 = Math.abs(s1);
    if (a1 > peak) peak = a1;

    // Hermite cubic coefficients
    const a = -0.5*s0 + 1.5*s1 - 1.5*s2 + 0.5*s3;
    const b =      s0 - 2.5*s1 + 2.0*s2 - 0.5*s3;
    const c = -0.5*s0           + 0.5*s2;

    // Evaluate at t = 0.25, 0.5, 0.75 (i.e., 4× oversample positions)
    for (const t of [0.25, 0.5, 0.75]) {
      const v = Math.abs(((a * t + b) * t + c) * t + s1);
      if (v > peak) peak = v;
    }
  }
  return peak;
}

/* ── Noise floor estimation ─────────────────────────────────────────────────
 *
 *  Considers blocks that pass the absolute gate (> −70 LUFS) but fall
 *  more than 20 LU below the integrated level as "noise-floor blocks".
 *  Returns the power-mean of those blocks.
 */

function estimateNoiseFloor(blocks400: number[], integrated: number): number {
  const ceiling = isFinite(integrated) ? integrated - 20 : -50;
  const noise   = blocks400.filter(l => isFinite(l) && l > -70 && l < ceiling);
  if (!noise.length) return -90;
  return powerMean(noise);
}

/* ── Main analysis ──────────────────────────────────────────────────────────*/

function analyze(
  channels: Float32Array[],
  sampleRate: number,
  duration: number,
  emit: (phase: string, pct: number) => void,
): AudioAnalysisReport {

  const nCh      = channels.length;
  const nSamples = channels[0].length;

  // ── 1. K-weighting ────────────────────────────────────────────────────────
  emit('filtering', 0);
  const [s1, s2] = kWeightingFilters(sampleRate);
  const kw = channels.map((ch, i) => {
    const filtered = applyKWeighting(ch, s1, s2);
    emit('filtering', ((i + 1) / nCh) * 25);
    return filtered;
  });

  // ── 2. 400 ms blocks (100 ms step) ────────────────────────────────────────
  emit('blocks', 25);
  const len400  = Math.round(0.4 * sampleRate);
  const step100 = Math.round(0.1 * sampleRate);
  const blocks400: number[] = [];
  const totalBlocks400 = Math.max(1, Math.floor((nSamples - len400) / step100) + 1);

  for (let s = 0, idx = 0; s + len400 <= nSamples; s += step100, idx++) {
    blocks400.push(blockLoudness(kw, s, len400));
    if (idx % Math.max(1, Math.floor(totalBlocks400 / 10)) === 0) {
      emit('blocks', 25 + (idx / totalBlocks400) * 25);
    }
  }

  // ── 3. Short-term blocks (3 s / 1 s step) ─────────────────────────────────
  emit('shortterm', 50);
  const len3s = Math.round(3 * sampleRate);
  const shortTermBlocks: number[] = [];

  for (let s = 0; s + len3s <= nSamples; s += sampleRate) {
    shortTermBlocks.push(blockLoudness(kw, s, len3s));
  }

  // ── 4. Loudness metrics ────────────────────────────────────────────────────
  emit('loudness', 60);
  const integratedLUFS   = gatedLoudness(blocks400, 10);
  const LRA              = loudnessRange(shortTermBlocks);
  const finite400        = blocks400.filter(isFinite);
  const finiteST         = shortTermBlocks.filter(isFinite);
  const momentaryMaxLUFS = finite400.length ? Math.max(...finite400) : -Infinity;
  const shortTermMaxLUFS = finiteST.length  ? Math.max(...finiteST)  : -Infinity;

  // ── 5. Sample-level stats (True Peak, RMS, clipping) ─────────────────────
  emit('peaks', 70);
  let tpLinear   = 0;
  let samplePeak = 0;
  let sumSq      = 0;
  let clipped    = 0;

  for (const ch of channels) {
    tpLinear = Math.max(tpLinear, truePeakLinear(ch));
    for (let i = 0; i < ch.length; i++) {
      const abs = Math.abs(ch[i]);
      if (abs > samplePeak) samplePeak = abs;
      sumSq += ch[i] * ch[i];
      if (abs >= 1.0) clipped++;
    }
  }

  const EPS          = 1e-10;
  const truePeakdBTP = 20 * Math.log10(Math.max(tpLinear, EPS));
  const peakdBFS     = 20 * Math.log10(Math.max(samplePeak, EPS));
  const RMSdBFS      = 10 * Math.log10(Math.max(sumSq / (nSamples * nCh), EPS));

  // ── 6. Noise floor + SNR ──────────────────────────────────────────────────
  emit('noise', 85);
  const noiseFloorLUFS = estimateNoiseFloor(blocks400, integratedLUFS);
  const SNRdB = (isFinite(integratedLUFS) && isFinite(noiseFloorLUFS))
    ? integratedLUFS - noiseFloorLUFS
    : 0;

  // ── 7. Timeline arrays ────────────────────────────────────────────────────
  // Cap at −60 LUFS for reasonable graph scaling; replace -Infinity with −60.
  const cap = (v: number) => isFinite(v) ? Math.max(-60, v) : -60;
  const momentaryLUFS  = blocks400.map(cap);
  const shortTermLUFS  = shortTermBlocks.map(cap);

  // ── 8. Gain suggestions ───────────────────────────────────────────────────
  const gainTo = (target: number) =>
    isFinite(integratedLUFS) ? +(target - integratedLUFS).toFixed(2) : 0;

  const round2 = (v: number) => isFinite(v) ? +v.toFixed(2) : v;

  emit('done', 100);

  return {
    integratedLUFS:    round2(integratedLUFS),
    momentaryMaxLUFS:  round2(momentaryMaxLUFS),
    shortTermMaxLUFS:  round2(shortTermMaxLUFS),
    loudnessRange:     round2(LRA),
    truePeakdBTP:      round2(truePeakdBTP),
    peakdBFS:          round2(peakdBFS),
    RMSdBFS:           round2(RMSdBFS),
    PLR: (isFinite(truePeakdBTP) && isFinite(integratedLUFS))
      ? round2(truePeakdBTP - integratedLUFS) : 0,
    PSR: (isFinite(truePeakdBTP) && isFinite(shortTermMaxLUFS))
      ? round2(truePeakdBTP - shortTermMaxLUFS) : 0,
    dynamicRange:      round2(peakdBFS - RMSdBFS),
    noiseFloorLUFS:    round2(noiseFloorLUFS),
    SNRdB:             round2(SNRdB),
    clippedSamples:    clipped,
    clippingRatio:     clipped / (nSamples * nCh),
    momentaryLUFS,
    shortTermLUFS,
    gainSuggestions: {
      streaming: gainTo(-14),
      broadcast: gainTo(-23),
      film:      gainTo(-24),
      headroom:  round2(-1 - truePeakdBTP),
    },
    durationSeconds: duration,
    sampleRate,
    channels: nCh,
  };
}

/* ── Worker entry point ─────────────────────────────────────────────────────*/

self.onmessage = ({ data }: MessageEvent<WorkerInMessage>) => {
  const channels = data.channelBuffers.map(b => new Float32Array(b));

  try {
    const report = analyze(
      channels,
      data.sampleRate,
      data.duration,
      (phase, percent) =>
        (self as DedicatedWorkerGlobalScope).postMessage(
          { type: 'progress', phase, percent } satisfies WorkerOutMessage
        ),
    );
    (self as DedicatedWorkerGlobalScope).postMessage(
      { type: 'result', report } satisfies WorkerOutMessage
    );
  } catch (err) {
    (self as DedicatedWorkerGlobalScope).postMessage(
      { type: 'error', message: String(err) } satisfies WorkerOutMessage
    );
  }
};
