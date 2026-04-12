import { computeShiftedRate } from '../pitch-shift';

/**
 * Unit tests for the pitch-shift module.
 *
 * The full `pitchShift` function requires ffmpeg (system dep) and is
 * better tested via integration tests. These unit tests cover the
 * pure math function `computeShiftedRate`.
 */

describe('computeShiftedRate', () => {
  const SR = 44100;

  it('returns the same rate for 0 semitones', () => {
    expect(computeShiftedRate(SR, 0)).toBe(SR);
  });

  it('doubles the rate for +12 semitones (one octave up)', () => {
    expect(computeShiftedRate(SR, 12)).toBe(88200);
  });

  it('halves the rate for -12 semitones (one octave down)', () => {
    expect(computeShiftedRate(SR, -12)).toBe(22050);
  });

  it('computes correctly for +1 semitone', () => {
    // 44100 * 2^(1/12) ≈ 46722
    const result = computeShiftedRate(SR, 1);
    expect(result).toBeGreaterThan(46700);
    expect(result).toBeLessThan(46750);
  });

  it('computes correctly for -1 semitone', () => {
    // 44100 * 2^(-1/12) ≈ 41624
    const result = computeShiftedRate(SR, -1);
    expect(result).toBeGreaterThan(41600);
    expect(result).toBeLessThan(41650);
  });

  it('returns an integer (no fractional sample rates)', () => {
    for (let s = -12; s <= 12; s++) {
      const rate = computeShiftedRate(SR, s);
      expect(Number.isInteger(rate)).toBe(true);
    }
  });

  it('works with 48000 Hz source', () => {
    expect(computeShiftedRate(48000, 12)).toBe(96000);
    expect(computeShiftedRate(48000, -12)).toBe(24000);
    expect(computeShiftedRate(48000, 0)).toBe(48000);
  });

  it('handles large shifts (+24 semitones = 2 octaves up)', () => {
    expect(computeShiftedRate(SR, 24)).toBe(176400);
  });

  it('is symmetrical: +N then -N returns to original', () => {
    // Due to rounding, test with integer-friendly shifts
    const up = computeShiftedRate(SR, 12);
    const back = computeShiftedRate(up, -12);
    expect(back).toBe(SR);
  });
});
