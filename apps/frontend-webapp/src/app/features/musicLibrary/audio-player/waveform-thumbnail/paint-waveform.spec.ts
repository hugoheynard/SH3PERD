import { paintWaveform } from './paint-waveform';

/**
 * Minimal `<canvas>` double: we don't need real pixel output — we just
 * want to verify the function calls the right 2D context methods in the
 * right order with sensible arguments.
 */
function fakeCanvas(width = 60, height = 20) {
  const calls: Array<{ fn: string; args: unknown[] }> = [];
  const ctx = {
    scale: (...args: unknown[]) => calls.push({ fn: 'scale', args }),
    clearRect: (...args: unknown[]) => calls.push({ fn: 'clearRect', args }),
    fillRect: (...args: unknown[]) => calls.push({ fn: 'fillRect', args }),
    set fillStyle(v: string) { calls.push({ fn: 'fillStyle', args: [v] }); },
    get fillStyle() { return ''; },
  };
  const canvas = {
    width: 0,
    height: 0,
    clientWidth: width,
    clientHeight: height,
    getContext: () => ctx,
  } as unknown as HTMLCanvasElement;
  return { canvas, calls };
}

describe('paintWaveform', () => {
  beforeEach(() => {
    // Ensure devicePixelRatio is deterministic across CI environments.
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });
  });

  it('scales the backing store by devicePixelRatio', () => {
    const { canvas, calls } = fakeCanvas(60, 20);
    paintWaveform(canvas, new Float32Array([0.5, 0.9, 0.1]), {
      accentColor: '#06a4a4',
      bgColor: 'transparent',
    });
    expect(canvas.width).toBe(120);
    expect(canvas.height).toBe(40);
    expect(calls.some(c => c.fn === 'scale' && c.args[0] === 2 && c.args[1] === 2)).toBeTrue();
  });

  it('does nothing when clientWidth or clientHeight is 0', () => {
    const { canvas, calls } = fakeCanvas(0, 20);
    paintWaveform(canvas, new Float32Array([0.5]), {
      accentColor: '#000',
      bgColor: 'transparent',
    });
    expect(calls.length).toBe(0);
  });

  it('skips the background fill when bgColor is transparent', () => {
    const { canvas, calls } = fakeCanvas();
    paintWaveform(canvas, new Float32Array([0.5]), {
      accentColor: '#000',
      bgColor: 'transparent',
    });
    // clearRect is always called; fillRect is called per bar — but no
    // full-surface fillRect covering the whole canvas as a background.
    const firstFill = calls.find(c => c.fn === 'fillRect');
    expect(firstFill).toBeDefined();
    // A background fill would span the full (cssW, cssH).
    const isFullSurface = firstFill?.args[2] === 60 && firstFill?.args[3] === 20;
    expect(isFullSurface).toBeFalse();
  });

  it('fills the background first when bgColor is opaque', () => {
    const { canvas, calls } = fakeCanvas();
    paintWaveform(canvas, new Float32Array([0.5]), {
      accentColor: '#06a4a4',
      bgColor: '#000',
    });
    const firstFill = calls.find(c => c.fn === 'fillRect')!;
    expect(firstFill.args).toEqual([0, 0, 60, 20]);
  });

  it('draws one bar per pixel column when peaks exceed the width', () => {
    const { canvas, calls } = fakeCanvas(10, 20); // 10 pixel columns
    paintWaveform(canvas, new Float32Array(100).fill(0.5), {
      accentColor: '#06a4a4',
      bgColor: 'transparent',
    });
    const bars = calls.filter(c => c.fn === 'fillRect');
    expect(bars.length).toBe(10);
  });

  it('keeps a visible bar even when amplitude is near zero', () => {
    const { canvas, calls } = fakeCanvas(4, 10);
    paintWaveform(canvas, new Float32Array(4).fill(0), {
      accentColor: '#06a4a4',
      bgColor: 'transparent',
    });
    const bars = calls.filter(c => c.fn === 'fillRect');
    // barH = Math.max(1, 0 * ...) → at least 1 px per bar → height = 2
    for (const b of bars) expect(b.args[3]).toBeGreaterThan(0);
  });
});
