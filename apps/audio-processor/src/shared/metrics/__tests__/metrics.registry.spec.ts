import { measure, registry, stageDurationHistogram } from '../metrics.registry';

async function hits(
  op: string,
  stage: string,
  outcome: 'success' | 'error',
): Promise<number> {
  const metrics = await registry.getMetricsAsJSON();
  const histogram = metrics.find(
    (m) => m.name === 'audio_processor_stage_duration_seconds',
  );
  if (!histogram) return 0;
  const values = (histogram as { values: Array<Record<string, unknown>> })
    .values;
  for (const v of values) {
    if (
      v['metricName'] === 'audio_processor_stage_duration_seconds_count' &&
      v['labels'] &&
      typeof v['labels'] === 'object'
    ) {
      const l = v['labels'] as Record<string, string>;
      if (l['op'] === op && l['stage'] === stage && l['outcome'] === outcome) {
        return v['value'] as number;
      }
    }
  }
  return 0;
}

describe('audio_processor_stage_duration_seconds', () => {
  beforeEach(() => {
    stageDurationHistogram.reset();
  });

  it('records a `success` observation when the wrapped fn resolves', async () => {
    await measure('analyze', 's3_download', () => Promise.resolve('ok'));
    expect(await hits('analyze', 's3_download', 'success')).toBe(1);
    expect(await hits('analyze', 's3_download', 'error')).toBe(0);
  });

  it('records an `error` observation when the wrapped fn rejects, and re-throws', async () => {
    await expect(
      measure('master', 'ffmpeg_loudnorm', () =>
        Promise.reject(new Error('boom')),
      ),
    ).rejects.toThrow('boom');

    expect(await hits('master', 'ffmpeg_loudnorm', 'success')).toBe(0);
    expect(await hits('master', 'ffmpeg_loudnorm', 'error')).toBe(1);
  });

  it('tags each observation with op + stage so different pipelines stay separate', async () => {
    await measure('pitch_shift', 's3_download', () => Promise.resolve(null));
    await measure('ai_master', 's3_download', () => Promise.resolve(null));

    expect(await hits('pitch_shift', 's3_download', 'success')).toBe(1);
    expect(await hits('ai_master', 's3_download', 'success')).toBe(1);
  });

  it('accumulates across calls in the same bucket', async () => {
    await measure('analyze', 'wasm_analysis', () => Promise.resolve(1));
    await measure('analyze', 'wasm_analysis', () => Promise.resolve(2));
    await measure('analyze', 'wasm_analysis', () => Promise.resolve(3));
    expect(await hits('analyze', 'wasm_analysis', 'success')).toBe(3);
  });
});
