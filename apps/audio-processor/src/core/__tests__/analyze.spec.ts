import {
  computeQuality,
  blockLoudness,
  truePeakLinear,
  mixToMono,
} from '../analyze';
import { extractPeaks } from '@sh3pherd/shared-types';

/**
 * Unit tests for the pure math functions exported from analyze.ts.
 *
 * The main `analyzeAudioFile` function requires ffmpeg + essentia
 * (system deps) and is better tested via integration tests. These
 * unit tests cover the deterministic DSP/math functions that can
 * be tested with synthetic inputs.
 */

describe('computeQuality', () => {
  const base = {
    integratedLUFS: -14,
    loudnessRange: 8,
    truePeakdBTP: -1.5,
    SNRdB: 55,
    clippingRatio: 0,
    bpm: null,
    key: null,
    keyScale: null,
    keyStrength: null,
    durationSeconds: 180,
    sampleRate: 44100,
  };

  it('returns 4 for pristine audio (no clipping, high SNR, true peak < -1)', () => {
    expect(computeQuality({ ...base, clippingRatio: 0, SNRdB: 55, truePeakdBTP: -1.5 })).toBe(4);
  });

  it('returns 3 for good audio (low clipping, decent SNR)', () => {
    expect(computeQuality({ ...base, clippingRatio: 0.003, SNRdB: 40, truePeakdBTP: -0.5 })).toBe(3);
  });

  it('returns 2 for acceptable audio (moderate clipping, low SNR)', () => {
    expect(computeQuality({ ...base, clippingRatio: 0.01, SNRdB: 25, truePeakdBTP: 0 })).toBe(2);
  });

  it('returns 1 for poor audio (heavy clipping or very low SNR)', () => {
    expect(computeQuality({ ...base, clippingRatio: 0.05, SNRdB: 10, truePeakdBTP: 0 })).toBe(1);
  });

  it('returns 3 when clipping is low but true peak is above -1 dBTP', () => {
    // Quality 4 requires truePeakdBTP < -1, so this should be 3
    expect(computeQuality({ ...base, clippingRatio: 0, SNRdB: 55, truePeakdBTP: -0.5 })).toBe(3);
  });
});

describe('blockLoudness', () => {
  it('returns -Infinity for a silent block', () => {
    const silent = [new Float32Array(4000)]; // all zeros
    expect(blockLoudness(silent, 0, 4000)).toBe(-Infinity);
  });

  it('returns a finite value for a non-silent block', () => {
    const ch = new Float32Array(4000);
    for (let i = 0; i < 4000; i++) ch[i] = 0.5; // constant signal
    const result = blockLoudness([ch], 0, 4000);
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBeGreaterThan(-70); // above the absolute gate
  });

  it('handles multiple channels', () => {
    const ch1 = new Float32Array(4000).fill(0.3);
    const ch2 = new Float32Array(4000).fill(0.4);
    const result = blockLoudness([ch1, ch2], 0, 4000);
    expect(Number.isFinite(result)).toBe(true);
  });

  it('respects start offset and length', () => {
    const ch = new Float32Array(8000);
    // First half silent, second half loud
    for (let i = 4000; i < 8000; i++) ch[i] = 0.8;
    const silent = blockLoudness([ch], 0, 4000);
    const loud = blockLoudness([ch], 4000, 4000);
    expect(silent).toBe(-Infinity);
    expect(loud).toBeGreaterThan(silent);
  });
});

describe('truePeakLinear', () => {
  it('returns 0 for an empty array', () => {
    expect(truePeakLinear(new Float32Array(0))).toBe(0);
  });

  it('detects the peak of a simple signal', () => {
    const signal = new Float32Array([0, 0.5, 1.0, 0.5, 0, -0.5, -1.0, -0.5, 0]);
    const peak = truePeakLinear(signal);
    expect(peak).toBeGreaterThanOrEqual(1.0);
  });

  it('detects inter-sample peaks above the sample values', () => {
    // Two samples that, when interpolated, produce a peak above either value
    const signal = new Float32Array([0, 0.8, -0.8, 0, 0.8, -0.8, 0]);
    const peak = truePeakLinear(signal);
    // Inter-sample peak should be >= 0.8 (the highest sample)
    expect(peak).toBeGreaterThanOrEqual(0.8);
  });

  it('handles a constant signal', () => {
    const signal = new Float32Array(100).fill(0.42);
    const peak = truePeakLinear(signal);
    expect(peak).toBeCloseTo(0.42, 2);
  });
});

describe('mixToMono', () => {
  it('returns the same array for single-channel input', () => {
    const ch = new Float32Array([1, 2, 3, 4]);
    const mono = mixToMono([ch]);
    expect(mono).toBe(ch); // same reference
  });

  it('averages two channels', () => {
    const ch1 = new Float32Array([1, 0, 0.5]);
    const ch2 = new Float32Array([0, 1, 0.5]);
    const mono = mixToMono([ch1, ch2]);
    expect(mono[0]).toBeCloseTo(0.5);
    expect(mono[1]).toBeCloseTo(0.5);
    expect(mono[2]).toBeCloseTo(0.5);
  });

  it('averages three channels', () => {
    const ch1 = new Float32Array([3, 0, 0]);
    const ch2 = new Float32Array([0, 3, 0]);
    const ch3 = new Float32Array([0, 0, 3]);
    const mono = mixToMono([ch1, ch2, ch3]);
    expect(mono[0]).toBeCloseTo(1);
    expect(mono[1]).toBeCloseTo(1);
    expect(mono[2]).toBeCloseTo(1);
  });
});

describe('extractPeaks (from shared-types)', () => {
  it('returns the correct number of peaks', () => {
    const samples = new Float32Array(10000);
    const peaks = extractPeaks(samples, 100);
    expect(peaks.length).toBe(100);
  });

  it('detects the maximum in each bucket', () => {
    const samples = new Float32Array(2000);
    // Put a spike at sample 500
    samples[500] = 0.95;
    const peaks = extractPeaks(samples, 100);
    // Spike is in bucket 25 (500 / (2000/100) = 25)
    expect(peaks[25]).toBeCloseTo(0.95, 2);
  });

  it('returns all zeros for a silent signal', () => {
    const silent = new Float32Array(4000);
    const peaks = extractPeaks(silent, 50);
    peaks.forEach(p => expect(p).toBe(0));
  });

  it('handles target count larger than input', () => {
    const short = new Float32Array([0.5, -0.8, 0.3]);
    const peaks = extractPeaks(short, 10);
    // Should clamp to input length
    expect(peaks.length).toBe(3);
  });
});
