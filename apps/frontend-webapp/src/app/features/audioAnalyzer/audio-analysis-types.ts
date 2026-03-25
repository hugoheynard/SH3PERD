/**
 * Complete loudness / level analysis report.
 * All dB values use standard conventions:
 *   - LUFS  = Loudness Units relative to Full Scale (ITU-R BS.1770-4 / EBU R128)
 *   - dBFS  = decibels relative to Full Scale (sample peak, 0 dBFS = clipping)
 *   - dBTP  = decibels True Peak (interpolated, ITU-R BS.1775)
 *   - LU    = Loudness Unit (relative difference between LUFS values)
 */
export interface AudioAnalysisReport {

  // ── Integrated loudness (EBU R128 / ITU-R BS.1770-4) ──────────────────────
  /** Gated loudness of the entire file. Reference: -14 LUFS streaming, -23 LUFS broadcast. */
  integratedLUFS: number;
  /** Loudest 400 ms window (momentary, M — no gating). */
  momentaryMaxLUFS: number;
  /** Loudest 3 s window (short-term, S — no gating). */
  shortTermMaxLUFS: number;
  /** Loudness Range in LU (EBU R128). Typical music: 6–12 LU. */
  loudnessRange: number;

  // ── Levels ─────────────────────────────────────────────────────────────────
  /** True Peak: inter-sample peak via Hermite cubic at 4× (per-channel max). */
  truePeakdBTP: number;
  /** Sample peak: max absolute sample value. Always ≤ truePeakdBTP. */
  peakdBFS: number;
  /** Overall RMS (all channels averaged). */
  RMSdBFS: number;

  // ── Dynamics ───────────────────────────────────────────────────────────────
  /** Peak-to-Loudness Ratio: truePeak − integratedLUFS. High PLR = punchy/dynamic. */
  PLR: number;
  /** Peak-to-Short-term Ratio: truePeak − shortTermMaxLUFS. */
  PSR: number;
  /** Crude dynamic range: peakdBFS − RMSdBFS. */
  dynamicRange: number;

  // ── Noise ──────────────────────────────────────────────────────────────────
  /** Estimated noise floor: mean loudness of blocks below signal threshold. */
  noiseFloorLUFS: number;
  /** Signal-to-noise ratio: integratedLUFS − noiseFloorLUFS. */
  SNRdB: number;

  // ── Clipping ───────────────────────────────────────────────────────────────
  /** Number of samples at ±1.0 (clipping in integer conversion). */
  clippedSamples: number;
  /** Fraction of total samples that are clipped (0–1). */
  clippingRatio: number;

  // ── Timeline (for visualisation) ───────────────────────────────────────────
  /** Momentary LUFS, one value per 100 ms step (400 ms window). Capped at −60. */
  momentaryLUFS: number[];
  /** Short-term LUFS, one value per 1 s step (3 s window). Capped at −60. */
  shortTermLUFS: number[];

  // ── Mastering suggestions ──────────────────────────────────────────────────
  gainSuggestions: {
    /** Gain in dB to reach −14 LUFS (Spotify, Apple Music, YouTube). */
    streaming: number;
    /** Gain in dB to reach −23 LUFS (EBU R128 broadcast). */
    broadcast: number;
    /** Gain in dB to reach −24 LUFS (SMPTE film). */
    film: number;
    /** Max available headroom before True Peak hits −1 dBTP. */
    headroom: number;
  };

  // ── File info ──────────────────────────────────────────────────────────────
  durationSeconds: number;
  sampleRate: number;
  channels: number;
}

// ── Worker message protocol ────────────────────────────────────────────────────

export interface WorkerInMessage {
  /** Transferable Float32Array buffers, one per channel. */
  channelBuffers: ArrayBuffer[];
  sampleRate: number;
  duration: number;
}

export type WorkerOutMessage =
  | { type: 'progress'; phase: string; percent: number }
  | { type: 'result';   report: AudioAnalysisReport }
  | { type: 'error';    message: string };

// ── Public observable event types ─────────────────────────────────────────────

export type AnalysisProgress = { type: 'progress'; phase: string; percent: number };
export type AnalysisResult   = { type: 'result';   report: AudioAnalysisReport };
export type AnalysisEvent    = AnalysisProgress | AnalysisResult;
